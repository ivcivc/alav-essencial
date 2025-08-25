import { PrismaClient, FinancialEntry, FinancialEntryType, FinancialEntryStatus, Prisma } from '@prisma/client'
import { CreateFinancialEntryData, UpdateFinancialEntryData, FinancialEntryWithRelations, FinancialEntryFilters } from '../types/entities'

export interface FinancialEntryRepository {
  findAll(filters?: FinancialEntryFilters): Promise<FinancialEntryWithRelations[]>
  findById(id: string): Promise<FinancialEntryWithRelations | null>
  findByBankAccount(bankAccountId: string, options?: {
    type?: FinancialEntryType
    status?: FinancialEntryStatus
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  }): Promise<FinancialEntryWithRelations[]>
  findOverdue(): Promise<FinancialEntryWithRelations[]>
  findPendingByDateRange(startDate: Date, endDate: Date): Promise<FinancialEntryWithRelations[]>
  create(data: CreateFinancialEntryData): Promise<FinancialEntry>
  update(id: string, data: UpdateFinancialEntryData): Promise<FinancialEntry>
  delete(id: string): Promise<void>
  markAsPaid(id: string, paidDate?: Date, paymentMethod?: string): Promise<FinancialEntry>
  markAsCancelled(id: string): Promise<FinancialEntry>
  count(filters?: FinancialEntryFilters): Promise<number>
  getTotalByType(type: FinancialEntryType, filters?: {
    bankAccountId?: string
    status?: FinancialEntryStatus
    startDate?: Date
    endDate?: Date
  }): Promise<number>
  getTotalByTypeExcludingCancelled(type: FinancialEntryType, filters?: {
    bankAccountId?: string
    status?: FinancialEntryStatus
    startDate?: Date
    endDate?: Date
  }): Promise<number>
}

export class PrismaFinancialEntryRepository implements FinancialEntryRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: FinancialEntryFilters = {}): Promise<FinancialEntryWithRelations[]> {
    const {
      bankAccountId,
      type,
      status,
      category,
      partnerId,
      patientId,
      appointmentId,
      startDate,
      endDate,
      excludeCancelled,
      page = 1,
      limit = 50
    } = filters

    const where: Prisma.FinancialEntryWhereInput = {}

    if (bankAccountId) where.bankAccountId = bankAccountId
    if (type) where.type = type
    if (status) where.status = status
    if (category) where.category = { contains: category, mode: 'insensitive' }
    if (partnerId) where.partnerId = partnerId
    if (patientId) where.patientId = patientId
    if (appointmentId) where.appointmentId = appointmentId

    // Excluir lançamentos cancelados se solicitado
    if (excludeCancelled) {
      where.status = { not: 'CANCELLED' }
      // Se um status específico foi fornecido, combinar com exclusão de cancelados
      if (status) {
        where.status = status
      }
    }

    if (startDate || endDate) {
      where.dueDate = {}
      if (startDate) where.dueDate.gte = startDate
      if (endDate) where.dueDate.lte = endDate
    }

    const skip = (page - 1) * limit

    return this.prisma.financialEntry.findMany({
      where,
      include: {
        bankAccount: true,
        partner: true,
        patient: true,
        appointment: {
          include: {
            productService: true
          }
        },
        parentEntry: true,
        childEntries: true
      },
      orderBy: [
        { createdAt: 'desc' },
        { dueDate: 'asc' }
      ],
      skip,
      take: limit
    })
  }

  async findById(id: string): Promise<FinancialEntryWithRelations | null> {
    return this.prisma.financialEntry.findUnique({
      where: { id },
      include: {
        bankAccount: true,
        partner: true,
        patient: true,
        appointment: {
          include: {
            productService: true,
            partner: true,
            patient: true
          }
        },
        parentEntry: true,
        childEntries: {
          include: {
            bankAccount: true
          }
        }
      }
    })
  }

  async findByBankAccount(
    bankAccountId: string,
    options: {
      type?: FinancialEntryType
      status?: FinancialEntryStatus
      startDate?: Date
      endDate?: Date
      page?: number
      limit?: number
    } = {}
  ): Promise<FinancialEntryWithRelations[]> {
    const { type, status, startDate, endDate, page = 1, limit = 50 } = options

    const where: Prisma.FinancialEntryWhereInput = { bankAccountId }

    if (type) where.type = type
    if (status) where.status = status

    if (startDate || endDate) {
      where.dueDate = {}
      if (startDate) where.dueDate.gte = startDate
      if (endDate) where.dueDate.lte = endDate
    }

    const skip = (page - 1) * limit

    return this.prisma.financialEntry.findMany({
      where,
      include: {
        bankAccount: true,
        partner: true,
        patient: true,
        appointment: {
          include: {
            productService: true
          }
        },
        parentEntry: true,
        childEntries: true
      },
      orderBy: [
        { createdAt: 'desc' },
        { dueDate: 'asc' }
      ],
      skip,
      take: limit
    })
  }

  async findOverdue(): Promise<FinancialEntryWithRelations[]> {
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Final do dia

    return this.prisma.financialEntry.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today
        }
      },
      include: {
        bankAccount: true,
        partner: true,
        patient: true,
        appointment: {
          include: {
            productService: true
          }
        },
        parentEntry: true,
        childEntries: true
      },
      orderBy: { dueDate: 'asc' }
    })
  }

  async findPendingByDateRange(startDate: Date, endDate: Date): Promise<FinancialEntryWithRelations[]> {
    return this.prisma.financialEntry.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        bankAccount: true,
        partner: true,
        patient: true,
        appointment: {
          include: {
            productService: true
          }
        },
        parentEntry: true,
        childEntries: true
      },
      orderBy: { dueDate: 'asc' }
    })
  }

  async create(data: CreateFinancialEntryData): Promise<FinancialEntry> {
    return this.prisma.financialEntry.create({
      data
    })
  }

  async update(id: string, data: UpdateFinancialEntryData): Promise<FinancialEntry> {
    return this.prisma.financialEntry.update({
      where: { id },
      data
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.financialEntry.delete({
      where: { id }
    })
  }

  async markAsPaid(id: string, paidDate?: Date, paymentMethod?: string): Promise<FinancialEntry> {
    return this.prisma.financialEntry.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: paidDate || new Date(),
        paymentMethod: paymentMethod as any
      }
    })
  }

  async markAsCancelled(id: string): Promise<FinancialEntry> {
    return this.prisma.financialEntry.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    })
  }

  async count(filters: FinancialEntryFilters = {}): Promise<number> {
    const {
      bankAccountId,
      type,
      status,
      category,
      partnerId,
      patientId,
      appointmentId,
      startDate,
      endDate,
      excludeCancelled
    } = filters

    const where: Prisma.FinancialEntryWhereInput = {}

    if (bankAccountId) where.bankAccountId = bankAccountId
    if (type) where.type = type
    if (status) where.status = status
    if (category) where.category = { contains: category, mode: 'insensitive' }
    if (partnerId) where.partnerId = partnerId
    if (patientId) where.patientId = patientId
    if (appointmentId) where.appointmentId = appointmentId

    // Excluir lançamentos cancelados se solicitado
    if (excludeCancelled) {
      where.status = { not: 'CANCELLED' }
      // Se um status específico foi fornecido, combinar com exclusão de cancelados
      if (status) {
        where.status = status
      }
    }

    if (startDate || endDate) {
      where.dueDate = {}
      if (startDate) where.dueDate.gte = startDate
      if (endDate) where.dueDate.lte = endDate
    }

    return this.prisma.financialEntry.count({ where })
  }

  async getTotalByType(
    type: FinancialEntryType,
    filters: {
      bankAccountId?: string
      status?: FinancialEntryStatus
      startDate?: Date
      endDate?: Date
    } = {}
  ): Promise<number> {
    const { bankAccountId, status, startDate, endDate } = filters

    const where: Prisma.FinancialEntryWhereInput = { type }

    if (bankAccountId) where.bankAccountId = bankAccountId
    if (status) where.status = status

    if (startDate || endDate) {
      where.dueDate = {}
      if (startDate) where.dueDate.gte = startDate
      if (endDate) where.dueDate.lte = endDate
    }

    const result = await this.prisma.financialEntry.aggregate({
      where,
      _sum: {
        amount: true
      }
    })

    return Number(result._sum.amount) || 0
  }

  async getTotalByTypeExcludingCancelled(
    type: FinancialEntryType,
    filters: {
      bankAccountId?: string
      status?: FinancialEntryStatus
      startDate?: Date
      endDate?: Date
    } = {}
  ): Promise<number> {
    const { bankAccountId, status, startDate, endDate } = filters

    const where: Prisma.FinancialEntryWhereInput = { 
      type,
      status: { not: 'CANCELLED' } // Sempre excluir cancelados
    }

    if (bankAccountId) where.bankAccountId = bankAccountId
    
    // Se um status específico foi fornecido, combinar com exclusão de cancelados
    if (status) {
      where.status = status
    }

    if (startDate || endDate) {
      where.dueDate = {}
      if (startDate) where.dueDate.gte = startDate
      if (endDate) where.dueDate.lte = endDate
    }

    const result = await this.prisma.financialEntry.aggregate({
      where,
      _sum: {
        amount: true
      }
    })

    return Number(result._sum.amount) || 0
  }

  async getTotalByType(
    type: string,
    filters?: {
      status?: string
      startDate?: Date
      endDate?: Date
      bankAccountId?: string
      partnerId?: string
    }
  ): Promise<number> {
    const whereConditions: any = { type }

    if (filters?.status) {
      whereConditions.status = filters.status
    }

    if (filters?.bankAccountId) {
      whereConditions.bankAccountId = filters.bankAccountId
    }

    if (filters?.partnerId) {
      whereConditions.partnerId = filters.partnerId
    }

    if (filters?.startDate || filters?.endDate) {
      whereConditions.dueDate = {}
      if (filters.startDate) {
        whereConditions.dueDate.gte = filters.startDate
      }
      if (filters.endDate) {
        whereConditions.dueDate.lte = filters.endDate
      }
    }

    const result = await this.prisma.financialEntry.aggregate({
      where: whereConditions,
      _sum: {
        amount: true
      }
    })

    return Number(result._sum.amount) || 0
  }

  async count(filters?: {
    type?: string
    category?: string
    status?: string
    partnerId?: string
    bankAccountId?: string
  }): Promise<number> {
    const whereConditions: any = {}

    if (filters?.type) {
      whereConditions.type = filters.type
    }

    if (filters?.category) {
      whereConditions.category = filters.category
    }

    if (filters?.status) {
      whereConditions.status = filters.status
    }

    if (filters?.partnerId) {
      whereConditions.partnerId = filters.partnerId
    }

    if (filters?.bankAccountId) {
      whereConditions.bankAccountId = filters.bankAccountId
    }

    return this.prisma.financialEntry.count({
      where: whereConditions
    })
  }
}
