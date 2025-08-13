import { z } from 'zod'
import {
  UserRole,
  PartnershipType,
  ServiceType,
  AppointmentType,
  AppointmentStatus
} from '../types/shared'

// Base schemas
export const baseEntitySchema = z.object({
  id: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const addressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional()
})

export const contactsSchema = z.object({
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional()
})

export const bankingDetailsSchema = z.object({
  bank: z.string().optional(),
  agency: z.string().optional(),
  account: z.string().optional(),
  pix: z.string().optional()
})

// User schemas
export const userSchema = baseEntitySchema.extend({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.nativeEnum(UserRole),
  active: z.boolean()
})

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.nativeEnum(UserRole).optional()
})

export const updateUserSchema = createUserSchema.partial()

// Patient schemas
export const patientSchema = baseEntitySchema.extend({
  fullName: z.string().min(1),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos'),
  birthDate: z.date(),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  observations: z.string().optional(),
  active: z.boolean()
})

export const createPatientSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos'),
  birthDate: z.string().transform((str) => new Date(str)),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  observations: z.string().optional()
})

export const updatePatientSchema = createPatientSchema.partial()

// Partner schemas
export const partnerSchema = baseEntitySchema.extend({
  fullName: z.string().min(1),
  document: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  bank: z.string().optional(),
  agency: z.string().optional(),
  account: z.string().optional(),
  pix: z.string().optional(),
  partnershipType: z.nativeEnum(PartnershipType),
  subleaseAmount: z.number().optional(),
  subleasePaymentDay: z.number().min(1).max(31).optional(),
  percentageAmount: z.number().optional(),
  percentageRate: z.number().min(0).max(100).optional(),
  active: z.boolean()
})

export const createPartnerSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  document: z.string().min(1, 'CPF/CNPJ é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido'),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  bank: z.string().optional(),
  agency: z.string().optional(),
  account: z.string().optional(),
  pix: z.string().optional(),
  partnershipType: z.nativeEnum(PartnershipType),
  subleaseAmount: z.number().optional(),
  subleasePaymentDay: z.number().min(1).max(31).optional(),
  percentageAmount: z.number().optional(),
  percentageRate: z.number().min(0).max(100).optional()
})

export const updatePartnerSchema = createPartnerSchema.partial()

// Partner Availability schemas
export const partnerAvailabilitySchema = baseEntitySchema.extend({
  partnerId: z.string().cuid(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  breakStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional(),
  breakEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional(),
  active: z.boolean()
})

export const createPartnerAvailabilitySchema = z.object({
  partnerId: z.string().cuid(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  breakStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional(),
  breakEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional()
})

export const updatePartnerAvailabilitySchema = createPartnerAvailabilitySchema.partial()

// Room schemas
export const roomSchema = baseEntitySchema.extend({
  name: z.string().min(1),
  description: z.string().optional(),
  resources: z.array(z.string()),
  active: z.boolean()
})

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Nome da sala é obrigatório'),
  description: z.string().optional(),
  resources: z.array(z.string()).default([])
})

export const updateRoomSchema = createRoomSchema.partial()

// Category schemas
export const categorySchema = baseEntitySchema.extend({
  name: z.string().min(1),
  type: z.nativeEnum(ServiceType),
  description: z.string().optional(),
  active: z.boolean()
})

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório'),
  type: z.nativeEnum(ServiceType),
  description: z.string().optional()
})

export const updateCategorySchema = createCategorySchema.partial()

// Product/Service schemas
export const productServiceSchema = baseEntitySchema.extend({
  name: z.string().min(1),
  type: z.nativeEnum(ServiceType),
  categoryId: z.string().cuid(),
  internalCode: z.string().optional(),
  description: z.string().optional(),
  salePrice: z.number().min(0),
  costPrice: z.number().min(0).optional(),
  partnerPrice: z.number().min(0).optional(),
  durationMinutes: z.number().min(1).optional(),
  availableForBooking: z.boolean(),
  requiresSpecialPrep: z.boolean(),
  specialPrepDetails: z.string().optional(),
  stockLevel: z.number().min(0).optional(),
  minStockLevel: z.number().min(0).optional(),
  active: z.boolean(),
  observations: z.string().optional()
})

export const createProductServiceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.nativeEnum(ServiceType),
  categoryId: z.string().cuid('ID da categoria inválido'),
  internalCode: z.string().optional(),
  description: z.string().optional(),
  salePrice: z.number().min(0, 'Preço de venda deve ser maior ou igual a 0'),
  costPrice: z.number().min(0).optional(),
  partnerPrice: z.number().min(0).optional(),
  durationMinutes: z.number().min(1).optional(),
  availableForBooking: z.boolean().default(true),
  requiresSpecialPrep: z.boolean().default(false),
  specialPrepDetails: z.string().optional(),
  stockLevel: z.number().min(0).optional(),
  minStockLevel: z.number().min(0).optional(),
  observations: z.string().optional()
})

export const updateProductServiceSchema = createProductServiceSchema.partial()

// Appointment schemas
export const appointmentSchema = baseEntitySchema.extend({
  patientId: z.string().cuid(),
  partnerId: z.string().cuid(),
  productServiceId: z.string().cuid(),
  roomId: z.string().cuid().optional(),
  date: z.date(),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  type: z.nativeEnum(AppointmentType),
  status: z.nativeEnum(AppointmentStatus),
  observations: z.string().optional(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  cancellationReason: z.string().optional()
})

export const createAppointmentSchema = z.object({
  patientId: z.string().cuid('ID do paciente inválido'),
  partnerId: z.string().cuid('ID do parceiro inválido'),
  productServiceId: z.string().cuid('ID do produto/serviço inválido'),
  roomId: z.string().cuid().optional(),
  date: z.string().transform((str) => new Date(str)),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  type: z.nativeEnum(AppointmentType).default(AppointmentType.NEW),
  observations: z.string().optional()
})

export const updateAppointmentSchema = z.object({
  patientId: z.string().cuid().optional(),
  partnerId: z.string().cuid().optional(),
  productServiceId: z.string().cuid().optional(),
  roomId: z.string().cuid().optional(),
  date: z.string().transform((str) => new Date(str)).optional(),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional(),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional(),
  type: z.nativeEnum(AppointmentType).optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  observations: z.string().optional(),
  cancellationReason: z.string().optional()
})

// Junction table schemas
export const productServiceRoomSchema = baseEntitySchema.extend({
  productServiceId: z.string().cuid(),
  roomId: z.string().cuid()
})

export const createProductServiceRoomSchema = z.object({
  productServiceId: z.string().cuid(),
  roomId: z.string().cuid()
})

export const partnerServiceSchema = baseEntitySchema.extend({
  partnerId: z.string().cuid(),
  productServiceId: z.string().cuid()
})

export const createPartnerServiceSchema = z.object({
  partnerId: z.string().cuid(),
  productServiceId: z.string().cuid()
})

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1).max(100)).default('10')
})

export const searchSchema = z.object({
  q: z.string().optional(),
  active: z.string().transform((val) => val === 'true').optional()
})

export const appointmentQuerySchema = z.object({
  date: z.string().optional(),
  partnerId: z.string().cuid().optional(),
  roomId: z.string().cuid().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  view: z.enum(['day', 'week', 'month']).default('week')
})