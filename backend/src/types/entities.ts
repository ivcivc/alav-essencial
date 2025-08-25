import {
  BaseEntity,
  Address,
  Contacts,
  BankingDetails,
  Pricing,
  ServiceConfig,
  ProductConfig,
  PartnershipConfig,
  UserRole,
  PartnershipType,
  ServiceType,
  AppointmentType,
  AppointmentStatus,
  NotificationChannel,
  NotificationReminderType,
  NotificationStatus
} from './shared'

// User Entity
export interface User extends BaseEntity {
  email: string
  password: string
  name: string
  role: UserRole
  active: boolean
}

// Patient Entity
export interface Patient extends BaseEntity {
  fullName: string
  cpf: string
  birthDate: Date
  whatsapp?: string
  phone?: string
  email?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  observations?: string
  active: boolean
}

// Partner Entity
export interface Partner extends BaseEntity {
  fullName: string
  document: string
  phone: string
  email: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  bank?: string
  agency?: string
  account?: string
  pix?: string
  partnershipType: PartnershipType
  subleaseAmount?: number
  subleasePaymentDay?: number
  percentageAmount?: number
  percentageRate?: number
  active: boolean
}

// Partner Availability Entity
export interface PartnerAvailability extends BaseEntity {
  partnerId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
  active: boolean
}

// Partner Blocked Date Entity
export interface PartnerBlockedDate extends BaseEntity {
  partnerId: string
  blockedDate: Date
  startTime?: string
  endTime?: string
  reason?: string
  active: boolean
}

// Room Entity
export interface Room extends BaseEntity {
  name: string
  description?: string
  resources: string[]
  active: boolean
}

// Category Entity
export interface Category extends BaseEntity {
  name: string
  type: ServiceType
  description?: string
  active: boolean
}

// Product/Service Entity
export interface ProductService extends BaseEntity {
  name: string
  type: ServiceType
  categoryId: string
  internalCode?: string
  description?: string
  salePrice: number
  costPrice?: number
  partnerPrice?: number
  durationMinutes?: number
  availableForBooking: boolean
  requiresSpecialPrep: boolean
  specialPrepDetails?: string
  stockLevel?: number
  minStockLevel?: number
  active: boolean
  observations?: string
}

// Appointment Entity
export interface Appointment extends BaseEntity {
  patientId: string
  partnerId: string
  productServiceId: string
  roomId?: string
  date: Date
  startTime: string
  endTime: string
  type: AppointmentType
  status: AppointmentStatus
  isEncaixe: boolean
  observations?: string
  checkIn?: Date
  checkOut?: Date
  cancellationReason?: string
}

// Junction table entities
export interface ProductServiceRoom extends BaseEntity {
  productServiceId: string
  roomId: string
}

export interface PartnerService extends BaseEntity {
  partnerId: string
  productServiceId: string
}

// Extended entities with relations (for API responses)
export interface PatientWithAppointments extends Patient {
  appointments?: Appointment[]
}

export interface PartnerWithRelations extends Partner {
  availability?: PartnerAvailability[]
  blockedDates?: PartnerBlockedDate[]
  partnerServices?: PartnerService[]
  appointments?: Appointment[]
}

export interface ProductServiceWithRelations extends ProductService {
  category?: Category
  productServiceRooms?: ProductServiceRoom[]
  partnerServices?: PartnerService[]
  appointments?: Appointment[]
}

export interface AppointmentWithRelations extends Appointment {
  patient?: Patient
  partner?: Partner
  productService?: ProductService
  room?: Room
}

export interface RoomWithRelations extends Room {
  productServiceRooms?: ProductServiceRoom[]
  appointments?: Appointment[]
}

export interface CategoryWithRelations extends Category {
  productServices?: ProductService[]
}

// 🔔 ENTIDADES DE NOTIFICAÇÃO

export interface NotificationConfiguration extends BaseEntity {
  enabled: boolean
  defaultChannel: string
  firstReminderDays: number
  secondReminderDays: number
  thirdReminderHours: number
  whatsappEnabled: boolean
  smsEnabled: boolean
  emailEnabled: boolean
  retryAttempts: number
  retryIntervalMinutes: number
}

export interface NotificationTemplate extends BaseEntity {
  name: string
  type: NotificationReminderType
  channel: NotificationChannel
  subject?: string
  content: string
  variables: any // JSON
  active: boolean
}

export interface NotificationSchedule extends BaseEntity {
  appointmentId: string
  templateId: string
  scheduledFor: Date
  status: NotificationStatus
  channel: NotificationChannel
  retryCount: number
  lastAttempt?: Date
  errorMessage?: string
}

export interface NotificationLog extends BaseEntity {
  appointmentId: string
  channel: NotificationChannel
  recipient: string
  content: string
  subject?: string
  status: NotificationStatus
  errorMessage?: string
  providerData?: any // JSON
  deliveredAt?: Date
  readAt?: Date
  sentAt: Date
}

// Extended notification entities with relations
export interface NotificationTemplateWithSchedules extends NotificationTemplate {
  notificationSchedules?: NotificationSchedule[]
}

export interface NotificationScheduleWithRelations extends NotificationSchedule {
  appointment?: Appointment
  template?: NotificationTemplate
}

export interface NotificationLogWithRelations extends NotificationLog {
  appointment?: AppointmentWithRelations
}

// Extended appointment with notifications
export interface AppointmentWithNotifications extends AppointmentWithRelations {
  notificationSchedules?: NotificationSchedule[]
  notificationLogs?: NotificationLog[]
}

// 💰 ENTIDADES FINANCEIRAS

export interface BankAccount extends BaseEntity {
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
}

export interface FinancialEntry extends BaseEntity {
  bankAccountId: string
  type: string // 'INCOME' | 'EXPENSE'
  category: string
  subcategory?: string
  description: string
  amount: number
  dueDate: Date
  paidDate?: Date
  status: string // 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIAL'
  paymentMethod?: string
  notes?: string
  referenceId?: string
  referenceType?: string
  partnerId?: string
  patientId?: string
  appointmentId?: string
  recurring: boolean
  parentEntryId?: string
}

// Extended financial entities with relations
export interface BankAccountWithRelations extends BankAccount {
  financialEntries?: FinancialEntry[]
}

export interface FinancialEntryWithRelations extends FinancialEntry {
  bankAccount?: BankAccount
  partner?: Partner
  patient?: Patient
  appointment?: AppointmentWithRelations
  parentEntry?: FinancialEntry
  childEntries?: FinancialEntry[]
}

// Financial data transfer objects
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

export interface UpdateBankAccountData {
  name?: string
  bank?: string
  accountType?: string
  agency?: string
  accountNumber?: string
  pixKey?: string
  initialBalance?: number
  active?: boolean
  color?: string
  description?: string
}

export interface CreateFinancialEntryData {
  bankAccountId: string
  type: string
  category: string
  subcategory?: string
  description: string
  amount: number
  dueDate: Date
  paidDate?: Date
  status?: string
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

export interface UpdateFinancialEntryData {
  bankAccountId?: string
  type?: string
  category?: string
  subcategory?: string
  description?: string
  amount?: number
  dueDate?: Date
  paidDate?: Date
  status?: string
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

export interface FinancialEntryFilters {
  bankAccountId?: string
  type?: string
  status?: string
  category?: string
  partnerId?: string
  patientId?: string
  appointmentId?: string
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
  excludeCancelled?: boolean
}