import { z } from 'zod'
import { BankAccountType, FinancialEntryType, FinancialEntryStatus, PaymentMethod } from '../types/shared'

// 💰 SCHEMAS PARA CONTAS BANCÁRIAS

export const createBankAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  bank: z.string().min(1, 'Banco é obrigatório').max(255, 'Nome do banco muito longo'),
  accountType: z.nativeEnum(BankAccountType, { errorMap: () => ({ message: 'Tipo de conta inválido' }) }),
  agency: z.string().max(20, 'Agência muito longa').optional(),
  accountNumber: z.string().max(50, 'Número da conta muito longo').optional(),
  pixKey: z.string().max(255, 'Chave PIX muito longa').optional(),
  initialBalance: z.number().min(0, 'Saldo inicial não pode ser negativo').default(0),
  active: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal').default('#3B82F6'),
  description: z.string().max(500, 'Descrição muito longa').optional()
})

export const updateBankAccountSchema = createBankAccountSchema.partial()

export const getBankAccountsQuerySchema = z.object({
  active: z.string().transform((val) => val === 'true').optional(),
  accountType: z.nativeEnum(BankAccountType).optional(),
  page: z.string().transform((val) => parseInt(val)).default('1'),
  limit: z.string().transform((val) => parseInt(val)).default('50')
})

// 💳 SCHEMAS PARA LANÇAMENTOS FINANCEIROS

export const createFinancialEntrySchema = z.object({
  bankAccountId: z.string().min(1, 'Conta bancária é obrigatória'),
  type: z.nativeEnum(FinancialEntryType, { errorMap: () => ({ message: 'Tipo de lançamento inválido' }) }),
  category: z.string().min(1, 'Categoria é obrigatória').max(255, 'Categoria muito longa'),
  subcategory: z.string().max(255, 'Subcategoria muito longa').optional(),
  description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  dueDate: z.string().transform((val) => new Date(val)),
  paidDate: z.string().transform((val) => new Date(val)).optional(),
  status: z.string().default('PENDING').refine(
    (val) => ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'PARTIAL'].includes(val),
    { message: 'Status inválido' }
  ),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  notes: z.string().max(1000, 'Observações muito longas').optional(),
  referenceId: z.string().optional(),
  referenceType: z.string().max(50, 'Tipo de referência muito longo').optional(),
  partnerId: z.string().optional(),
  patientId: z.string().optional(),
  appointmentId: z.string().optional(),
  recurring: z.boolean().default(false),
  parentEntryId: z.string().optional()
})

export const updateFinancialEntrySchema = createFinancialEntrySchema.partial()

export const getFinancialEntriesQuerySchema = z.object({
  bankAccountId: z.string().optional(),
  type: z.nativeEnum(FinancialEntryType).optional(),
  status: z.nativeEnum(FinancialEntryStatus).optional(),
  category: z.string().optional(),
  partnerId: z.string().optional(),
  patientId: z.string().optional(),
  appointmentId: z.string().optional(),
  startDate: z.string().transform((val) => new Date(val)).optional(),
  endDate: z.string().transform((val) => new Date(val)).optional(),
  page: z.string().transform((val) => parseInt(val)).default('1'),
  limit: z.string().transform((val) => parseInt(val)).default('50')
})

export const markAsPaidSchema = z.object({
  paidDate: z.string().transform((val) => new Date(val)).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional()
})

export const createRecurringEntriesSchema = z.object({
  occurrences: z.number().min(1, 'Número de ocorrências deve ser maior que zero').max(60, 'Máximo de 60 ocorrências'),
  frequency: z.enum(['MONTHLY', 'WEEKLY', 'YEARLY'], { errorMap: () => ({ message: 'Frequência inválida' }) })
})

export const getCashFlowQuerySchema = z.object({
  bankAccountId: z.string().optional(),
  startDate: z.string().transform((val) => new Date(val)).optional(),
  endDate: z.string().transform((val) => new Date(val)).optional()
})

// Tipos derivados dos schemas
export type CreateBankAccountData = z.infer<typeof createBankAccountSchema>
export type UpdateBankAccountData = z.infer<typeof updateBankAccountSchema>
export type GetBankAccountsQuery = z.infer<typeof getBankAccountsQuerySchema>

export type CreateFinancialEntryData = z.infer<typeof createFinancialEntrySchema>
export type UpdateFinancialEntryData = z.infer<typeof updateFinancialEntrySchema>
export type GetFinancialEntriesQuery = z.infer<typeof getFinancialEntriesQuerySchema>
export type MarkAsPaidData = z.infer<typeof markAsPaidSchema>
export type CreateRecurringEntriesData = z.infer<typeof createRecurringEntriesSchema>
export type GetCashFlowQuery = z.infer<typeof getCashFlowQuerySchema>
