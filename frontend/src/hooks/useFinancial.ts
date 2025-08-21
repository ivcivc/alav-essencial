import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from './useToast'
import { 
  bankAccountService,
  financialEntryService,
  categoryService,
  accountsReceivableService,
  accountsPayableService,
  reportService,
  recurringService,
  type BankAccount,
  type FinancialEntry,
  type CreateBankAccountData,
  type CreateFinancialEntryData,
  type FinancialCategory,
  type PaymentPlan,
  type AccountsSummary,
  type DREReport,
  type CashFlowData
} from '../services/financial'

// 🔑 QUERY KEYS

export const financialKeys = {
  all: ['financial'] as const,
  
  bankAccounts: () => [...financialKeys.all, 'bankAccounts'] as const,
  bankAccount: (id: string) => [...financialKeys.bankAccounts(), id] as const,
  
  entries: () => [...financialKeys.all, 'entries'] as const,
  entry: (id: string) => [...financialKeys.entries(), id] as const,
  entriesByFilters: (filters: any) => [...financialKeys.entries(), 'filtered', filters] as const,
  
  categories: () => [...financialKeys.all, 'categories'] as const,
  categoriesByType: (type: string) => [...financialKeys.categories(), type] as const,
  
  accountsReceivable: () => [...financialKeys.all, 'accountsReceivable'] as const,
  accountsPayable: () => [...financialKeys.all, 'accountsPayable'] as const,
  
  reports: () => [...financialKeys.all, 'reports'] as const,
  accountsSummary: () => [...financialKeys.reports(), 'accountsSummary'] as const,
  cashFlow: (startDate: string, endDate: string) => [...financialKeys.reports(), 'cashFlow', startDate, endDate] as const,
  dre: (startDate: string, endDate: string) => [...financialKeys.reports(), 'dre', startDate, endDate] as const,
  agingReport: (type: string) => [...financialKeys.reports(), 'aging', type] as const,
  
  recurring: () => [...financialKeys.all, 'recurring'] as const,
  recurringReport: () => [...financialKeys.recurring(), 'report'] as const
}

// 🏦 HOOKS PARA CONTAS BANCÁRIAS

export function useBankAccounts(params?: {
  active?: boolean
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: [...financialKeys.bankAccounts(), params],
    queryFn: () => bankAccountService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export function useBankAccount(id: string) {
  return useQuery({
    queryKey: financialKeys.bankAccount(id),
    queryFn: () => bankAccountService.getById(id),
    enabled: !!id,
  })
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: CreateBankAccountData) => bankAccountService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccounts() })
      showToast('Conta bancária criada com sucesso', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Erro ao criar conta bancária', 'error')
    },
  })
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBankAccountData> }) =>
      bankAccountService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccounts() })
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccount(id) })
      showToast('Conta bancária atualizada com sucesso', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Erro ao atualizar conta bancária', 'error')
    },
  })
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (id: string) => bankAccountService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccounts() })
      showToast('Conta bancária excluída com sucesso', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Erro ao excluir conta bancária', 'error')
    },
  })
}

export function useRecalculateBalance() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (id: string) => bankAccountService.recalculateBalance(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccounts() })
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccount(id) })
      showToast('Saldo recalculado com sucesso', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Erro ao recalcular saldo', 'error')
    },
  })
}

export function useTotalBalance() {
  return useQuery({
    queryKey: [...financialKeys.bankAccounts(), 'totalBalance'],
    queryFn: () => bankAccountService.getTotalBalance(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

// 💰 HOOKS PARA LANÇAMENTOS FINANCEIROS

export function useFinancialEntries(params?: {
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
}) {
  return useQuery({
    queryKey: financialKeys.entriesByFilters(params),
    queryFn: () => financialEntryService.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export function useFinancialEntry(id: string) {
  return useQuery({
    queryKey: financialKeys.entry(id),
    queryFn: () => financialEntryService.getById(id),
    enabled: !!id,
  })
}

export function useCreateFinancialEntry() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: CreateFinancialEntryData) => financialEntryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialKeys.entries() })
      queryClient.invalidateQueries({ queryKey: financialKeys.accountsPayable() })
      queryClient.invalidateQueries({ queryKey: financialKeys.accountsReceivable() })
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccounts() })
      queryClient.invalidateQueries({ queryKey: financialKeys.reports() })
      showToast('Lançamento criado com sucesso', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Erro ao criar lançamento', 'error')
    },
  })
}

export function useUpdateFinancialEntry() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFinancialEntryData> }) =>
      financialEntryService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financialKeys.entries() })
      queryClient.invalidateQueries({ queryKey: financialKeys.entry(id) })
      queryClient.invalidateQueries({ queryKey: financialKeys.accountsPayable() })
      queryClient.invalidateQueries({ queryKey: financialKeys.accountsReceivable() })
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccounts() })
      queryClient.invalidateQueries({ queryKey: financialKeys.reports() })
      // 🔄 Invalidar agendamentos para sincronização bidirecional
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      showToast('Lançamento atualizado com sucesso', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Erro ao atualizar lançamento', 'error')
    },
  })
}

export function useDeleteFinancialEntry() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (id: string) => financialEntryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialKeys.entries() })
      queryClient.invalidateQueries({ queryKey: financialKeys.accountsPayable() })
      queryClient.invalidateQueries({ queryKey: financialKeys.accountsReceivable() })
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccounts() })
      queryClient.invalidateQueries({ queryKey: financialKeys.reports() })
      showToast('Lançamento excluído com sucesso', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Erro ao excluir lançamento', 'error')
    },
  })
}

export function useOverdueEntries() {
  return useQuery({
    queryKey: [...financialKeys.entries(), 'overdue'],
    queryFn: () => financialEntryService.getOverdue(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// 📂 HOOKS PARA CATEGORIAS

export function useFinancialCategories() {
  return useQuery({
    queryKey: financialKeys.categories(),
    queryFn: () => categoryService.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutos (raramente mudam)
  })
}

export function useCategoriesByType(type: 'INCOME' | 'EXPENSE') {
  return useQuery({
    queryKey: financialKeys.categoriesByType(type),
    queryFn: () => categoryService.getByType(type),
    staleTime: 30 * 60 * 1000, // 30 minutos
  })
}

export function useCategoriesWithUsage() {
  return useQuery({
    queryKey: [...financialKeys.categories(), 'usage'],
    queryFn: () => categoryService.getWithUsage(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

export function useSuggestCategory() {
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ description, type }: { description: string; type: 'INCOME' | 'EXPENSE' }) =>
      categoryService.suggest(description, type),
    onError: (error: any) => {
      showToast(error.message || 'Erro ao sugerir categoria', 'error')
    },
  })
}

// 📋 HOOKS PARA CONTAS A RECEBER

export function useAccountsReceivable(params?: {
  status?: string
  startDate?: string
  endDate?: string
  patientId?: string
  category?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: [...financialKeys.accountsReceivable(), params],
    queryFn: () => accountsReceivableService.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export function useCreateInstallmentReceivable() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: {
      plan: PaymentPlan
      bankAccountId: string
      patientId?: string
      appointmentId?: string
    }) => accountsReceivableService.createInstallments(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: financialKeys.accountsReceivable() })
      queryClient.invalidateQueries({ queryKey: financialKeys.entries() })
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccounts() })
      showToast(`${data.length} parcelas criadas com sucesso`, 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Erro ao criar parcelas', 'error')
    },
  })
}

export function useMarkReceivableAsPaid() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string
      data: {
        paidAmount: number
        paymentMethod: string
        paidDate?: string
        bankAccountId?: string
      }
    }) => accountsReceivableService.markAsPaid(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialKeys.accountsReceivable() })
      queryClient.invalidateQueries({ queryKey: financialKeys.entries() })
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccounts() })
      queryClient.invalidateQueries({ queryKey: financialKeys.reports() })
      showToast('Conta a receber marcada como paga', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Erro ao marcar como paga', 'error')
    },
  })
}

// 💳 HOOKS PARA CONTAS A PAGAR

export function useAccountsPayable(params?: {
  status?: string
  startDate?: string
  endDate?: string
  partnerId?: string
  category?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: [...financialKeys.accountsPayable(), params],
    queryFn: () => accountsPayableService.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export function useCreateInstallmentPayable() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: {
      plan: PaymentPlan
      bankAccountId: string
      partnerId?: string
      referenceId?: string
    }) => accountsPayableService.createInstallments(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: financialKeys.accountsPayable() })
      queryClient.invalidateQueries({ queryKey: financialKeys.entries() })
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccounts() })
      showToast(`${data.length} parcelas criadas com sucesso`, 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Erro ao criar parcelas', 'error')
    },
  })
}

export function useMarkPayableAsPaid() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string
      data: {
        paidAmount: number
        paymentMethod: string
        paidDate?: string
        bankAccountId?: string
      }
    }) => accountsPayableService.markAsPaid(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialKeys.accountsPayable() })
      queryClient.invalidateQueries({ queryKey: financialKeys.entries() })
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccounts() })
      queryClient.invalidateQueries({ queryKey: financialKeys.reports() })
      showToast('Conta a pagar marcada como paga', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Erro ao marcar como paga', 'error')
    },
  })
}

// 📊 HOOKS PARA RELATÓRIOS

export function useAccountsSummary() {
  return useQuery({
    queryKey: financialKeys.accountsSummary(),
    queryFn: () => reportService.getAccountsSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export function useAgingReport(type: 'INCOME' | 'EXPENSE') {
  return useQuery({
    queryKey: financialKeys.agingReport(type),
    queryFn: () => reportService.getAgingReport(type),
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

export function useCashFlow(startDate: string, endDate: string) {
  return useQuery({
    queryKey: financialKeys.cashFlow(startDate, endDate),
    queryFn: () => reportService.getCashFlow(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export function useDRE(startDate: string, endDate: string) {
  return useQuery({
    queryKey: financialKeys.dre(startDate, endDate),
    queryFn: () => reportService.getDRE(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

// 🔄 HOOKS PARA LANÇAMENTOS RECORRENTES

export function useCreateRecurringEntry() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: {
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
    }) => recurringService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: financialKeys.entries() })
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccounts() })
      queryClient.invalidateQueries({ queryKey: financialKeys.recurring() })
      showToast(`${data.length} lançamentos recorrentes criados`, 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Erro ao criar lançamentos recorrentes', 'error')
    },
  })
}

export function useCreateBulkEntries() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: {
      entries: CreateFinancialEntryData[]
      options: {
        startDate: string
        endDate: string
        generateType: 'RETROACTIVE' | 'FUTURE' | 'FULL_PERIOD'
        skipExisting?: boolean
      }
    }) => recurringService.createBulk(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: financialKeys.entries() })
      queryClient.invalidateQueries({ queryKey: financialKeys.bankAccounts() })
      queryClient.invalidateQueries({ queryKey: financialKeys.recurring() })
      showToast(`${data.length} lançamentos criados em lote`, 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Erro ao criar lançamentos em lote', 'error')
    },
  })
}

export function useRecurringReport() {
  return useQuery({
    queryKey: financialKeys.recurringReport(),
    queryFn: () => recurringService.getReport(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}
