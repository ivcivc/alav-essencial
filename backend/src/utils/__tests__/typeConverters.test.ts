import { describe, it, expect } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import {
  decimalToNumber,
  convertPrismaDecimal,
  convertPrismaPatient,
  convertPrismaPartner,
  convertPrismaAppointment,
} from '../typeConverters'
import { PartnershipType, AppointmentType, AppointmentStatus } from '../../types/shared'

describe('TypeConverters', () => {
  describe('decimalToNumber', () => {
    it('should convert Decimal to number', () => {
      const decimal = new Decimal(123.45)
      const result = decimalToNumber(decimal)
      expect(result).toBe(123.45)
    })

    it('should return undefined for null', () => {
      const result = decimalToNumber(null)
      expect(result).toBeUndefined()
    })

    it('should return undefined for undefined', () => {
      const result = decimalToNumber(undefined)
      expect(result).toBeUndefined()
    })
  })

  describe('convertPrismaDecimal', () => {
    it('should convert Decimal to number', () => {
      const decimal = new Decimal(456.78)
      const result = convertPrismaDecimal(decimal)
      expect(result).toBe(456.78)
    })

    it('should return 0 for null', () => {
      const result = convertPrismaDecimal(null)
      expect(result).toBe(0)
    })

    it('should return 0 for undefined', () => {
      const result = convertPrismaDecimal(undefined)
      expect(result).toBe(0)
    })

    it('should handle zero values correctly', () => {
      const decimal = new Decimal(0)
      const result = convertPrismaDecimal(decimal)
      expect(result).toBe(0)
    })

    it('should handle negative values correctly', () => {
      const decimal = new Decimal(-50.25)
      const result = convertPrismaDecimal(decimal)
      expect(result).toBe(-50.25)
    })
  })

  describe('convertPrismaPatient', () => {
    it('should convert Prisma Patient to API Patient', () => {
      const prismaPatient = {
        id: '1',
        fullName: 'João Silva',
        cpf: '12345678901',
        birthDate: new Date('1990-01-01'),
        whatsapp: '11999999999',
        phone: '1133334444',
        email: 'joao@example.com',
        street: 'Rua A',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000',
        observations: 'Paciente frequente',
        active: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      }

      const result = convertPrismaPatient(prismaPatient)

      expect(result).toEqual({
        id: '1',
        fullName: 'João Silva',
        cpf: '12345678901',
        birthDate: new Date('1990-01-01'),
        whatsapp: '11999999999',
        phone: '1133334444',
        email: 'joao@example.com',
        street: 'Rua A',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000',
        observations: 'Paciente frequente',
        active: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      })
    })

    it('should handle null optional fields', () => {
      const prismaPatient = {
        id: '1',
        fullName: 'João Silva',
        cpf: '12345678901',
        birthDate: new Date('1990-01-01'),
        whatsapp: null,
        phone: null,
        email: null,
        street: null,
        number: null,
        complement: null,
        neighborhood: null,
        city: null,
        state: null,
        zipCode: null,
        observations: null,
        active: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      }

      const result = convertPrismaPatient(prismaPatient)

      expect(result.whatsapp).toBeUndefined()
      expect(result.phone).toBeUndefined()
      expect(result.email).toBeUndefined()
      expect(result.street).toBeUndefined()
      expect(result.observations).toBeUndefined()
    })
  })

  describe('convertPrismaPartner', () => {
    it('should convert Prisma Partner to API Partner with decimal values', () => {
      const prismaPartner = {
        id: '1',
        fullName: 'Dr. Maria Santos',
        document: '98765432100',
        phone: '11888888888',
        email: 'maria@example.com',
        street: 'Rua B',
        number: '456',
        complement: null,
        neighborhood: 'Vila Nova',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '02000-000',
        bank: 'Banco do Brasil',
        agency: '1234',
        account: '56789-0',
        pix: 'maria@example.com',
        partnershipType: 'PERCENTAGE',
        subleaseAmount: new Decimal(1500.00),
        subleasePaymentDay: 15,
        percentageAmount: new Decimal(2000.00),
        percentageRate: new Decimal(70.5),
        active: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      }

      const result = convertPrismaPartner(prismaPartner)

      expect(result.partnershipType).toBe('PERCENTAGE')
      expect(result.subleaseAmount).toBe(1500.00)
      expect(result.percentageAmount).toBe(2000.00)
      expect(result.percentageRate).toBe(70.5)
      expect(result.subleasePaymentDay).toBe(15)
    })

    it('should handle null decimal values', () => {
      const prismaPartner = {
        id: '1',
        fullName: 'Dr. João Santos',
        document: '12345678901',
        phone: '11777777777',
        email: 'joao@example.com',
        street: null,
        number: null,
        complement: null,
        neighborhood: null,
        city: null,
        state: null,
        zipCode: null,
        bank: null,
        agency: null,
        account: null,
        pix: null,
        partnershipType: 'SUBLEASE',
        subleaseAmount: null,
        subleasePaymentDay: null,
        percentageAmount: null,
        percentageRate: null,
        active: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      }

      const result = convertPrismaPartner(prismaPartner)

      expect(result.subleaseAmount).toBeUndefined()
      expect(result.percentageAmount).toBeUndefined()
      expect(result.percentageRate).toBeUndefined()
      expect(result.subleasePaymentDay).toBeUndefined()
    })
  })

  describe('convertPrismaAppointment', () => {
    it('should convert Prisma Appointment to API Appointment', () => {
      const prismaAppointment = {
        id: '1',
        patientId: 'patient1',
        partnerId: 'partner1',
        productServiceId: 'service1',
        roomId: 'room1',
        date: new Date('2023-06-15'),
        startTime: '09:00',
        endTime: '10:00',
        type: 'CONSULTATION',
        status: 'SCHEDULED',
        observations: 'Primeira consulta',
        checkIn: new Date('2023-06-15T09:00:00'),
        checkOut: new Date('2023-06-15T10:00:00'),
        cancellationReason: null,
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-06-01'),
      }

      const result = convertPrismaAppointment(prismaAppointment)

      expect(result.type).toBe('CONSULTATION')
      expect(result.status).toBe('SCHEDULED')
      expect(result.observations).toBe('Primeira consulta')
      expect(result.checkIn).toEqual(new Date('2023-06-15T09:00:00'))
      expect(result.checkOut).toEqual(new Date('2023-06-15T10:00:00'))
      expect(result.cancellationReason).toBeUndefined()
    })

    it('should handle null optional fields in appointment', () => {
      const prismaAppointment = {
        id: '1',
        patientId: 'patient1',
        partnerId: 'partner1',
        productServiceId: 'service1',
        roomId: null,
        date: new Date('2023-06-15'),
        startTime: '09:00',
        endTime: '10:00',
        type: 'CONSULTATION',
        status: 'SCHEDULED',
        observations: null,
        checkIn: null,
        checkOut: null,
        cancellationReason: null,
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-06-01'),
      }

      const result = convertPrismaAppointment(prismaAppointment)

      expect(result.roomId).toBeUndefined()
      expect(result.observations).toBeUndefined()
      expect(result.checkIn).toBeUndefined()
      expect(result.checkOut).toBeUndefined()
      expect(result.cancellationReason).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small decimal values', () => {
      const smallDecimal = new Decimal(0.01)
      const result = convertPrismaDecimal(smallDecimal)
      expect(result).toBe(0.01)
    })

    it('should handle very large decimal values', () => {
      const largeDecimal = new Decimal(999999.99)
      const result = convertPrismaDecimal(largeDecimal)
      expect(result).toBe(999999.99)
    })

    it('should handle decimal with many decimal places', () => {
      const preciseDecimal = new Decimal(123.456789)
      const result = convertPrismaDecimal(preciseDecimal)
      expect(result).toBe(123.456789)
    })
  })
})
