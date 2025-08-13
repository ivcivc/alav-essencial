import { Decimal } from '@prisma/client/runtime/library'
import {
  Patient as PrismaPatient,
  Partner as PrismaPartner,
  Appointment as PrismaAppointment,
  ProductService as PrismaProductService,
  Room as PrismaRoom,
  Category as PrismaCategory,
  PartnerAvailability as PrismaPartnerAvailability,
  User as PrismaUser
} from '@prisma/client'
import {
  Patient,
  Partner,
  Appointment,
  ProductService,
  Room,
  Category,
  PartnerAvailability,
  User
} from '../types/entities'
import {
  UserRole,
  PartnershipType,
  ServiceType,
  AppointmentType,
  AppointmentStatus
} from '../types/shared'

// Convert Prisma Decimal to number
export function decimalToNumber(decimal: Decimal | null | undefined): number | undefined {
  return decimal ? decimal.toNumber() : undefined
}

// Convert Prisma entities to API entities
export function convertPrismaPatient(prismaPatient: PrismaPatient): Patient {
  return {
    id: prismaPatient.id,
    fullName: prismaPatient.fullName,
    cpf: prismaPatient.cpf,
    birthDate: prismaPatient.birthDate,
    whatsapp: prismaPatient.whatsapp || undefined,
    phone: prismaPatient.phone || undefined,
    email: prismaPatient.email || undefined,
    street: prismaPatient.street || undefined,
    number: prismaPatient.number || undefined,
    complement: prismaPatient.complement || undefined,
    neighborhood: prismaPatient.neighborhood || undefined,
    city: prismaPatient.city || undefined,
    state: prismaPatient.state || undefined,
    zipCode: prismaPatient.zipCode || undefined,
    observations: prismaPatient.observations || undefined,
    active: prismaPatient.active,
    createdAt: prismaPatient.createdAt,
    updatedAt: prismaPatient.updatedAt
  }
}

export function convertPrismaPartner(prismaPartner: PrismaPartner): Partner {
  return {
    id: prismaPartner.id,
    fullName: prismaPartner.fullName,
    document: prismaPartner.document,
    phone: prismaPartner.phone,
    email: prismaPartner.email,
    street: prismaPartner.street || undefined,
    number: prismaPartner.number || undefined,
    complement: prismaPartner.complement || undefined,
    neighborhood: prismaPartner.neighborhood || undefined,
    city: prismaPartner.city || undefined,
    state: prismaPartner.state || undefined,
    zipCode: prismaPartner.zipCode || undefined,
    bank: prismaPartner.bank || undefined,
    agency: prismaPartner.agency || undefined,
    account: prismaPartner.account || undefined,
    pix: prismaPartner.pix || undefined,
    partnershipType: prismaPartner.partnershipType as PartnershipType,
    subleaseAmount: decimalToNumber(prismaPartner.subleaseAmount),
    subleasePaymentDay: prismaPartner.subleasePaymentDay || undefined,
    percentageAmount: decimalToNumber(prismaPartner.percentageAmount),
    percentageRate: decimalToNumber(prismaPartner.percentageRate),
    active: prismaPartner.active,
    createdAt: prismaPartner.createdAt,
    updatedAt: prismaPartner.updatedAt
  }
}

export function convertPrismaAppointment(prismaAppointment: PrismaAppointment): Appointment {
  return {
    id: prismaAppointment.id,
    patientId: prismaAppointment.patientId,
    partnerId: prismaAppointment.partnerId,
    productServiceId: prismaAppointment.productServiceId,
    roomId: prismaAppointment.roomId || undefined,
    date: prismaAppointment.date,
    startTime: prismaAppointment.startTime,
    endTime: prismaAppointment.endTime,
    type: prismaAppointment.type as AppointmentType,
    status: prismaAppointment.status as AppointmentStatus,
    observations: prismaAppointment.observations || undefined,
    checkIn: prismaAppointment.checkIn || undefined,
    checkOut: prismaAppointment.checkOut || undefined,
    cancellationReason: prismaAppointment.cancellationReason || undefined,
    createdAt: prismaAppointment.createdAt,
    updatedAt: prismaAppointment.updatedAt
  }
}

export function convertPrismaProductService(prismaProductService: PrismaProductService): ProductService {
  return {
    id: prismaProductService.id,
    name: prismaProductService.name,
    type: prismaProductService.type as ServiceType,
    categoryId: prismaProductService.categoryId,
    internalCode: prismaProductService.internalCode || undefined,
    description: prismaProductService.description || undefined,
    salePrice: decimalToNumber(prismaProductService.salePrice) || 0,
    costPrice: decimalToNumber(prismaProductService.costPrice),
    partnerPrice: decimalToNumber(prismaProductService.partnerPrice),
    durationMinutes: prismaProductService.durationMinutes || undefined,
    availableForBooking: prismaProductService.availableForBooking,
    requiresSpecialPrep: prismaProductService.requiresSpecialPrep,
    specialPrepDetails: prismaProductService.specialPrepDetails || undefined,
    stockLevel: prismaProductService.stockLevel || undefined,
    minStockLevel: prismaProductService.minStockLevel || undefined,
    active: prismaProductService.active,
    observations: prismaProductService.observations || undefined,
    createdAt: prismaProductService.createdAt,
    updatedAt: prismaProductService.updatedAt
  }
}

export function convertPrismaRoom(prismaRoom: PrismaRoom): Room {
  return {
    id: prismaRoom.id,
    name: prismaRoom.name,
    description: prismaRoom.description || undefined,
    resources: prismaRoom.resources,
    active: prismaRoom.active,
    createdAt: prismaRoom.createdAt,
    updatedAt: prismaRoom.updatedAt
  }
}

export function convertPrismaCategory(prismaCategory: PrismaCategory): Category {
  return {
    id: prismaCategory.id,
    name: prismaCategory.name,
    type: prismaCategory.type as ServiceType,
    description: prismaCategory.description || undefined,
    active: prismaCategory.active,
    createdAt: prismaCategory.createdAt,
    updatedAt: prismaCategory.updatedAt
  }
}

export function convertPrismaPartnerAvailability(prismaAvailability: PrismaPartnerAvailability): PartnerAvailability {
  return {
    id: prismaAvailability.id,
    partnerId: prismaAvailability.partnerId,
    dayOfWeek: prismaAvailability.dayOfWeek,
    startTime: prismaAvailability.startTime,
    endTime: prismaAvailability.endTime,
    breakStart: prismaAvailability.breakStart || undefined,
    breakEnd: prismaAvailability.breakEnd || undefined,
    active: prismaAvailability.active,
    createdAt: prismaAvailability.createdAt,
    updatedAt: prismaAvailability.updatedAt
  }
}

export function convertPrismaUser(prismaUser: PrismaUser): User {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    password: prismaUser.password,
    name: prismaUser.name,
    role: prismaUser.role as UserRole,
    active: prismaUser.active,
    createdAt: prismaUser.createdAt,
    updatedAt: prismaUser.updatedAt
  }
}

// Utility functions for array conversions
export function convertPrismaPatients(prismaPatients: PrismaPatient[]): Patient[] {
  return prismaPatients.map(convertPrismaPatient)
}

export function convertPrismaPartners(prismaPartners: PrismaPartner[]): Partner[] {
  return prismaPartners.map(convertPrismaPartner)
}

export function convertPrismaAppointments(prismaAppointments: PrismaAppointment[]): Appointment[] {
  return prismaAppointments.map(convertPrismaAppointment)
}

export function convertPrismaProductServices(prismaProductServices: PrismaProductService[]): ProductService[] {
  return prismaProductServices.map(convertPrismaProductService)
}

export function convertPrismaRooms(prismaRooms: PrismaRoom[]): Room[] {
  return prismaRooms.map(convertPrismaRoom)
}

export function convertPrismaCategories(prismaCategories: PrismaCategory[]): Category[] {
  return prismaCategories.map(convertPrismaCategory)
}

export function convertPrismaPartnerAvailabilities(prismaAvailabilities: PrismaPartnerAvailability[]): PartnerAvailability[] {
  return prismaAvailabilities.map(convertPrismaPartnerAvailability)
}

export function convertPrismaUsers(prismaUsers: PrismaUser[]): User[] {
  return prismaUsers.map(convertPrismaUser)
}