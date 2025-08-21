import { apiClient as api } from './api'

// Helper para extrair dados das respostas da API
function extractApiData<T>(response: any): T {
  try {
    // Se a resposta tem o formato { success: true, data: ... }
    if (response?.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data
    }
    // Caso contrário, assume que é o formato direto
    return response?.data || response
  } catch (error) {
    console.error('Erro ao extrair dados da API:', error)
    return response?.data || response
  }
}

// 🏦 INTERFACES PARA CONTAS BANCÁRIAS

export interface BankAccount {
  id: string
  name: string
  bank: string
  accountType: string
  agency?: string
  accountNumber?: string
  pixKey?: string
  initialBalance: number
  currentBalance: number
  active: boolean
  color: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBankAccountData {
  name: string
  bank: string
  accountType: string
  agency?: string
  accountNumber?: string
  pixKey?: string
  initialBalance?: number
  active?: boolean
  color?: string
  description?: string
}

// 💰 INTERFACES PARA LANÇAMENTOS FINANCEIROS

export interface FinancialEntry {
  id: string
  bankAccountId: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  subcategory?: string
  description: string
  amount: number
  dueDate: string
  paidDate?: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIAL'
  paymentMethod?: string
  notes?: string
  referenceId?: string
  referenceType?: string
  partnerId?: string
  patientId?: string
  appointmentId?: string
  recurring: boolean
  parentEntryId?: string
  bankAccount?: BankAccount
  partner?: any
  patient?: any
  appointment?: any
  createdAt: string
  updatedAt: string
}

export interface CreateFinancialEntryData {
  bankAccountId: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  subcategory?: string
  description: string
  amount: number
  dueDate: string
  paidDate?: string
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIAL'
  paymentMethod?: string
  notes?: string
  referenceId?: string
  referenceType?: string
  partnerId?: string
  patientId?: string
  appointmentId?: string
  recurring?: boolean
  parentEntryId?: string
}

export interface FinancialCategory {
  name: string
  type: 'INCOME' | 'EXPENSE'
  subcategories: string[]
  description?: string
  color?: string
  icon?: string
  usageCount?: number
}

// 📊 INTERFACES PARA RELATÓRIOS

export interface CashFlowData {
  date: string
  income: number
  expense: number
  balance: number
  dailyEntries: FinancialEntry[]
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

export interface DREReport {
  period: {
    startDate: string
    endDate: string
  }
  revenue: {
    total: number
    byCategory: Array<{
      category: string
      amount: number
      percentage: number
    }>
  }
  expenses: {
    total: number
    byCategory: Array<{
      category: string
      amount: number
      percentage: number
    }>
  }
  netResult: number
  netMargin: number
}

// 💳 INTERFACES PARA CONTAS A PAGAR/RECEBER

export interface PaymentPlan {
  totalAmount: number
  installments: number
  firstDueDate: string
  frequency: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY'
  interestRate?: number
  description: string
  category: string
  subcategory?: string
}

// 🏦 SERVIÇOS PARA CONTAS BANCÁRIAS

export const bankAccountService = {
  // Listar contas bancárias
  async getAll(params?: {
    active?: boolean
    page?: number
    limit?: number
  }): Promise<{ data: BankAccount[]; total: number }> {
    const queryParams = new URLSearchParams()
    if (params?.active !== undefined) queryParams.append('active', params.active.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await api.get(`/api/financial/bank-accounts?${queryParams}`)
    return extractApiData<{ data: BankAccount[]; total: number }>(response)
  },

  // Buscar conta por ID
  async getById(id: string): Promise<BankAccount> {
    const response = await api.get(`/api/financial/bank-accounts/${id}`)
    return extractApiData<BankAccount>(response)
  },

  // Criar conta bancária
  async create(data: CreateBankAccountData): Promise<BankAccount> {
    const response = await api.post('/api/financial/bank-accounts', data)
    return extractApiData<BankAccount>(response)
  },

  // Atualizar conta bancária
  async update(id: string, data: Partial<CreateBankAccountData>): Promise<BankAccount> {
    const response = await api.put(`/api/financial/bank-accounts/${id}`, data)
    return extractApiData<BankAccount>(response)
  },

  // Deletar conta bancária
  async delete(id: string): Promise<void> {
    await api.delete(`/api/financial/bank-accounts/${id}`)
  },

  // Recalcular saldo
  async recalculateBalance(id: string): Promise<BankAccount> {
    const response = await api.post(`/api/financial/bank-accounts/${id}/recalculate-balance`)
    return response.data
  },

  // Obter saldo total
  async getTotalBalance(): Promise<{ totalBalance: number }> {
    const response = await api.get('/api/financial/total-balance')
    return response.data
  }
}

// 💰 SERVIÇOS PARA LANÇAMENTOS FINANCEIROS

export const financialEntryService = {
  // Listar lançamentos
  async getAll(params?: {
    type?: 'INCOME' | 'EXPENSE'
    status?: string
    category?: string
    subcategory?: string
    bankAccountId?: string
    partnerId?: string
    patientId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<{ data: FinancialEntry[]; total: number; totalPages: number }> {
    const queryParams = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    const response = await api.get(`/api/financial/entries?${queryParams}`)
    return response.data
  },

  // Buscar lançamento por ID
  async getById(id: string): Promise<FinancialEntry> {
    const response = await api.get(`/api/financial/entries/${id}`)
    return response.data
  },

  // Criar lançamento
  async create(data: CreateFinancialEntryData): Promise<FinancialEntry> {
    const response = await api.post('/api/financial/entries', data)
    return response.data
  },

  // Atualizar lançamento
  async update(id: string, data: Partial<CreateFinancialEntryData>): Promise<FinancialEntry> {
    const response = await api.put(`/api/financial/entries/${id}`, data)
    return response.data
  },

  // Deletar lançamento
  async delete(id: string): Promise<void> {
    await api.delete(`/api/financial/entries/${id}`)
  },

  // Obter lançamentos vencidos
  async getOverdue(): Promise<FinancialEntry[]> {
    const response = await api.get('/api/financial/overdue')
    return response.data
  }
}

// 📂 SERVIÇOS PARA CATEGORIAS

export const categoryService = {
  // Obter todas as categorias
  async getAll(): Promise<FinancialCategory[]> {
    const response = await api.get('/api/financial/categories')
    return response.data
  },

  // Obter categorias por tipo
  async getByType(type: 'INCOME' | 'EXPENSE'): Promise<FinancialCategory[]> {
    const response = await api.get(`/api/financial/categories/${type}`)
    return response.data
  },

  // Obter categorias com estatísticas de uso
  async getWithUsage(): Promise<FinancialCategory[]> {
    const response = await api.get('/api/financial/categories/usage')
    return response.data
  },

  // Sugerir categoria
  async suggest(description: string, type: 'INCOME' | 'EXPENSE'): Promise<FinancialCategory | null> {
    const response = await api.post('/api/financial/categories/suggest', {
      description,
      type
    })
    return response.data
  }
}

// 📋 SERVIÇOS PARA CONTAS A RECEBER

export const accountsReceivableService = {
  // Listar contas a receber
  async getAll(params?: {
    status?: string
    startDate?: string
    endDate?: string
    patientId?: string
    category?: string
    page?: number
    limit?: number
  }): Promise<{ data: FinancialEntry[]; total: number }> {
    const queryParams = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    const response = await api.get(`/api/financial/accounts-receivable?${queryParams}`)
    return extractApiData<{ data: FinancialEntry[]; total: number }>(response)
  },

  // Criar conta a receber parcelada
  async createInstallments(data: {
    plan: PaymentPlan
    bankAccountId: string
    patientId?: string
    appointmentId?: string
  }): Promise<FinancialEntry[]> {
    const response = await api.post('/api/financial/accounts-receivable/installments', data)
    return response.data
  },

  // Marcar como pago
  async markAsPaid(id: string, data: {
    paidAmount: number
    paymentMethod: string
    paidDate?: string
    bankAccountId?: string
  }): Promise<FinancialEntry> {
    const response = await api.post(`/api/financial/accounts-receivable/${id}/pay`, data)
    return response.data
  }
}

// 💳 SERVIÇOS PARA CONTAS A PAGAR

export const accountsPayableService = {
  // Listar contas a pagar
  async getAll(params?: {
    status?: string
    startDate?: string
    endDate?: string
    partnerId?: string
    category?: string
    page?: number
    limit?: number
  }): Promise<{ data: FinancialEntry[]; total: number }> {
    const queryParams = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })

    const response = await api.get(`/api/financial/accounts-payable?${queryParams}`)
    return extractApiData<{ data: FinancialEntry[]; total: number }>(response)
  },

  // Criar conta a pagar parcelada
  async createInstallments(data: {
    plan: PaymentPlan
    bankAccountId: string
    partnerId?: string
    referenceId?: string
  }): Promise<FinancialEntry[]> {
    const response = await api.post('/api/financial/accounts-payable/installments', data)
    return response.data
  },

  // Marcar como pago
  async markAsPaid(id: string, data: {
    paidAmount: number
    paymentMethod: string
    paidDate?: string
    bankAccountId?: string
  }): Promise<FinancialEntry> {
    const response = await api.post(`/api/financial/accounts-payable/${id}/pay`, data)
    return response.data
  }
}

// 📊 SERVIÇOS PARA RELATÓRIOS

export const reportService = {
  // Resumo de contas a pagar e receber
  async getAccountsSummary(): Promise<AccountsSummary> {
    const response = await api.get('/api/financial/accounts/summary')
    return extractApiData<AccountsSummary>(response)
  },

  // Relatório de aging
  async getAgingReport(type: 'INCOME' | 'EXPENSE'): Promise<{
    current: number
    days30: number
    days60: number
    days90: number
    over120: number
  }> {
    const response = await api.get(`/api/financial/aging-report/${type}`)
    return response.data
  },

  // Fluxo de caixa
  async getCashFlow(startDate: string, endDate: string): Promise<CashFlowData[]> {
    try {
      const entries = await financialEntryService.getAll({
        startDate,
        endDate,
        status: 'PAID'
      })

      // Verificar se entries é um array diretamente ou um objeto com data
      const entriesArray = Array.isArray(entries) ? entries : entries?.data
      
      if (!entriesArray || !Array.isArray(entriesArray)) {
        throw new Error('Dados de lançamentos inválidos')
      }

      // Agrupar por data
      const cashFlowMap = new Map<string, CashFlowData>()
    
    entriesArray.forEach(entry => {
      const date = entry.paidDate?.split('T')[0] || entry.dueDate.split('T')[0]
      
      if (!cashFlowMap.has(date)) {
        cashFlowMap.set(date, {
          date,
          income: 0,
          expense: 0,
          balance: 0,
          dailyEntries: []
        })
      }

      const dayData = cashFlowMap.get(date)!
      dayData.dailyEntries.push(entry)

      if (entry.type === 'INCOME') {
        dayData.income += entry.amount
      } else {
        dayData.expense += entry.amount
      }
    })

    // Converter para array e calcular saldo acumulado
    const cashFlow = Array.from(cashFlowMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))

    let runningBalance = 0
    cashFlow.forEach(day => {
      runningBalance += day.income - day.expense
      day.balance = runningBalance
    })

    return cashFlow
    } catch (error) {
      console.error('❌ getCashFlow error:', error)
      throw error
    }
  },

  // DRE Simplificado
  async getDRE(startDate: string, endDate: string): Promise<DREReport> {
    try {
      const [incomeEntries, expenseEntries] = await Promise.all([
        financialEntryService.getAll({
          type: 'INCOME',
          startDate,
          endDate,
          status: 'PAID',
          limit: 1000
        }),
        financialEntryService.getAll({
          type: 'EXPENSE',
          startDate,
          endDate,
          status: 'PAID',
          limit: 1000
        })
            ])

      // Verificar se os dados são arrays diretamente ou objetos com data
      const incomeArray = Array.isArray(incomeEntries) ? incomeEntries : incomeEntries?.data || []
      const expenseArray = Array.isArray(expenseEntries) ? expenseEntries : expenseEntries?.data || []

            // Agrupar receitas por categoria
    const revenueByCategory = new Map<string, number>()
    const totalRevenue = incomeArray.reduce((total, entry) => {
      const current = revenueByCategory.get(entry.category) || 0
      revenueByCategory.set(entry.category, current + entry.amount)
      return total + entry.amount
    }, 0)

    // Agrupar despesas por categoria
    const expensesByCategory = new Map<string, number>()
    const totalExpenses = expenseArray.reduce((total, entry) => {
      const current = expensesByCategory.get(entry.category) || 0
      expensesByCategory.set(entry.category, current + entry.amount)
      return total + entry.amount
    }, 0)

    // Converter para arrays ordenados
    const revenue = {
      total: totalRevenue,
      byCategory: Array.from(revenueByCategory.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
    }

    const expenses = {
      total: totalExpenses,
      byCategory: Array.from(expensesByCategory.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
    }

    const netResult = totalRevenue - totalExpenses
    const netMargin = totalRevenue > 0 ? (netResult / totalRevenue) * 100 : 0

    return {
      period: {
        startDate,
        endDate
      },
      revenue,
      expenses,
      netResult,
      netMargin
    }
    } catch (error) {
      console.error('❌ getDRE error:', error)
      throw error
    }
  }
}

// 🔄 SERVIÇOS PARA LANÇAMENTOS RECORRENTES

export const recurringService = {
  // Criar lançamentos recorrentes
  async create(data: {
    baseEntry: CreateFinancialEntryData
    config: {
      frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
      interval: number
      endDate?: string
      maxOccurrences?: number
      dayOfMonth?: number
      dayOfWeek?: number
      adjustForWeekends?: boolean
    }
  }): Promise<FinancialEntry[]> {
    const response = await api.post('/api/financial/recurring/create', data)
    return response.data
  },

  // Criar lançamentos em lote
  async createBulk(data: {
    entries: CreateFinancialEntryData[]
    options: {
      startDate: string
      endDate: string
      generateType: 'RETROACTIVE' | 'FUTURE' | 'FULL_PERIOD'
      skipExisting?: boolean
    }
  }): Promise<FinancialEntry[]> {
    const response = await api.post('/api/financial/recurring/bulk', data)
    return response.data
  },

  // Obter relatório de recorrências
  async getReport(): Promise<{
    totalRecurringSeries: number
    totalChildEntries: number
    nextDue: FinancialEntry[]
    overdue: FinancialEntry[]
  }> {
    const response = await api.get('/api/financial/recurring/report')
    return response.data
  }
}
