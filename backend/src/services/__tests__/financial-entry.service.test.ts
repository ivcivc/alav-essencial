import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FinancialEntryService } from '../financial-entry.service'
import { FinancialEntryRepository, BankAccountRepository, AppointmentRepository } from '../../repositories'
import { CreateFinancialEntryData, FinancialEntryType, FinancialEntryStatus, PaymentMethod } from '../../types'
import { Decimal } from '@prisma/client/runtime/library'

// Mocks dos repositories
const mockFinancialEntryRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findByAppointmentId: vi.fn(),
} as jest.Mocked<FinancialEntryRepository>

const mockBankAccountRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  recalculateBalance: vi.fn(),
} as jest.Mocked<BankAccountRepository>

const mockAppointmentRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
} as jest.Mocked<AppointmentRepository>

describe('FinancialEntryService', () => {
  let financialEntryService: FinancialEntryService

  beforeEach(() => {
    vi.clearAllMocks()
    financialEntryService = new FinancialEntryService(
      mockFinancialEntryRepository,
      mockBankAccountRepository,
      mockAppointmentRepository
    )
  })

  describe('getAllFinancialEntries', () => {
    it('should return list of financial entries with converted amounts', async () => {
      const mockEntries = [
        {
          id: '1',
          description: 'Receita de consulta',
          amount: new Decimal(150.00),
          type: 'INCOME' as FinancialEntryType,
          status: 'PAID' as FinancialEntryStatus,
          paymentMethod: 'CREDIT_CARD' as PaymentMethod,
          dueDate: new Date(),
          bankAccountId: 'bank1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockFinancialEntryRepository.findAll.mockResolvedValue(mockEntries)

      const result = await financialEntryService.getAllFinancialEntries()

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(150.00)
      expect(mockFinancialEntryRepository.findAll).toHaveBeenCalledWith({})
    })

    it('should apply filters when provided', async () => {
      const filters = { type: 'INCOME' as FinancialEntryType, status: 'PAID' as FinancialEntryStatus }
      mockFinancialEntryRepository.findAll.mockResolvedValue([])

      await financialEntryService.getAllFinancialEntries(filters)

      expect(mockFinancialEntryRepository.findAll).toHaveBeenCalledWith(filters)
    })
  })

  describe('getFinancialEntryById', () => {
    it('should return financial entry when found', async () => {
      const mockEntry = {
        id: '1',
        description: 'Despesa de material',
        amount: new Decimal(75.50),
        type: 'EXPENSE' as FinancialEntryType,
        status: 'PENDING' as FinancialEntryStatus,
        paymentMethod: 'PIX' as PaymentMethod,
        dueDate: new Date(),
        bankAccountId: 'bank1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockFinancialEntryRepository.findById.mockResolvedValue(mockEntry)

      const result = await financialEntryService.getFinancialEntryById('1')

      expect(result).toEqual({
        ...mockEntry,
        amount: 75.50,
      })
      expect(mockFinancialEntryRepository.findById).toHaveBeenCalledWith('1')
    })

    it('should return null when entry not found', async () => {
      mockFinancialEntryRepository.findById.mockResolvedValue(null)

      const result = await financialEntryService.getFinancialEntryById('999')

      expect(result).toBeNull()
    })
  })

  describe('createFinancialEntry', () => {
    it('should create financial entry when bank account exists', async () => {
      const entryData: CreateFinancialEntryData = {
        description: 'Nova receita',
        amount: 200.00,
        type: 'INCOME',
        status: 'PAID',
        paymentMethod: 'CASH',
        dueDate: new Date(),
        bankAccountId: 'bank1',
      }

      const mockBankAccount = {
        id: 'bank1',
        name: 'Conta Principal',
        balance: new Decimal(1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const createdEntry = {
        id: '1',
        ...entryData,
        amount: new Decimal(200.00),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockBankAccountRepository.findById.mockResolvedValue(mockBankAccount)
      mockFinancialEntryRepository.create.mockResolvedValue(createdEntry)

      const result = await financialEntryService.createFinancialEntry(entryData)

      expect(result).toEqual({
        ...createdEntry,
        amount: 200.00,
      })
      expect(mockBankAccountRepository.findById).toHaveBeenCalledWith('bank1')
      expect(mockFinancialEntryRepository.create).toHaveBeenCalledWith({
        ...entryData,
        paidDate: expect.any(Date),
      })
    })

    it('should throw error when bank account does not exist', async () => {
      const entryData: CreateFinancialEntryData = {
        description: 'Receita inválida',
        amount: 200.00,
        type: 'INCOME',
        status: 'PAID',
        paymentMethod: 'CASH',
        dueDate: new Date(),
        bankAccountId: 'invalid-bank',
      }

      mockBankAccountRepository.findById.mockResolvedValue(null)

      await expect(financialEntryService.createFinancialEntry(entryData)).rejects.toThrow(
        'Conta bancária não encontrada'
      )

      expect(mockBankAccountRepository.findById).toHaveBeenCalledWith('invalid-bank')
      expect(mockFinancialEntryRepository.create).not.toHaveBeenCalled()
    })

    it('should throw error for invalid amount', async () => {
      const entryData: CreateFinancialEntryData = {
        description: 'Receita inválida',
        amount: -100.00,
        type: 'INCOME',
        status: 'PAID',
        paymentMethod: 'CASH',
        dueDate: new Date(),
        bankAccountId: 'bank1',
      }

      const mockBankAccount = {
        id: 'bank1',
        name: 'Conta Principal',
        balance: new Decimal(1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockBankAccountRepository.findById.mockResolvedValue(mockBankAccount)

      await expect(financialEntryService.createFinancialEntry(entryData)).rejects.toThrow(
        'O valor deve ser maior que zero'
      )

      expect(mockFinancialEntryRepository.create).not.toHaveBeenCalled()
    })
  })

  describe('Business Logic', () => {
    it('should validate future due dates correctly', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)

      const entryData: CreateFinancialEntryData = {
        description: 'Receita futura',
        amount: 500.00,
        type: 'INCOME',
        status: 'PENDING',
        paymentMethod: 'BANK_TRANSFER',
        dueDate: futureDate,
        bankAccountId: 'bank1',
      }

      const mockBankAccount = {
        id: 'bank1',
        name: 'Conta Principal',
        balance: new Decimal(1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockBankAccountRepository.findById.mockResolvedValue(mockBankAccount)
      mockFinancialEntryRepository.create.mockResolvedValue({
        id: '1',
        ...entryData,
        amount: new Decimal(500.00),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await financialEntryService.createFinancialEntry(entryData)

      expect(result).toBeDefined()
      expect(result.amount).toBe(500.00)
    })

    it('should handle different payment methods correctly', async () => {
      const paymentMethods: PaymentMethod[] = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_TRANSFER']

      for (const method of paymentMethods) {
        const entryData: CreateFinancialEntryData = {
          description: `Receita via ${method}`,
          amount: 100.00,
          type: 'INCOME',
          status: 'PAID',
          paymentMethod: method,
          dueDate: new Date(),
          bankAccountId: 'bank1',
        }

        const mockBankAccount = {
          id: 'bank1',
          name: 'Conta Principal',
          balance: new Decimal(1000),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockBankAccountRepository.findById.mockResolvedValue(mockBankAccount)
        mockFinancialEntryRepository.create.mockResolvedValue({
          id: `${method}-1`,
          ...entryData,
          amount: new Decimal(100.00),
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const result = await financialEntryService.createFinancialEntry(entryData)

        expect(result.paymentMethod).toBe(method)
        expect(result.amount).toBe(100.00)
      }
    })
  })
})
