import { 
  PartnerRepository, 
  AppointmentRepository, 
  FinancialEntryRepository, 
  BankAccountRepository 
} from '../repositories'
import { 
  Partner, 
  PartnerWithRelations, 
  Appointment, 
  FinancialEntry, 
  CreateFinancialEntryData 
} from '../types/entities'
import { 
  PartnershipType, 
  AppointmentStatus, 
  FinancialEntryType, 
  FinancialEntryStatus, 
  PaymentMethod 
} from '../types/shared'
import { convertPrismaDecimal } from '../utils/typeConverters'

export interface SettlementPeriod {
  startDate: Date
  endDate: Date
  description?: string
}

export interface PartnerSettlement {
  partnerId: string
  partner: Partner
  period: SettlementPeriod
  appointmentsCount: number
  totalRevenue: number
  partnerShare: number
  clinicShare: number
  deductions: PartnerDeduction[]
  netAmount: number
  status: 'PENDING' | 'CALCULATED' | 'PAID'
  appointments: SettlementAppointment[]
}

export interface SettlementAppointment {
  appointmentId: string
  patientName: string
  serviceName: string
  servicePrice: number
  partnerPrice: number
  date: Date
  partnerShare: number
  clinicShare: number
}

export interface PartnerDeduction {
  type: 'SUBLEASE' | 'TAX' | 'DISCOUNT' | 'ADVANCE' | 'OTHER'
  description: string
  amount: number
  automatic: boolean
  referenceId?: string
}

export interface SettlementReport {
  period: SettlementPeriod
  totalPartners: number
  totalRevenue: number
  totalPartnerShare: number
  totalClinicShare: number
  settlementsGenerated: number
  partnerSettlements: PartnerSettlement[]
}

export interface MonthlySubleaseEntry {
  partnerId: string
  partnerName: string
  subleaseAmount: number
  dueDate: Date
  status: 'PENDING' | 'PAID'
}

export class PartnerSettlementService {
  constructor(
    private partnerRepository: PartnerRepository,
    private appointmentRepository: AppointmentRepository,
    private financialEntryRepository: FinancialEntryRepository,
    private bankAccountRepository: BankAccountRepository
  ) {}

  // 💰 CÁLCULO DE REPASSES POR PORCENTAGEM

  async calculatePercentageSettlement(
    partnerId: string,
    period: SettlementPeriod
  ): Promise<PartnerSettlement> {
    const partner = await this.partnerRepository.findById(partnerId)
    if (!partner) {
      throw new Error('Parceiro não encontrado')
    }

    if (partner.partnershipType !== PartnershipType.PERCENTAGE) {
      throw new Error('Este parceiro não trabalha por porcentagem')
    }

    // Buscar consultas pagas no período
    console.log('🔍 Debug Settlement - Buscando appointments para:', {
      partnerId,
      startDate: period.startDate,
      endDate: period.endDate,
      status: AppointmentStatus.COMPLETED
    })
    
    const appointments = await this.appointmentRepository.findByPartnerAndPeriod(
      partnerId,
      period.startDate,
      period.endDate
    )
    
    console.log('📊 Debug Settlement - Appointments encontrados:', appointments.length)

    const settlementAppointments: SettlementAppointment[] = []
    let totalRevenue = 0
    let totalPartnerShare = 0

    for (const appointment of appointments) {
      if (!appointment.productService || !appointment.patient) continue

      const servicePrice = Number(appointment.productService.salePrice)
      const partnerPrice = Number(appointment.productService.partnerPrice || 0)
      
      // Calcular repasse baseado na porcentagem do parceiro
      const partnerShare = (servicePrice * (partner.percentageRate || 0)) / 100
      const clinicShare = servicePrice - partnerShare

      settlementAppointments.push({
        appointmentId: appointment.id,
        patientName: appointment.patient.fullName,
        serviceName: appointment.productService.name,
        servicePrice,
        partnerPrice,
        date: appointment.date,
        partnerShare,
        clinicShare
      })

      totalRevenue += servicePrice
      totalPartnerShare += partnerShare
    }

    // Calcular deduções automáticas
    const deductions = await this.calculateAutomaticDeductions(
      partnerId,
      period,
      totalPartnerShare
    )

    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0)
    const netAmount = totalPartnerShare - totalDeductions

    return {
      partnerId,
      partner,
      period,
      appointmentsCount: settlementAppointments.length,
      totalRevenue,
      partnerShare: totalPartnerShare,
      clinicShare: totalRevenue - totalPartnerShare,
      deductions,
      netAmount,
      status: 'CALCULATED',
      appointments: settlementAppointments
    }
  }

  // 🏢 CÁLCULO DE SUBLOCAÇÃO

  async calculateSubleaseSettlement(
    partnerId: string,
    period: SettlementPeriod
  ): Promise<PartnerSettlement> {
    const partner = await this.partnerRepository.findById(partnerId)
    if (!partner) {
      throw new Error('Parceiro não encontrado')
    }

    if (partner.partnershipType !== PartnershipType.SUBLEASE) {
      throw new Error('Este parceiro não trabalha por sublocação')
    }

    // Para sublocação, buscar todas as consultas do período
    const appointments = await this.appointmentRepository.findByPartnerAndPeriod(
      partnerId,
      period.startDate,
      period.endDate,
      { status: AppointmentStatus.COMPLETED }
    )

    const settlementAppointments: SettlementAppointment[] = []
    let totalRevenue = 0

    for (const appointment of appointments) {
      if (!appointment.productService || !appointment.patient) continue

      const servicePrice = Number(appointment.productService.salePrice)
      
      // Na sublocação, o parceiro fica com 100% da receita menos a taxa de sublocação
      const partnerShare = servicePrice
      const clinicShare = 0 // A clínica recebe apenas a taxa de sublocação

      settlementAppointments.push({
        appointmentId: appointment.id,
        patientName: appointment.patient.fullName,
        serviceName: appointment.productService.name,
        servicePrice,
        partnerPrice: servicePrice,
        date: appointment.date,
        partnerShare,
        clinicShare
      })

      totalRevenue += servicePrice
    }

    // Calcular taxa de sublocação (dedução automática)
    const subleaseAmount = Number(partner.subleaseAmount || 0)
    const deductions: PartnerDeduction[] = [{
      type: 'SUBLEASE',
      description: 'Taxa de Sublocação Mensal',
      amount: subleaseAmount,
      automatic: true
    }]

    const netAmount = totalRevenue - subleaseAmount

    return {
      partnerId,
      partner,
      period,
      appointmentsCount: settlementAppointments.length,
      totalRevenue,
      partnerShare: totalRevenue,
      clinicShare: subleaseAmount, // A clínica recebe apenas a taxa
      deductions,
      netAmount,
      status: 'CALCULATED',
      appointments: settlementAppointments
    }
  }

  // 🤝 CÁLCULO DE PARCERIA COM PRODUTOS

  async calculatePercentageWithProductsSettlement(
    partnerId: string,
    period: SettlementPeriod
  ): Promise<PartnerSettlement> {
    const partner = await this.partnerRepository.findById(partnerId)
    if (!partner) {
      throw new Error('Parceiro não encontrado')
    }

    if (partner.partnershipType !== PartnershipType.PERCENTAGE_WITH_PRODUCTS) {
      throw new Error('Este parceiro não trabalha por porcentagem com produtos')
    }

    // Buscar consultas do período
    const appointments = await this.appointmentRepository.findByPartnerAndPeriod(
      partnerId,
      period.startDate,
      period.endDate,
      { status: AppointmentStatus.COMPLETED }
    )

    const settlementAppointments: SettlementAppointment[] = []
    let totalRevenue = 0
    let totalPartnerShare = 0

    for (const appointment of appointments) {
      if (!appointment.productService || !appointment.patient) continue

      const servicePrice = Number(appointment.productService.salePrice)
      const partnerPrice = Number(appointment.productService.partnerPrice || 0)
      
      // Na parceria fixa, usa o valor específico definido no serviço
      const partnerShare = partnerPrice
      const clinicShare = servicePrice - partnerPrice

      settlementAppointments.push({
        appointmentId: appointment.id,
        patientName: appointment.patient.fullName,
        serviceName: appointment.productService.name,
        servicePrice,
        partnerPrice,
        date: appointment.date,
        partnerShare,
        clinicShare
      })

      totalRevenue += servicePrice
      totalPartnerShare += partnerShare
    }

    // Sem deduções automáticas para parceria fixa
    const deductions: PartnerDeduction[] = []
    const netAmount = totalPartnerShare

    return {
      partnerId,
      partner,
      period,
      appointmentsCount: settlementAppointments.length,
      totalRevenue,
      partnerShare: totalPartnerShare,
      clinicShare: totalRevenue - totalPartnerShare,
      deductions,
      netAmount,
      status: 'CALCULATED',
      appointments: settlementAppointments
    }
  }

  // 🔄 GERAÇÃO AUTOMÁTICA DE LANÇAMENTOS

  async generateSettlementEntries(
    settlement: PartnerSettlement,
    bankAccountId: string,
    generatePayment: boolean = true
  ): Promise<FinancialEntry[]> {
    const entries: FinancialEntry[] = []
    const { partner, period, netAmount, clinicShare } = settlement

    // 1. Lançamento de receita para a clínica (parte da clínica)
    if (clinicShare > 0) {
      const clinicRevenueEntry: CreateFinancialEntryData = {
        bankAccountId,
        type: FinancialEntryType.INCOME,
        category: 'Consultas',
        subcategory: `${partner.fullName} - Repasse`,
        description: `Repasse Clínica - ${partner.fullName} (${period.startDate.toLocaleDateString()} a ${period.endDate.toLocaleDateString()})`,
        amount: clinicShare,
        dueDate: new Date(),
        paidDate: new Date(),
        status: FinancialEntryStatus.PAID,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        partnerId: partner.id,
        referenceType: 'partner_settlement',
        notes: `Acerto automático - ${settlement.appointmentsCount} consultas`
      }

      const clinicEntry = await this.financialEntryRepository.create(clinicRevenueEntry)
      entries.push({
        ...clinicEntry,
        amount: convertPrismaDecimal(clinicEntry.amount)
      })
    }

    // 2. Lançamento de despesa para pagamento ao parceiro (se aplicável)
    if (generatePayment && netAmount > 0) {
      const partnerPaymentEntry: CreateFinancialEntryData = {
        bankAccountId,
        type: FinancialEntryType.EXPENSE,
        category: 'Pessoal',
        subcategory: 'Comissões',
        description: `Pagamento a Parceiro - ${partner.fullName} (${period.startDate.toLocaleDateString()} a ${period.endDate.toLocaleDateString()})`,
        amount: netAmount,
        dueDate: new Date(),
        status: FinancialEntryStatus.PENDING,
        partnerId: partner.id,
        referenceType: 'partner_payment',
        notes: `Líquido: R$ ${netAmount.toFixed(2)} de ${settlement.appointmentsCount} consultas`
      }

      const paymentEntry = await this.financialEntryRepository.create(partnerPaymentEntry)
      entries.push({
        ...paymentEntry,
        amount: convertPrismaDecimal(paymentEntry.amount)
      })
    }

    // 3. Lançamentos de deduções
    for (const deduction of settlement.deductions) {
      if (deduction.amount > 0) {
        const deductionEntry: CreateFinancialEntryData = {
          bankAccountId,
          type: FinancialEntryType.INCOME,
          category: deduction.type === 'SUBLEASE' ? 'Outras Receitas' : 'Serviços',
          subcategory: deduction.type === 'SUBLEASE' ? 'Sublocação' : 'Descontos',
          description: `${deduction.description} - ${partner.fullName}`,
          amount: deduction.amount,
          dueDate: new Date(),
          paidDate: new Date(),
          status: FinancialEntryStatus.PAID,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          partnerId: partner.id,
          referenceType: 'partner_deduction',
          notes: deduction.automatic ? 'Dedução automática' : 'Dedução manual'
        }

        const entry = await this.financialEntryRepository.create(deductionEntry)
        entries.push({
          ...entry,
          amount: convertPrismaDecimal(entry.amount)
        })
      }
    }

    // Recalcular saldo da conta
    await this.bankAccountRepository.recalculateBalance(bankAccountId)

    return entries
  }

  // 📅 GERAÇÃO AUTOMÁTICA DE SUBLOCAÇÃO MENSAL

  async generateMonthlySubleases(
    month: number,
    year: number,
    bankAccountId: string
  ): Promise<MonthlySubleaseEntry[]> {
    const partners = await this.partnerRepository.findAll({
      partnershipType: PartnershipType.SUBLEASE,
      active: true
    })

    const monthlyEntries: MonthlySubleaseEntry[] = []

    for (const partner of partners) {
      const subleaseAmount = Number(partner.subleaseAmount || 0)
      if (subleaseAmount <= 0) continue

      const paymentDay = partner.subleasePaymentDay || 5
      const dueDate = new Date(year, month - 1, paymentDay)

      // Verificar se já existe lançamento para este mês
      const existingEntry = await this.financialEntryRepository.findAll({
        partnerId: partner.id,
        category: 'Outras Receitas',
        subcategory: 'Sublocação',
        startDate: new Date(year, month - 1, 1),
        endDate: new Date(year, month, 0)
      })

      if (existingEntry.length > 0) {
        console.log(`Sublocação já existe para ${partner.fullName} em ${month}/${year}`)
        continue
      }

      // Criar lançamento de sublocação
      const subleaseEntry: CreateFinancialEntryData = {
        bankAccountId,
        type: FinancialEntryType.INCOME,
        category: 'Outras Receitas',
        subcategory: 'Sublocação',
        description: `Sublocação ${partner.fullName} - ${new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        amount: subleaseAmount,
        dueDate,
        status: FinancialEntryStatus.PENDING,
        partnerId: partner.id,
        referenceType: 'monthly_sublease',
        recurring: true,
        notes: `Taxa mensal de sublocação - Vencimento todo dia ${paymentDay}`
      }

      try {
        await this.financialEntryRepository.create(subleaseEntry)
        
        monthlyEntries.push({
          partnerId: partner.id,
          partnerName: partner.fullName,
          subleaseAmount,
          dueDate,
          status: 'PENDING'
        })

        console.log(`✅ Criada sublocação: ${partner.fullName} - R$ ${subleaseAmount}`)
      } catch (error) {
        console.error(`❌ Erro ao criar sublocação para ${partner.fullName}:`, error)
      }
    }

    // Recalcular saldo se algum lançamento foi criado
    if (monthlyEntries.length > 0) {
      await this.bankAccountRepository.recalculateBalance(bankAccountId)
    }

    return monthlyEntries
  }

  // 📊 RELATÓRIO GERAL DE ACERTOS

  async generateSettlementReport(
    period: SettlementPeriod,
    partnerIds?: string[]
  ): Promise<SettlementReport> {
    let partners: PartnerWithRelations[]

    if (partnerIds && partnerIds.length > 0) {
      partners = []
      for (const id of partnerIds) {
        const partner = await this.partnerRepository.findById(id)
        if (partner) partners.push(partner)
      }
    } else {
      partners = await this.partnerRepository.findAll({ active: true })
    }

    const partnerSettlements: PartnerSettlement[] = []
    let totalRevenue = 0
    let totalPartnerShare = 0
    let totalClinicShare = 0

    for (const partner of partners) {
      try {
        let settlement: PartnerSettlement

        switch (partner.partnershipType) {
          case PartnershipType.PERCENTAGE:
            settlement = await this.calculatePercentageSettlement(partner.id, period)
            break
          case PartnershipType.SUBLEASE:
            settlement = await this.calculateSubleaseSettlement(partner.id, period)
            break
          case PartnershipType.PERCENTAGE_WITH_PRODUCTS:
            settlement = await this.calculatePercentageWithProductsSettlement(partner.id, period)
            break
          default:
            continue
        }

        partnerSettlements.push(settlement)
        totalRevenue += settlement.totalRevenue
        totalPartnerShare += settlement.partnerShare
        totalClinicShare += settlement.clinicShare

      } catch (error) {
        console.error(`Erro ao calcular acerto para ${partner.fullName}:`, error)
      }
    }

    return {
      period,
      totalPartners: partnerSettlements.length,
      totalRevenue,
      totalPartnerShare,
      totalClinicShare,
      settlementsGenerated: partnerSettlements.length,
      partnerSettlements
    }
  }

  // 🔧 MÉTODOS AUXILIARES

  private async calculateAutomaticDeductions(
    partnerId: string,
    period: SettlementPeriod,
    totalPartnerShare: number
  ): Promise<PartnerDeduction[]> {
    const deductions: PartnerDeduction[] = []

    // Buscar adiantamentos não quitados
    const advances = await this.financialEntryRepository.findAll({
      partnerId,
      category: 'Pessoal',
      subcategory: 'Adiantamentos',
      status: FinancialEntryStatus.PENDING,
      type: FinancialEntryType.EXPENSE
    })

    for (const advance of advances) {
      deductions.push({
        type: 'ADVANCE',
        description: `Desconto Adiantamento - ${advance.description}`,
        amount: Number(advance.amount),
        automatic: true,
        referenceId: advance.id
      })
    }

    // Outras deduções automáticas podem ser adicionadas aqui
    // Ex: impostos, taxas, etc.

    return deductions
  }

  async getPartnerBalance(partnerId: string): Promise<{
    totalEarned: number
    totalPaid: number
    pendingPayment: number
    lastSettlementDate?: Date
  }> {
    // Total ganho (repasses)
    const earnedEntries = await this.financialEntryRepository.findAll({
      partnerId,
      type: FinancialEntryType.INCOME,
      status: FinancialEntryStatus.PAID
    })

    const totalEarned = earnedEntries.reduce((sum, entry) => sum + Number(entry.amount), 0)

    // Total pago ao parceiro
    const paidEntries = await this.financialEntryRepository.findAll({
      partnerId,
      type: FinancialEntryType.EXPENSE,
      category: 'Pessoal',
      status: FinancialEntryStatus.PAID
    })

    const totalPaid = paidEntries.reduce((sum, entry) => sum + Number(entry.amount), 0)

    // Pendente de pagamento
    const pendingEntries = await this.financialEntryRepository.findAll({
      partnerId,
      type: FinancialEntryType.EXPENSE,
      category: 'Pessoal',
      status: FinancialEntryStatus.PENDING
    })

    const pendingPayment = pendingEntries.reduce((sum, entry) => sum + Number(entry.amount), 0)

    // Último acerto
    const lastEntry = paidEntries.sort((a, b) => 
      new Date(b.paidDate || b.createdAt).getTime() - new Date(a.paidDate || a.createdAt).getTime()
    )[0]

    return {
      totalEarned,
      totalPaid,
      pendingPayment,
      lastSettlementDate: lastEntry ? (lastEntry.paidDate || lastEntry.createdAt) : undefined
    }
  }
}
