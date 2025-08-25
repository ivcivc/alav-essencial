import { FinancialEntryRepository, BankAccountRepository } from '../repositories'
import { FinancialEntryWithRelations } from '../types/entities'
import { 
  FinancialEntryType,
  FinancialEntryStatus,
  PaymentMethod
} from '../types/shared'
import { convertPrismaDecimal } from '../utils/typeConverters'

export interface PaymentPlan {
  totalAmount: number
  installments: number
  firstDueDate: Date
  frequency: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY'
  interestRate?: number
  description: string
  category: string
  subcategory?: string
}

export interface AccountsSummary {
  totalReceivable: number
  totalPayable: number
  overdueReceivable: number
  overduePayable: number
  nextWeekReceivable: number
  nextWeekPayable: number
  thisMonthReceivable: number
  thisMonthPayable: number
}

export class AccountsPayableReceivableService {
  constructor(
    private financialEntryRepository: FinancialEntryRepository,
    private bankAccountRepository: BankAccountRepository
  ) {}

  // 📋 CONTAS A RECEBER

  async getAccountsReceivable(filters: {
    status?: FinancialEntryStatus
    startDate?: Date
    endDate?: Date
    patientId?: string
    category?: string
    page?: number
    limit?: number
  } = {}): Promise<{ data: FinancialEntryWithRelations[]; total: number }> {
    const combinedFilters = {
      ...filters,
      type: FinancialEntryType.INCOME,
      // Excluir lançamentos cancelados dos resultados
      excludeCancelled: true
    }
    
    const [data, total] = await Promise.all([
      this.financialEntryRepository.findAll(combinedFilters),
      this.financialEntryRepository.count(combinedFilters)
    ])
    
    return { data, total }
  }

  async createInstallmentReceivable(
    plan: PaymentPlan,
    bankAccountId: string,
    patientId?: string,
    appointmentId?: string
  ): Promise<FinancialEntryWithRelations[]> {
    const installmentAmount = plan.totalAmount / plan.installments
    const createdEntries: FinancialEntryWithRelations[] = []

    for (let i = 0; i < plan.installments; i++) {
      const dueDate = this.calculateInstallmentDate(plan.firstDueDate, i, plan.frequency)
      
      // Aplicar juros se configurado
      let amount = installmentAmount
      if (plan.interestRate && plan.interestRate > 0) {
        amount = installmentAmount * (1 + (plan.interestRate / 100) * i)
      }

      const entryData = {
        bankAccountId,
        type: FinancialEntryType.INCOME,
        category: plan.category,
        subcategory: plan.subcategory,
        description: `${plan.description} (${i + 1}/${plan.installments})`,
        amount,
        dueDate,
        status: FinancialEntryStatus.PENDING,
        patientId,
        appointmentId,
        recurring: plan.installments > 1,
        referenceType: 'installment_plan'
      }

      try {
        const entry = await this.financialEntryRepository.create(entryData)
        createdEntries.push({
          ...entry,
          amount: convertPrismaDecimal(entry.amount)
        })
      } catch (error) {
        console.error(`Erro ao criar parcela ${i + 1}:`, error)
      }
    }

    return createdEntries
  }

  async markReceivableAsPaid(
    entryId: string,
    paidAmount: number,
    paymentMethod: PaymentMethod,
    paidDate?: Date,
    bankAccountId?: string
  ): Promise<FinancialEntryWithRelations> {
    const entry = await this.financialEntryRepository.findById(entryId)
    if (!entry) {
      throw new Error('Lançamento não encontrado')
    }

    if (entry.type !== FinancialEntryType.INCOME) {
      throw new Error('Este lançamento não é uma conta a receber')
    }

    const originalAmount = Number(entry.amount)
    
    // Verificar se é pagamento parcial
    if (paidAmount < originalAmount) {
      // Criar novo lançamento para o valor restante
      const remainingAmount = originalAmount - paidAmount
      
      await this.financialEntryRepository.create({
        bankAccountId: entry.bankAccountId,
        type: FinancialEntryType.INCOME,
        category: entry.category,
        subcategory: entry.subcategory,
        description: `${entry.description} - Saldo Restante`,
        amount: remainingAmount,
        dueDate: entry.dueDate,
        status: FinancialEntryStatus.PENDING,
        patientId: entry.patientId,
        appointmentId: entry.appointmentId,
        parentEntryId: entry.id,
        notes: 'Criado automaticamente por pagamento parcial'
      })

      // Atualizar o lançamento original com o valor pago
      await this.financialEntryRepository.update(entryId, {
        amount: paidAmount,
        status: FinancialEntryStatus.PAID,
        paidDate: paidDate || new Date(),
        paymentMethod,
        bankAccountId: bankAccountId || entry.bankAccountId
      })
    } else {
      // Pagamento integral
      await this.financialEntryRepository.update(entryId, {
        status: FinancialEntryStatus.PAID,
        paidDate: paidDate || new Date(),
        paymentMethod,
        bankAccountId: bankAccountId || entry.bankAccountId
      })
    }

    // Recalcular saldo da conta
    const finalBankAccountId = bankAccountId || entry.bankAccountId
    await this.bankAccountRepository.recalculateBalance(finalBankAccountId)

    const updatedEntry = await this.financialEntryRepository.findById(entryId)
    return {
      ...updatedEntry!,
      amount: convertPrismaDecimal(updatedEntry!.amount)
    }
  }

  // 💳 CONTAS A PAGAR

  async getAccountsPayable(filters: {
    status?: FinancialEntryStatus
    startDate?: Date
    endDate?: Date
    partnerId?: string
    category?: string
    page?: number
    limit?: number
  } = {}): Promise<{ data: FinancialEntryWithRelations[]; total: number }> {
    const combinedFilters = {
      ...filters,
      type: FinancialEntryType.EXPENSE,
      // Excluir lançamentos cancelados dos resultados
      excludeCancelled: true
    }
    
    const [data, total] = await Promise.all([
      this.financialEntryRepository.findAll(combinedFilters),
      this.financialEntryRepository.count(combinedFilters)
    ])
    
    return { data, total }
  }

  async createInstallmentPayable(
    plan: PaymentPlan,
    bankAccountId: string,
    partnerId?: string,
    referenceId?: string
  ): Promise<FinancialEntryWithRelations[]> {
    const installmentAmount = plan.totalAmount / plan.installments
    const createdEntries: FinancialEntryWithRelations[] = []

    for (let i = 0; i < plan.installments; i++) {
      const dueDate = this.calculateInstallmentDate(plan.firstDueDate, i, plan.frequency)
      
      // Aplicar juros se configurado
      let amount = installmentAmount
      if (plan.interestRate && plan.interestRate > 0) {
        amount = installmentAmount * (1 + (plan.interestRate / 100) * i)
      }

      const entryData = {
        bankAccountId,
        type: FinancialEntryType.EXPENSE,
        category: plan.category,
        subcategory: plan.subcategory,
        description: `${plan.description} (${i + 1}/${plan.installments})`,
        amount,
        dueDate,
        status: FinancialEntryStatus.PENDING,
        partnerId,
        referenceId,
        recurring: plan.installments > 1,
        referenceType: 'installment_plan'
      }

      try {
        const entry = await this.financialEntryRepository.create(entryData)
        createdEntries.push({
          ...entry,
          amount: convertPrismaDecimal(entry.amount)
        })
      } catch (error) {
        console.error(`Erro ao criar parcela ${i + 1}:`, error)
      }
    }

    return createdEntries
  }

  async markPayableAsPaid(
    entryId: string,
    paidAmount: number,
    paymentMethod: PaymentMethod,
    paidDate?: Date,
    bankAccountId?: string
  ): Promise<FinancialEntryWithRelations> {
    const entry = await this.financialEntryRepository.findById(entryId)
    if (!entry) {
      throw new Error('Lançamento não encontrado')
    }

    if (entry.type !== FinancialEntryType.EXPENSE) {
      throw new Error('Este lançamento não é uma conta a pagar')
    }

    const originalAmount = Number(entry.amount)
    
    // Verificar se é pagamento parcial
    if (paidAmount < originalAmount) {
      // Criar novo lançamento para o valor restante
      const remainingAmount = originalAmount - paidAmount
      
      await this.financialEntryRepository.create({
        bankAccountId: entry.bankAccountId,
        type: FinancialEntryType.EXPENSE,
        category: entry.category,
        subcategory: entry.subcategory,
        description: `${entry.description} - Saldo Restante`,
        amount: remainingAmount,
        dueDate: entry.dueDate,
        status: FinancialEntryStatus.PENDING,
        partnerId: entry.partnerId,
        parentEntryId: entry.id,
        notes: 'Criado automaticamente por pagamento parcial'
      })

      // Atualizar o lançamento original com o valor pago
      await this.financialEntryRepository.update(entryId, {
        amount: paidAmount,
        status: FinancialEntryStatus.PAID,
        paidDate: paidDate || new Date(),
        paymentMethod,
        bankAccountId: bankAccountId || entry.bankAccountId
      })
    } else {
      // Pagamento integral
      await this.financialEntryRepository.update(entryId, {
        status: FinancialEntryStatus.PAID,
        paidDate: paidDate || new Date(),
        paymentMethod,
        bankAccountId: bankAccountId || entry.bankAccountId
      })
    }

    // Recalcular saldo da conta
    const finalBankAccountId = bankAccountId || entry.bankAccountId
    await this.bankAccountRepository.recalculateBalance(finalBankAccountId)

    const updatedEntry = await this.financialEntryRepository.findById(entryId)
    return {
      ...updatedEntry!,
      amount: convertPrismaDecimal(updatedEntry!.amount)
    }
  }

  // 📊 RELATÓRIOS E RESUMOS

  async getAccountsSummary(): Promise<AccountsSummary> {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Contas a receber - excluindo lançamentos cancelados
    const totalReceivable = await this.financialEntryRepository.getTotalByTypeExcludingCancelled(
      FinancialEntryType.INCOME,
      { status: FinancialEntryStatus.PENDING }
    )

    const overdueReceivable = await this.financialEntryRepository.getTotalByTypeExcludingCancelled(
      FinancialEntryType.INCOME,
      { status: FinancialEntryStatus.PENDING, endDate: now }
    )

    const nextWeekReceivable = await this.financialEntryRepository.getTotalByTypeExcludingCancelled(
      FinancialEntryType.INCOME,
      { status: FinancialEntryStatus.PENDING, startDate: now, endDate: nextWeek }
    )

    const thisMonthReceivable = await this.financialEntryRepository.getTotalByTypeExcludingCancelled(
      FinancialEntryType.INCOME,
      { status: FinancialEntryStatus.PENDING, startDate: startOfMonth, endDate: endOfMonth }
    )

    // Contas a pagar - excluindo lançamentos cancelados
    const totalPayable = await this.financialEntryRepository.getTotalByTypeExcludingCancelled(
      FinancialEntryType.EXPENSE,
      { status: FinancialEntryStatus.PENDING }
    )

    const overduePayable = await this.financialEntryRepository.getTotalByTypeExcludingCancelled(
      FinancialEntryType.EXPENSE,
      { status: FinancialEntryStatus.PENDING, endDate: now }
    )

    const nextWeekPayable = await this.financialEntryRepository.getTotalByTypeExcludingCancelled(
      FinancialEntryType.EXPENSE,
      { status: FinancialEntryStatus.PENDING, startDate: now, endDate: nextWeek }
    )

    const thisMonthPayable = await this.financialEntryRepository.getTotalByTypeExcludingCancelled(
      FinancialEntryType.EXPENSE,
      { status: FinancialEntryStatus.PENDING, startDate: startOfMonth, endDate: endOfMonth }
    )

    return {
      totalReceivable,
      totalPayable,
      overdueReceivable,
      overduePayable,
      nextWeekReceivable,
      nextWeekPayable,
      thisMonthReceivable,
      thisMonthPayable
    }
  }

  async getAgingReport(type: FinancialEntryType): Promise<{
    current: number      // 0-30 dias
    days30: number       // 31-60 dias
    days60: number       // 61-90 dias
    days90: number       // 91-120 dias
    over120: number      // Mais de 120 dias
  }> {
    const now = new Date()
    const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const days60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const days90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const days120 = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)

    const current = await this.financialEntryRepository.getTotalByType(type, {
      status: FinancialEntryStatus.PENDING,
      startDate: days30,
      endDate: now
    })

    const days30Total = await this.financialEntryRepository.getTotalByType(type, {
      status: FinancialEntryStatus.PENDING,
      startDate: days60,
      endDate: days30
    })

    const days60Total = await this.financialEntryRepository.getTotalByType(type, {
      status: FinancialEntryStatus.PENDING,
      startDate: days90,
      endDate: days60
    })

    const days90Total = await this.financialEntryRepository.getTotalByType(type, {
      status: FinancialEntryStatus.PENDING,
      startDate: days120,
      endDate: days90
    })

    const over120Total = await this.financialEntryRepository.getTotalByType(type, {
      status: FinancialEntryStatus.PENDING,
      endDate: days120
    })

    return {
      current,
      days30: days30Total,
      days60: days60Total,
      days90: days90Total,
      over120: over120Total
    }
  }

  private calculateInstallmentDate(
    firstDate: Date,
    installmentIndex: number,
    frequency: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY'
  ): Date {
    const dueDate = new Date(firstDate)

    switch (frequency) {
      case 'WEEKLY':
        dueDate.setDate(dueDate.getDate() + (installmentIndex * 7))
        break
      case 'BIWEEKLY':
        dueDate.setDate(dueDate.getDate() + (installmentIndex * 14))
        break
      case 'MONTHLY':
      default:
        dueDate.setMonth(dueDate.getMonth() + installmentIndex)
        break
    }

    return dueDate
  }
}
