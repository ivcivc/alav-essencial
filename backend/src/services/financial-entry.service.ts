import { FinancialEntryRepository, BankAccountRepository, AppointmentRepository } from '../repositories'
import { 
  FinancialEntry,
  FinancialEntryWithRelations,
  CreateFinancialEntryData, 
  UpdateFinancialEntryData,
  FinancialEntryFilters,
  FinancialEntryType,
  FinancialEntryStatus,
  PaymentMethod
} from '../types'
import { convertPrismaDecimal } from '../utils/typeConverters'

export class FinancialEntryService {
  constructor(
    private financialEntryRepository: FinancialEntryRepository,
    private bankAccountRepository: BankAccountRepository,
    private appointmentRepository: AppointmentRepository
  ) {}

  async getAllFinancialEntries(filters: FinancialEntryFilters = {}): Promise<FinancialEntryWithRelations[]> {
    const entries = await this.financialEntryRepository.findAll(filters)
    
    return entries.map(entry => ({
      ...entry,
      amount: convertPrismaDecimal(entry.amount)
    }))
  }

  async getFinancialEntryById(id: string): Promise<FinancialEntryWithRelations | null> {
    const entry = await this.financialEntryRepository.findById(id)
    
    if (!entry) {
      return null
    }

    return {
      ...entry,
      amount: convertPrismaDecimal(entry.amount)
    }
  }

  async createFinancialEntry(data: CreateFinancialEntryData): Promise<FinancialEntry> {
    // Verificar se a conta bancária existe
    const bankAccount = await this.bankAccountRepository.findById(data.bankAccountId)
    if (!bankAccount) {
      throw new Error('Conta bancária não encontrada')
    }

    // Validar dados
    if (data.amount <= 0) {
      throw new Error('O valor deve ser maior que zero')
    }

    // Validar data de vencimento
    if (data.dueDate < new Date('2020-01-01')) {
      throw new Error('Data de vencimento inválida')
    }

    // Se status é PAID, definir data de pagamento se não fornecida
    let entryData = { ...data }
    if (data.status === FinancialEntryStatus.PAID && !data.paidDate) {
      entryData.paidDate = new Date()
    }

    const createdEntry = await this.financialEntryRepository.create(entryData)

    // Se o lançamento foi criado como pago, atualizar saldo da conta
    if (createdEntry.status === 'PAID') {
      await this.bankAccountRepository.recalculateBalance(createdEntry.bankAccountId)
    }

    return {
      ...createdEntry,
      amount: convertPrismaDecimal(createdEntry.amount)
    }
  }

  async updateFinancialEntry(id: string, data: UpdateFinancialEntryData): Promise<FinancialEntry> {
    // Verificar se o lançamento existe
    const existingEntry = await this.financialEntryRepository.findById(id)
    if (!existingEntry) {
      throw new Error('Lançamento financeiro não encontrado')
    }

    // Se mudando conta bancária, verificar se a nova conta existe
    if (data.bankAccountId && data.bankAccountId !== existingEntry.bankAccountId) {
      const bankAccount = await this.bankAccountRepository.findById(data.bankAccountId)
      if (!bankAccount) {
        throw new Error('Conta bancária não encontrada')
      }
    }

    // Validar valor se fornecido
    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error('O valor deve ser maior que zero')
    }

    const oldBankAccountId = existingEntry.bankAccountId
    const oldStatus = existingEntry.status

    const updatedEntry = await this.financialEntryRepository.update(id, data)

    // 🔄 Sincronização bidirecional com agendamentos
    if (oldStatus !== updatedEntry.status && updatedEntry.referenceType === 'APPOINTMENT' && updatedEntry.referenceId) {
      console.log(`🔄 Iniciando sincronização: Lançamento ${updatedEntry.id} mudou de ${oldStatus} → ${updatedEntry.status}`)
      await this.syncAppointmentStatus(updatedEntry.referenceId, updatedEntry.status, oldStatus)
    }

    // Recalcular saldo da conta bancária se:
    // 1. Status mudou para/de PAID
    // 2. Valor foi alterado e status é PAID
    // 3. Tipo foi alterado e status é PAID
    // 4. Conta bancária foi alterada
    const shouldRecalculate = 
      (oldStatus !== updatedEntry.status) ||
      (updatedEntry.status === 'PAID' && (data.amount !== undefined || data.type !== undefined)) ||
      (data.bankAccountId && data.bankAccountId !== oldBankAccountId)

    if (shouldRecalculate) {
      // Recalcular conta antiga se mudou de conta
      if (data.bankAccountId && data.bankAccountId !== oldBankAccountId) {
        await this.bankAccountRepository.recalculateBalance(oldBankAccountId)
      }
      // Recalcular conta atual
      await this.bankAccountRepository.recalculateBalance(updatedEntry.bankAccountId)
    }

    return {
      ...updatedEntry,
      amount: convertPrismaDecimal(updatedEntry.amount)
    }
  }

  async deleteFinancialEntry(id: string): Promise<void> {
    // Verificar se o lançamento existe
    const existingEntry = await this.financialEntryRepository.findById(id)
    if (!existingEntry) {
      throw new Error('Lançamento financeiro não encontrado')
    }

    const bankAccountId = existingEntry.bankAccountId
    const wasPaid = existingEntry.status === 'PAID'

    await this.financialEntryRepository.delete(id)

    // Se o lançamento estava pago, recalcular saldo da conta
    if (wasPaid) {
      await this.bankAccountRepository.recalculateBalance(bankAccountId)
    }
  }

  async markAsPaid(id: string, paidDate?: Date, paymentMethod?: PaymentMethod): Promise<FinancialEntry> {
    // Verificar se o lançamento existe
    const existingEntry = await this.financialEntryRepository.findById(id)
    if (!existingEntry) {
      throw new Error('Lançamento financeiro não encontrado')
    }

    if (existingEntry.status === 'PAID') {
      throw new Error('Este lançamento já está marcado como pago')
    }

    const updatedEntry = await this.financialEntryRepository.markAsPaid(
      id, 
      paidDate || new Date(), 
      paymentMethod
    )

    // Recalcular saldo da conta bancária
    await this.bankAccountRepository.recalculateBalance(updatedEntry.bankAccountId)

    return {
      ...updatedEntry,
      amount: convertPrismaDecimal(updatedEntry.amount)
    }
  }

  async markAsCancelled(id: string): Promise<FinancialEntry> {
    // Verificar se o lançamento existe
    const existingEntry = await this.financialEntryRepository.findById(id)
    if (!existingEntry) {
      throw new Error('Lançamento financeiro não encontrado')
    }

    if (existingEntry.status === 'CANCELLED') {
      throw new Error('Este lançamento já está cancelado')
    }

    const wasPaid = existingEntry.status === 'PAID'
    const updatedEntry = await this.financialEntryRepository.markAsCancelled(id)

    // Se estava pago, recalcular saldo da conta bancária
    if (wasPaid) {
      await this.bankAccountRepository.recalculateBalance(updatedEntry.bankAccountId)
    }

    return {
      ...updatedEntry,
      amount: convertPrismaDecimal(updatedEntry.amount)
    }
  }

  async getOverdueEntries(): Promise<FinancialEntryWithRelations[]> {
    const entries = await this.financialEntryRepository.findOverdue()
    
    return entries.map(entry => ({
      ...entry,
      amount: convertPrismaDecimal(entry.amount)
    }))
  }

  async getPendingByDateRange(startDate: Date, endDate: Date): Promise<FinancialEntryWithRelations[]> {
    const entries = await this.financialEntryRepository.findPendingByDateRange(startDate, endDate)
    
    return entries.map(entry => ({
      ...entry,
      amount: convertPrismaDecimal(entry.amount)
    }))
  }

  async getCashFlowSummary(filters: {
    bankAccountId?: string
    startDate?: Date
    endDate?: Date
  } = {}): Promise<{
    totalIncome: number
    totalExpenses: number
    netFlow: number
    pendingIncome: number
    pendingExpenses: number
    overdueCount: number
  }> {
    const { bankAccountId, startDate, endDate } = filters

    // Calcular receitas e despesas pagas
    const totalIncome = await this.financialEntryRepository.getTotalByType(FinancialEntryType.INCOME, {
      bankAccountId,
      status: FinancialEntryStatus.PAID,
      startDate,
      endDate
    })

    const totalExpenses = await this.financialEntryRepository.getTotalByType(FinancialEntryType.EXPENSE, {
      bankAccountId,
      status: FinancialEntryStatus.PAID,
      startDate,
      endDate
    })

    // Calcular pendências
    const pendingIncome = await this.financialEntryRepository.getTotalByType(FinancialEntryType.INCOME, {
      bankAccountId,
      status: FinancialEntryStatus.PENDING,
      startDate,
      endDate
    })

    const pendingExpenses = await this.financialEntryRepository.getTotalByType(FinancialEntryType.EXPENSE, {
      bankAccountId,
      status: FinancialEntryStatus.PENDING,
      startDate,
      endDate
    })

    // Contar vencidos
    const overdueEntries = await this.getOverdueEntries()
    const overdueCount = bankAccountId 
      ? overdueEntries.filter(entry => entry.bankAccountId === bankAccountId).length
      : overdueEntries.length

    return {
      totalIncome,
      totalExpenses,
      netFlow: totalIncome - totalExpenses,
      pendingIncome,
      pendingExpenses,
      overdueCount
    }
  }

  async createRecurringEntries(parentId: string, occurrences: number, frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY'): Promise<FinancialEntry[]> {
    const parentEntry = await this.financialEntryRepository.findById(parentId)
    if (!parentEntry) {
      throw new Error('Lançamento pai não encontrado')
    }

    if (!parentEntry.recurring) {
      throw new Error('O lançamento pai deve ser marcado como recorrente')
    }

    const createdEntries: FinancialEntry[] = []
    
    for (let i = 1; i <= occurrences; i++) {
      const newDueDate = new Date(parentEntry.dueDate)
      
      switch (frequency) {
        case 'MONTHLY':
          newDueDate.setMonth(newDueDate.getMonth() + i)
          break
        case 'WEEKLY':
          newDueDate.setDate(newDueDate.getDate() + (7 * i))
          break
        case 'YEARLY':
          newDueDate.setFullYear(newDueDate.getFullYear() + i)
          break
      }

      const entryData: CreateFinancialEntryData = {
        bankAccountId: parentEntry.bankAccountId,
        type: parentEntry.type as FinancialEntryType,
        category: parentEntry.category,
        subcategory: parentEntry.subcategory,
        description: `${parentEntry.description} (${i + 1}/${occurrences + 1})`,
        amount: Number(parentEntry.amount),
        dueDate: newDueDate,
        status: FinancialEntryStatus.PENDING,
        notes: parentEntry.notes,
        referenceId: parentEntry.referenceId,
        referenceType: parentEntry.referenceType,
        partnerId: parentEntry.partnerId,
        patientId: parentEntry.patientId,
        appointmentId: parentEntry.appointmentId,
        recurring: false, // Filhos não são recorrentes
        parentEntryId: parentId
      }

      const createdEntry = await this.financialEntryRepository.create(entryData)
      createdEntries.push({
        ...createdEntry,
        amount: convertPrismaDecimal(createdEntry.amount)
      })
    }

    return createdEntries
  }

  /**
   * 🔄 Sincroniza status do agendamento quando lançamento financeiro é alterado
   */
  private async syncAppointmentStatus(
    appointmentId: string, 
    newFinancialStatus: string, 
    oldFinancialStatus: string
  ): Promise<void> {
    try {
      console.log(`🔄 Sincronizando agendamento ${appointmentId}: ${oldFinancialStatus} → ${newFinancialStatus}`)

      // Buscar o agendamento atual
      const appointment = await this.appointmentRepository.findById(appointmentId)
      if (!appointment) {
        console.warn(`⚠️ Agendamento ${appointmentId} não encontrado para sincronização`)
        return
      }

      // Buscar TODOS os lançamentos financeiros do agendamento
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()
      
      const allFinancialEntries = await prisma.financialEntry.findMany({
        where: {
          OR: [
            { referenceId: appointmentId, referenceType: 'APPOINTMENT' },
            { appointmentId: appointmentId }
          ]
        }
      })

      console.log(`📊 Encontrados ${allFinancialEntries.length} lançamentos para o agendamento`)

      // Determinar novo status do agendamento baseado nos lançamentos
      const newAppointmentStatus = this.determineAppointmentStatus(allFinancialEntries, appointment.status)

      if (newAppointmentStatus !== appointment.status) {
        console.log(`🔄 Atualizando agendamento ${appointmentId}: ${appointment.status} → ${newAppointmentStatus}`)
        
        const updateData: any = { status: newAppointmentStatus }
        
        // Se voltando de COMPLETED para IN_PROGRESS, remover checkOut
        if (appointment.status === 'COMPLETED' && newAppointmentStatus === 'IN_PROGRESS') {
          updateData.checkOut = null
        }
        
        // Se indo de IN_PROGRESS para COMPLETED, adicionar checkOut
        if (appointment.status === 'IN_PROGRESS' && newAppointmentStatus === 'COMPLETED') {
          updateData.checkOut = new Date()
        }

        await this.appointmentRepository.update(appointmentId, updateData)
        console.log(`✅ Agendamento ${appointmentId} sincronizado com sucesso`)
      } else {
        console.log(`ℹ️ Status do agendamento ${appointmentId} não precisa ser alterado`)
      }

    } catch (error) {
      console.error(`❌ Erro na sincronização do agendamento ${appointmentId}:`, error)
      // Não lançar erro para não quebrar a atualização do lançamento financeiro
    }
  }

  /**
   * 🎯 Determina o status correto do agendamento baseado nos lançamentos financeiros
   */
  private determineAppointmentStatus(
    financialEntries: any[], 
    currentAppointmentStatus: string
  ): string {
    if (financialEntries.length === 0) {
      // Sem lançamentos: manter status atual se for IN_PROGRESS, senão voltar para IN_PROGRESS
      return currentAppointmentStatus === 'IN_PROGRESS' ? currentAppointmentStatus : 'IN_PROGRESS'
    }

    // Verificar se há pelo menos um lançamento pago
    const hasPaidEntry = financialEntries.some(entry => entry.status === 'PAID')
    
    // Verificar se todos os lançamentos estão cancelados
    const allCancelled = financialEntries.every(entry => entry.status === 'CANCELLED')

    if (allCancelled) {
      // Todos cancelados: voltar para IN_PROGRESS (permite refazer checkout)
      return 'IN_PROGRESS'
    } else if (hasPaidEntry) {
      // Pelo menos um pago: COMPLETED
      return 'COMPLETED'
    } else {
      // Pendentes ou outros status: manter como IN_PROGRESS
      return 'IN_PROGRESS'
    }
  }
}
