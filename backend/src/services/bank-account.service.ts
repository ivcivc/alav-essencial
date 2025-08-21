import { BankAccountRepository, FinancialEntryRepository } from '../repositories'
import { 
  BankAccount,
  BankAccountWithRelations,
  CreateBankAccountData, 
  UpdateBankAccountData,
  BankAccountType,
  FinancialEntryType,
  FinancialEntryStatus
} from '../types'
import { convertPrismaDecimal } from '../utils/typeConverters'

export class BankAccountService {
  constructor(
    private bankAccountRepository: BankAccountRepository,
    private financialEntryRepository: FinancialEntryRepository
  ) {}

  async getAllBankAccounts(options: {
    active?: boolean
    accountType?: BankAccountType
    page?: number
    limit?: number
  } = {}): Promise<BankAccountWithRelations[]> {
    const accounts = await this.bankAccountRepository.findAll(options)
    
    // Converter Decimal para number e recalcular saldos se necessário
    const processedAccounts = accounts.map(account => ({
      ...account,
      initialBalance: convertPrismaDecimal(account.initialBalance),
      currentBalance: convertPrismaDecimal(account.currentBalance),
      financialEntries: account.financialEntries?.map(entry => ({
        ...entry,
        amount: convertPrismaDecimal(entry.amount)
      }))
    }))

    return processedAccounts
  }

  async getBankAccountById(id: string): Promise<BankAccountWithRelations | null> {
    const account = await this.bankAccountRepository.findById(id)
    
    if (!account) {
      return null
    }

    // Converter Decimal para number
    return {
      ...account,
      initialBalance: convertPrismaDecimal(account.initialBalance),
      currentBalance: convertPrismaDecimal(account.currentBalance),
      financialEntries: account.financialEntries?.map(entry => ({
        ...entry,
        amount: convertPrismaDecimal(entry.amount)
      }))
    }
  }

  async createBankAccount(data: CreateBankAccountData): Promise<BankAccount> {
    // Verificar se já existe uma conta com o mesmo nome
    const existingAccount = await this.bankAccountRepository.findByName(data.name)
    if (existingAccount) {
      throw new Error('Já existe uma conta bancária com este nome')
    }

    // Criar conta com saldo inicial
    const initialBalance = data.initialBalance || 0
    const accountData = {
      ...data,
      initialBalance,
      currentBalance: initialBalance // Saldo atual inicia igual ao saldo inicial
    }

    const createdAccount = await this.bankAccountRepository.create(accountData)
    
    return {
      ...createdAccount,
      initialBalance: convertPrismaDecimal(createdAccount.initialBalance),
      currentBalance: convertPrismaDecimal(createdAccount.currentBalance)
    }
  }

  async updateBankAccount(id: string, data: UpdateBankAccountData): Promise<BankAccount> {
    // Verificar se a conta existe
    const existingAccount = await this.bankAccountRepository.findById(id)
    if (!existingAccount) {
      throw new Error('Conta bancária não encontrada')
    }

    // Verificar se o novo nome já existe (se estiver sendo alterado)
    if (data.name && data.name !== existingAccount.name) {
      const nameExists = await this.bankAccountRepository.findByName(data.name)
      if (nameExists) {
        throw new Error('Já existe uma conta bancária com este nome')
      }
    }

    // Se o saldo inicial foi alterado, recalcular o saldo atual
    let updateData = { ...data }
    if (data.initialBalance !== undefined && data.initialBalance !== Number(existingAccount.initialBalance)) {
      // Recalcular saldo atual baseado no novo saldo inicial
      const newCurrentBalance = await this.calculateCurrentBalance(id, data.initialBalance)
      updateData.currentBalance = newCurrentBalance
    }

    const updatedAccount = await this.bankAccountRepository.update(id, updateData)
    
    return {
      ...updatedAccount,
      initialBalance: convertPrismaDecimal(updatedAccount.initialBalance),
      currentBalance: convertPrismaDecimal(updatedAccount.currentBalance)
    }
  }

  async deleteBankAccount(id: string): Promise<void> {
    // Verificar se a conta existe
    const existingAccount = await this.bankAccountRepository.findById(id)
    if (!existingAccount) {
      throw new Error('Conta bancária não encontrada')
    }

    // Verificar se há lançamentos associados
    const entriesCount = await this.financialEntryRepository.count({ bankAccountId: id })
    if (entriesCount > 0) {
      throw new Error('Não é possível excluir uma conta bancária que possui lançamentos financeiros associados')
    }

    await this.bankAccountRepository.delete(id)
  }

  async recalculateAccountBalance(id: string): Promise<BankAccount> {
    const updatedAccount = await this.bankAccountRepository.recalculateBalance(id)
    
    return {
      ...updatedAccount,
      initialBalance: convertPrismaDecimal(updatedAccount.initialBalance),
      currentBalance: convertPrismaDecimal(updatedAccount.currentBalance)
    }
  }

  private async calculateCurrentBalance(accountId: string, newInitialBalance: number): Promise<number> {
    // Buscar todas as entradas pagas da conta
    const entries = await this.financialEntryRepository.findByBankAccount(accountId, {
      status: FinancialEntryStatus.PAID
    })

    let balance = newInitialBalance

    for (const entry of entries) {
      const amount = Number(entry.amount)
      if (entry.type === FinancialEntryType.INCOME) {
        balance += amount
      } else if (entry.type === FinancialEntryType.EXPENSE) {
        balance -= amount
      }
    }

    return balance
  }

  async getAccountSummary(id: string): Promise<{
    account: BankAccountWithRelations
    summary: {
      totalIncome: number
      totalExpenses: number
      pendingIncome: number
      pendingExpenses: number
      overdueCount: number
    }
  }> {
    const account = await this.getBankAccountById(id)
    if (!account) {
      throw new Error('Conta bancária não encontrada')
    }

    const today = new Date()
    
    // Calcular totais de receitas e despesas pagas
    const totalIncome = await this.financialEntryRepository.getTotalByType(FinancialEntryType.INCOME, {
      bankAccountId: id,
      status: FinancialEntryStatus.PAID
    })

    const totalExpenses = await this.financialEntryRepository.getTotalByType(FinancialEntryType.EXPENSE, {
      bankAccountId: id,
      status: FinancialEntryStatus.PAID
    })

    // Calcular pendências
    const pendingIncome = await this.financialEntryRepository.getTotalByType(FinancialEntryType.INCOME, {
      bankAccountId: id,
      status: FinancialEntryStatus.PENDING
    })

    const pendingExpenses = await this.financialEntryRepository.getTotalByType(FinancialEntryType.EXPENSE, {
      bankAccountId: id,
      status: FinancialEntryStatus.PENDING
    })

    // Contar vencidos
    const overdueEntries = await this.financialEntryRepository.findByBankAccount(id, {
      status: FinancialEntryStatus.PENDING,
      endDate: today
    })

    return {
      account,
      summary: {
        totalIncome,
        totalExpenses,
        pendingIncome,
        pendingExpenses,
        overdueCount: overdueEntries.length
      }
    }
  }

  async getTotalBalance(activeOnly: boolean = true): Promise<number> {
    return this.bankAccountRepository.getTotalBalance({ active: activeOnly })
  }

  async getAccountsByType(accountType: BankAccountType): Promise<BankAccountWithRelations[]> {
    return this.getAllBankAccounts({ accountType, active: true })
  }

  async searchBankAccounts(searchTerm: string): Promise<BankAccountWithRelations[]> {
    const allAccounts = await this.getAllBankAccounts({ active: true })
    
    const searchLower = searchTerm.toLowerCase()
    return allAccounts.filter(account => 
      account.name.toLowerCase().includes(searchLower) ||
      account.bank.toLowerCase().includes(searchLower) ||
      account.description?.toLowerCase().includes(searchLower)
    )
  }
}
