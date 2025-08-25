// Utilitários para tipos de conta bancária

export type BankAccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CASH' | 'CREDIT_CARD' | 'PIX'

export const BANK_ACCOUNT_TYPES: { value: BankAccountType; label: string }[] = [
  { value: 'CHECKING', label: 'Conta Corrente' },
  { value: 'SAVINGS', label: 'Conta Poupança' },
  { value: 'INVESTMENT', label: 'Conta Investimento' },
  { value: 'CASH', label: 'Caixa Interno' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'PIX', label: 'Conta PIX' }
]

export const getBankAccountTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    'CHECKING': 'Conta Corrente',
    'SAVINGS': 'Conta Poupança',
    'INVESTMENT': 'Conta Investimento',
    'CASH': 'Caixa Interno',
    'CREDIT_CARD': 'Cartão de Crédito',
    'PIX': 'Conta PIX'
  }
  return types[type] || type
}

export const getBankAccountTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'CHECKING': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    'SAVINGS': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    'INVESTMENT': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    'CASH': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    'CREDIT_CARD': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    'PIX': 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}
