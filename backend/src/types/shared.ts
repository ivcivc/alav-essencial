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
  NEW = 'NEW',
  RETURN = 'RETURN'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
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