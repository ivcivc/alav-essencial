import { FinancialEntryRepository, BankAccountRepository } from '../repositories'
import { 
  FinancialEntry,
  CreateFinancialEntryData, 
  FinancialEntryWithRelations
} from '../types/entities'
import { 
  FinancialEntryType,
  FinancialEntryStatus
} from '../types/shared'
import { convertPrismaDecimal } from '../utils/typeConverters'

export interface RecurringConfiguration {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  interval: number // Ex: a cada 2 meses (interval = 2, frequency = MONTHLY)
  endDate?: Date
  maxOccurrences?: number
  dayOfMonth?: number // Para mensais: dia específico do mês
  dayOfWeek?: number // Para semanais: dia da semana (0 = domingo)
  adjustForWeekends?: boolean // Se deve ajustar para dias úteis
}

export interface BulkCreateOptions {
  startDate: Date
  endDate: Date
  generateType: 'RETROACTIVE' | 'FUTURE' | 'FULL_PERIOD'
  skipExisting?: boolean
}

export class FinancialRecurringService {
  constructor(
    private financialEntryRepository: FinancialEntryRepository,
    private bankAccountRepository: BankAccountRepository
  ) {}

  async createRecurringEntry(
    baseEntry: CreateFinancialEntryData,
    config: RecurringConfiguration
  ): Promise<FinancialEntry[]> {
    // Marcar o lançamento base como recorrente
    const parentData = {
      ...baseEntry,
      recurring: true,
      parentEntryId: undefined
    }

    const parentEntry = await this.financialEntryRepository.create(parentData)

    // Gerar lançamentos filhos
    const occurrences = this.generateOccurrences(baseEntry.dueDate, config)
    const createdEntries: FinancialEntry[] = [parentEntry]

    for (let i = 0; i < occurrences.length; i++) {
      const dueDate = occurrences[i]
      
      const childData: CreateFinancialEntryData = {
        ...baseEntry,
        dueDate,
        description: `${baseEntry.description} (${i + 2}/${occurrences.length + 1})`,
        recurring: false,
        parentEntryId: parentEntry.id
      }

      try {
        const childEntry = await this.financialEntryRepository.create(childData)
        createdEntries.push(childEntry)
      } catch (error) {
        console.error(`Erro ao criar lançamento recorrente ${i + 1}:`, error)
      }
    }

    // Recalcular saldo se algum lançamento foi criado como pago
    if (baseEntry.status === FinancialEntryStatus.PAID) {
      await this.bankAccountRepository.recalculateBalance(baseEntry.bankAccountId)
    }

    return createdEntries.map(entry => ({
      ...entry,
      amount: convertPrismaDecimal(entry.amount)
    }))
  }

  async createBulkEntries(
    entriesData: CreateFinancialEntryData[],
    options: BulkCreateOptions
  ): Promise<FinancialEntry[]> {
    const { startDate, endDate, generateType, skipExisting = true } = options
    const createdEntries: FinancialEntry[] = []
    const affectedAccounts = new Set<string>()

    for (const entryData of entriesData) {
      try {
        // Verificar se já existe (se skipExisting = true)
        if (skipExisting) {
          const existing = await this.checkExistingEntry(entryData)
          if (existing) {
            console.log(`Pulando lançamento existente: ${entryData.description}`)
            continue
          }
        }

        // Validar data baseada no tipo de geração
        const shouldGenerate = this.shouldGenerateEntry(entryData.dueDate, generateType, startDate, endDate)
        if (!shouldGenerate) {
          continue
        }

        const entry = await this.financialEntryRepository.create(entryData)
        createdEntries.push(entry)
        affectedAccounts.add(entryData.bankAccountId)

        console.log(`✅ Criado: ${entryData.description} - ${entryData.amount}`)
      } catch (error) {
        console.error(`❌ Erro ao criar lançamento: ${entryData.description}`, error)
      }
    }

    // Recalcular saldos das contas afetadas
    for (const accountId of affectedAccounts) {
      try {
        await this.bankAccountRepository.recalculateBalance(accountId)
      } catch (error) {
        console.error(`Erro ao recalcular saldo da conta ${accountId}:`, error)
      }
    }

    console.log(`📊 Criados ${createdEntries.length} lançamentos em ${affectedAccounts.size} contas`)

    return createdEntries.map(entry => ({
      ...entry,
      amount: convertPrismaDecimal(entry.amount)
    }))
  }

  async updateRecurringSeries(
    parentId: string,
    updateData: Partial<CreateFinancialEntryData>,
    updateFuture: boolean = false
  ): Promise<FinancialEntry[]> {
    // Buscar lançamento pai
    const parentEntry = await this.financialEntryRepository.findById(parentId)
    if (!parentEntry || !parentEntry.recurring) {
      throw new Error('Lançamento pai não encontrado ou não é recorrente')
    }

    const updatedEntries: FinancialEntry[] = []

    // Atualizar lançamento pai
    const updatedParent = await this.financialEntryRepository.update(parentId, updateData)
    updatedEntries.push(updatedParent)

    if (updateFuture) {
      // Buscar todos os lançamentos filhos futuros
      const childEntries = await this.financialEntryRepository.findAll({
        parentEntryId: parentId,
        startDate: new Date() // Apenas futuros
      })

      for (const child of childEntries) {
        if (child.status === FinancialEntryStatus.PENDING) {
          try {
            const updatedChild = await this.financialEntryRepository.update(child.id, updateData)
            updatedEntries.push(updatedChild)
          } catch (error) {
            console.error(`Erro ao atualizar lançamento filho ${child.id}:`, error)
          }
        }
      }
    }

    return updatedEntries.map(entry => ({
      ...entry,
      amount: convertPrismaDecimal(entry.amount)
    }))
  }

  async deleteRecurringSeries(
    parentId: string,
    deleteFuture: boolean = false
  ): Promise<void> {
    const parentEntry = await this.financialEntryRepository.findById(parentId)
    if (!parentEntry || !parentEntry.recurring) {
      throw new Error('Lançamento pai não encontrado ou não é recorrente')
    }

    const affectedAccounts = new Set<string>([parentEntry.bankAccountId])

    if (deleteFuture) {
      // Buscar todos os lançamentos filhos futuros
      const childEntries = await this.financialEntryRepository.findAll({
        parentEntryId: parentId,
        startDate: new Date()
      })

      for (const child of childEntries) {
        if (child.status === FinancialEntryStatus.PENDING) {
          try {
            await this.financialEntryRepository.delete(child.id)
            affectedAccounts.add(child.bankAccountId)
          } catch (error) {
            console.error(`Erro ao excluir lançamento filho ${child.id}:`, error)
          }
        }
      }
    }

    // Excluir lançamento pai
    await this.financialEntryRepository.delete(parentId)

    // Recalcular saldos
    for (const accountId of affectedAccounts) {
      try {
        await this.bankAccountRepository.recalculateBalance(accountId)
      } catch (error) {
        console.error(`Erro ao recalcular saldo da conta ${accountId}:`, error)
      }
    }
  }

  private generateOccurrences(startDate: Date, config: RecurringConfiguration): Date[] {
    const occurrences: Date[] = []
    let currentDate = new Date(startDate)
    let count = 0

    const maxIterations = config.maxOccurrences || 120 // Máximo de 120 ocorrências como segurança
    const endDate = config.endDate || new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000) // 5 anos

    while (count < maxIterations && currentDate <= endDate) {
      currentDate = this.getNextOccurrence(currentDate, config)
      
      if (currentDate <= endDate) {
        occurrences.push(new Date(currentDate))
        count++
      }
    }

    return occurrences
  }

  private getNextOccurrence(currentDate: Date, config: RecurringConfiguration): Date {
    const nextDate = new Date(currentDate)

    switch (config.frequency) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + config.interval)
        break

      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + (7 * config.interval))
        if (config.dayOfWeek !== undefined) {
          const dayDiff = config.dayOfWeek - nextDate.getDay()
          nextDate.setDate(nextDate.getDate() + dayDiff)
        }
        break

      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + config.interval)
        if (config.dayOfMonth) {
          nextDate.setDate(config.dayOfMonth)
          // Ajustar se o dia não existe no mês (ex: 31 de fevereiro)
          if (nextDate.getDate() !== config.dayOfMonth) {
            nextDate.setDate(0) // Último dia do mês anterior
          }
        }
        break

      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + (3 * config.interval))
        break

      case 'YEARLY':
        nextDate.setFullYear(nextDate.getFullYear() + config.interval)
        break
    }

    // Ajustar para dias úteis se configurado
    if (config.adjustForWeekends) {
      while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
        nextDate.setDate(nextDate.getDate() + 1)
      }
    }

    return nextDate
  }

  private async checkExistingEntry(entryData: CreateFinancialEntryData): Promise<boolean> {
    const existing = await this.financialEntryRepository.findAll({
      bankAccountId: entryData.bankAccountId,
      category: entryData.category,
      description: entryData.description,
      startDate: entryData.dueDate,
      endDate: entryData.dueDate,
      limit: 1
    })

    return existing.length > 0
  }

  private shouldGenerateEntry(
    entryDate: Date,
    generateType: 'RETROACTIVE' | 'FUTURE' | 'FULL_PERIOD',
    startDate: Date,
    endDate: Date
  ): boolean {
    const now = new Date()

    switch (generateType) {
      case 'RETROACTIVE':
        return entryDate < now && entryDate >= startDate && entryDate <= endDate

      case 'FUTURE':
        return entryDate >= now && entryDate >= startDate && entryDate <= endDate

      case 'FULL_PERIOD':
        return entryDate >= startDate && entryDate <= endDate

      default:
        return false
    }
  }

  async getRecurringEntriesReport(): Promise<{
    totalRecurringSeries: number
    totalChildEntries: number
    nextDue: FinancialEntryWithRelations[]
    overdue: FinancialEntryWithRelations[]
  }> {
    // Buscar séries recorrentes
    const recurringSeries = await this.financialEntryRepository.findAll({
      page: 1,
      limit: 1000 // Buscar muitas para contar
    })

    const totalRecurringSeries = recurringSeries.filter(entry => entry.recurring).length

    // Buscar lançamentos filhos
    const childEntries = await this.financialEntryRepository.findAll({
      page: 1,
      limit: 1000
    })

    const totalChildEntries = childEntries.filter(entry => entry.parentEntryId).length

    // Próximos vencimentos (próximos 7 dias)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const nextDue = await this.financialEntryRepository.findPendingByDateRange(
      new Date(),
      sevenDaysFromNow
    )

    // Vencidos
    const overdue = await this.financialEntryRepository.findOverdue()

    return {
      totalRecurringSeries,
      totalChildEntries,
      nextDue,
      overdue
    }
  }
}
