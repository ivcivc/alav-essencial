// Shared types between frontend and backend
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum PartnershipType {
  SUBLEASE = 'SUBLEASE',
  PERCENTAGE = 'PERCENTAGE',
  PERCENTAGE_WITH_PRODUCTS = 'PERCENTAGE_WITH_PRODUCTS'
}

export enum ServiceType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE'
}

export enum AppointmentType {
  CONSULTATION = 'CONSULTATION',
  EXAM = 'EXAM',
  PROCEDURE = 'PROCEDURE',
  RETURN = 'RETURN'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

// 🔔 ENUMS PARA NOTIFICAÇÕES

export enum NotificationChannel {
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  EMAIL = 'EMAIL'
}

export enum NotificationReminderType {
  FIRST_REMINDER = 'FIRST_REMINDER',    // 3 dias antes
  SECOND_REMINDER = 'SECOND_REMINDER',  // 1 dia antes
  THIRD_REMINDER = 'THIRD_REMINDER',    // 2 horas antes
  IMMEDIATE = 'IMMEDIATE'               // Imediato (cancelamento, reagendamento)
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// Base interfaces
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
}

export interface Contacts {
  whatsapp?: string
  phone?: string
  email?: string
}

export interface BankingDetails {
  bank?: string
  agency?: string
  account?: string
  pix?: string
}

export interface Pricing {
  salePrice: number
  costPrice?: number
  partnerPrice?: number
}

export interface ServiceConfig {
  durationMinutes?: number
  availableRooms?: string[]
  availableForBooking: boolean
  requiresSpecialPrep: boolean
  specialPrepDetails?: string
}

export interface ProductConfig {
  stockLevel?: number
  minStockLevel?: number
}

export interface PartnershipConfig {
  subleaseAmount?: number
  subleasePaymentDay?: number
  percentageAmount?: number
  percentageRate?: number
}

// 💰 ENUMS PARA MÓDULO FINANCEIRO

export enum BankAccountType {
  CHECKING = 'CHECKING',      // Conta corrente
  SAVINGS = 'SAVINGS',        // Conta poupança
  INVESTMENT = 'INVESTMENT',  // Conta investimento
  CASH = 'CASH',              // Dinheiro em espécie
  CREDIT_CARD = 'CREDIT_CARD', // Cartão de crédito
  PIX = 'PIX'                 // Conta PIX
}

export enum FinancialEntryType {
  INCOME = 'INCOME',          // Receita
  EXPENSE = 'EXPENSE'         // Despesa
}

export enum FinancialEntryStatus {
  PENDING = 'PENDING',        // Pendente
  PAID = 'PAID',              // Pago
  OVERDUE = 'OVERDUE',        // Vencido
  CANCELLED = 'CANCELLED',    // Cancelado
  PARTIAL = 'PARTIAL'         // Pagamento parcial
}

export enum PaymentMethod {
  CASH = 'CASH',              // Dinheiro
  DEBIT_CARD = 'DEBIT_CARD',  // Cartão de débito
  CREDIT_CARD = 'CREDIT_CARD', // Cartão de crédito
  PIX = 'PIX',                // PIX
  BANK_TRANSFER = 'BANK_TRANSFER', // Transferência bancária
  CHECK = 'CHECK',            // Cheque
  VOUCHER = 'VOUCHER'         // Vale/Voucher
}