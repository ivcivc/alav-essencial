import { z } from 'zod'
import {
  UserRole,
  PartnershipType,
  ServiceType,
  AppointmentType,
  AppointmentStatus
} from './shared'

// Utility schemas
export const timeSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
export const cpfSchema = z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos')
export const emailSchema = z.string().email('Email inválido')
export const phoneSchema = z.string().min(1, 'Telefone é obrigatório')

// Patient form schemas
export const patientFormSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  cpf: cpfSchema,
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  email: emailSchema.optional().or(z.literal('')),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  observations: z.string().optional()
})

export const quickPatientFormSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  cpf: cpfSchema,
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  whatsapp: z.string().optional(),
  phone: z.string().optional()
})

// Partner form schemas
export const partnerFormSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  document: z.string().min(1, 'CPF/CNPJ é obrigatório'),
  phone: phoneSchema,
  email: emailSchema,
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
  subleaseAmount: z.number().min(0).optional(),
  subleasePaymentDay: z.number().min(1).max(31).optional(),
  percentageAmount: z.number().min(0).optional(),
  percentageRate: z.number().min(0).max(100).optional()
}).refine((data) => {
  if (data.partnershipType === PartnershipType.SUBLEASE) {
    return data.subleaseAmount !== undefined && data.subleasePaymentDay !== undefined
  }
  if (data.partnershipType === PartnershipType.PERCENTAGE || data.partnershipType === PartnershipType.PERCENTAGE_WITH_PRODUCTS) {
    return data.percentageAmount !== undefined || data.percentageRate !== undefined
  }
  return true
}, {
  message: 'Configuração de parceria incompleta',
  path: ['partnershipType']
})

// Partner availability form schema
export const partnerAvailabilityFormSchema = z.object({
  partnerId: z.string().cuid(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: timeSchema,
  endTime: timeSchema,
  breakStart: timeSchema.optional(),
  breakEnd: timeSchema.optional()
}).refine((data) => {
  if (data.breakStart && !data.breakEnd) {
    return false
  }
  if (!data.breakStart && data.breakEnd) {
    return false
  }
  return true
}, {
  message: 'Horário de intervalo incompleto',
  path: ['breakStart']
})

// Room form schema
export const roomFormSchema = z.object({
  name: z.string().min(1, 'Nome da sala é obrigatório'),
  description: z.string().optional(),
  resources: z.array(z.string()).default([])
})

// Category form schema
export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório'),
  type: z.nativeEnum(ServiceType),
  description: z.string().optional()
})

// Product/Service form schema
export const productServiceFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.nativeEnum(ServiceType),
  categoryId: z.string().cuid('Categoria é obrigatória'),
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
}).refine((data) => {
  if (data.type === ServiceType.SERVICE && !data.durationMinutes) {
    return false
  }
  return true
}, {
  message: 'Duração é obrigatória para serviços',
  path: ['durationMinutes']
})

// Appointment form schema
export const appointmentFormSchema = z.object({
  patientId: z.string().cuid('Paciente é obrigatório'),
  partnerId: z.string().cuid('Profissional é obrigatório'),
  productServiceId: z.string().cuid('Serviço é obrigatório'),
  roomId: z.string().cuid().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: timeSchema,
  endTime: timeSchema,
  type: z.nativeEnum(AppointmentType).default(AppointmentType.CONSULTATION),
  observations: z.string().optional()
}).refine((data) => {
  const start = data.startTime.split(':').map(Number)
  const end = data.endTime.split(':').map(Number)
  const startMinutes = start[0] * 60 + start[1]
  const endMinutes = end[0] * 60 + end[1]
  return endMinutes > startMinutes
}, {
  message: 'Horário de fim deve ser posterior ao horário de início',
  path: ['endTime']
})

// Search and filter schemas
export const patientSearchSchema = z.object({
  query: z.string().optional(),
  active: z.boolean().optional()
})

export const partnerSearchSchema = z.object({
  query: z.string().optional(),
  partnershipType: z.nativeEnum(PartnershipType).optional(),
  active: z.boolean().optional()
})

export const appointmentSearchSchema = z.object({
  date: z.string().optional(),
  partnerId: z.string().cuid().optional(),
  roomId: z.string().cuid().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  view: z.enum(['day', 'week', 'month']).default('week')
})

export const productServiceSearchSchema = z.object({
  query: z.string().optional(),
  type: z.nativeEnum(ServiceType).optional(),
  categoryId: z.string().cuid().optional(),
  active: z.boolean().optional(),
  availableForBooking: z.boolean().optional()
})

// Login form schema
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória')
})

// User form schema
export const userFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: emailSchema,
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.nativeEnum(UserRole).default(UserRole.USER)
})

export const updateUserFormSchema = userFormSchema.partial().extend({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional()
})

// Export form data types
export type PatientFormData = z.infer<typeof patientFormSchema>
export type QuickPatientFormData = z.infer<typeof quickPatientFormSchema>
export type PartnerFormData = z.infer<typeof partnerFormSchema>
export type PartnerAvailabilityFormData = z.infer<typeof partnerAvailabilityFormSchema>
export type RoomFormData = z.infer<typeof roomFormSchema>
export type CategoryFormData = z.infer<typeof categoryFormSchema>
export type ProductServiceFormData = z.infer<typeof productServiceFormSchema>
export type AppointmentFormData = z.infer<typeof appointmentFormSchema>
export type LoginFormData = z.infer<typeof loginFormSchema>
export type UserFormData = z.infer<typeof userFormSchema>
export type UpdateUserFormData = z.infer<typeof updateUserFormSchema>

// Search types
export type PatientSearchData = z.infer<typeof patientSearchSchema>
export type PartnerSearchData = z.infer<typeof partnerSearchSchema>
export type AppointmentSearchData = z.infer<typeof appointmentSearchSchema>
export type ProductServiceSearchData = z.infer<typeof productServiceSearchSchema>