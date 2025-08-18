import { PrismaClient, Partner, PartnerAvailability, PartnerBlockedDate, PartnerService, Prisma } from '@prisma/client'
import { Partner as PartnerEntity, PartnerWithRelations, PartnerBlockedDate as PartnerBlockedDateEntity } from '../types/entities'

export interface PartnerFilters {
  search?: string
  active?: boolean
  partnershipType?: string
  page?: number
  limit?: number
}

export interface PartnerRepository {
  findAll(filters?: PartnerFilters): Promise<Partner[]>
  findById(id: string): Promise<PartnerWithRelations | null>
  findByDocument(document: string): Promise<Partner | null>
  findByEmail(email: string): Promise<Partner | null>
  create(data: Omit<PartnerEntity, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<Partner>
  update(id: string, data: Partial<Omit<PartnerEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Partner>
  delete(id: string): Promise<void>
  count(filters?: Omit<PartnerFilters, 'page' | 'limit'>): Promise<number>
  
  // Availability methods
  findAvailabilityByPartnerId(partnerId: string): Promise<PartnerAvailability[]>
  createAvailability(data: Omit<PartnerAvailability, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<PartnerAvailability>
  updateAvailability(id: string, data: Partial<Omit<PartnerAvailability, 'id' | 'partnerId' | 'createdAt' | 'updatedAt'>>): Promise<PartnerAvailability>
  deleteAvailability(id: string): Promise<void>
  
  // Blocked dates methods
  findBlockedDatesByPartnerId(partnerId: string, startDate?: Date, endDate?: Date): Promise<PartnerBlockedDate[]>
  createBlockedDate(data: Omit<PartnerBlockedDateEntity, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<PartnerBlockedDate>
  updateBlockedDate(id: string, data: Partial<Omit<PartnerBlockedDateEntity, 'id' | 'partnerId' | 'createdAt' | 'updatedAt'>>): Promise<PartnerBlockedDate>
  deleteBlockedDate(id: string): Promise<void>
  
  // Services association methods
  findServicesByPartnerId(partnerId: string): Promise<PartnerService[]>
  associateService(partnerId: string, productServiceId: string): Promise<PartnerService>
  dissociateService(partnerId: string, productServiceId: string): Promise<void>
  dissociateAllServices(partnerId: string): Promise<void>
}

export class PrismaPartnerRepository implements PartnerRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: PartnerFilters = {}): Promise<Partner[]> {
    const { search, active, partnershipType, page = 1, limit = 10 } = filters
    
    const where: Prisma.PartnerWhereInput = {}
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { document: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    }
    
    if (active !== undefined) {
      where.active = active
    }

    if (partnershipType) {
      where.partnershipType = partnershipType as any
    }

    return this.prisma.partner.findMany({
      where,
      orderBy: { fullName: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    })
  }

  async findById(id: string): Promise<PartnerWithRelations | null> {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: {
        availability: {
          where: { active: true },
          orderBy: { dayOfWeek: 'asc' }
        },
        blockedDates: {
          where: { active: true },
          orderBy: { blockedDate: 'asc' }
        },
        partnerServices: {
          include: {
            productService: {
              include: {
                category: true
              }
            }
          }
        },
        appointments: {
          include: {
            patient: true,
            productService: true,
            room: true
          },
          orderBy: { date: 'desc' },
          take: 10 // Últimos 10 agendamentos
        }
      }
    })

    return partner as PartnerWithRelations | null
  }

  async findByDocument(document: string): Promise<Partner | null> {
    return this.prisma.partner.findUnique({
      where: { document }
    })
  }

  async findByEmail(email: string): Promise<Partner | null> {
    return this.prisma.partner.findFirst({
      where: { email }
    })
  }

  async create(data: Omit<PartnerEntity, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<Partner> {
    return this.prisma.partner.create({
      data: {
        ...data,
        active: true
      }
    })
  }

  async update(id: string, data: Partial<Omit<PartnerEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Partner> {
    return this.prisma.partner.update({
      where: { id },
      data
    })
  }

  async delete(id: string): Promise<void> {
    // Soft delete - set active to false
    await this.prisma.partner.update({
      where: { id },
      data: { active: false }
    })
  }

  async count(filters: Omit<PartnerFilters, 'page' | 'limit'> = {}): Promise<number> {
    const { search, active, partnershipType } = filters
    
    const where: Prisma.PartnerWhereInput = {}
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { document: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    }
    
    if (active !== undefined) {
      where.active = active
    }

    if (partnershipType) {
      where.partnershipType = partnershipType as any
    }

    return this.prisma.partner.count({ where })
  }

  // Availability methods
  async findAvailabilityByPartnerId(partnerId: string): Promise<PartnerAvailability[]> {
    return this.prisma.partnerAvailability.findMany({
      where: { 
        partnerId,
        active: true
      },
      orderBy: { dayOfWeek: 'asc' }
    })
  }

  async createAvailability(data: Omit<PartnerAvailability, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<PartnerAvailability> {
    return this.prisma.partnerAvailability.create({
      data: {
        ...data,
        active: true
      }
    })
  }

  async updateAvailability(id: string, data: Partial<Omit<PartnerAvailability, 'id' | 'partnerId' | 'createdAt' | 'updatedAt'>>): Promise<PartnerAvailability> {
    return this.prisma.partnerAvailability.update({
      where: { id },
      data
    })
  }

  async deleteAvailability(id: string): Promise<void> {
    // Soft delete - set active to false
    await this.prisma.partnerAvailability.update({
      where: { id },
      data: { active: false }
    })
  }

  // Blocked dates methods
  async findBlockedDatesByPartnerId(partnerId: string, startDate?: Date, endDate?: Date): Promise<PartnerBlockedDate[]> {
    const where: any = {
      partnerId,
      active: true
    }

    if (startDate || endDate) {
      where.blockedDate = {}
      if (startDate) where.blockedDate.gte = startDate
      if (endDate) where.blockedDate.lte = endDate
    }

    return this.prisma.partnerBlockedDate.findMany({
      where,
      orderBy: { blockedDate: 'asc' }
    })
  }

  async createBlockedDate(data: Omit<PartnerBlockedDateEntity, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<PartnerBlockedDate> {
    return this.prisma.partnerBlockedDate.create({
      data: {
        ...data,
        active: true
      }
    })
  }

  async updateBlockedDate(id: string, data: Partial<Omit<PartnerBlockedDateEntity, 'id' | 'partnerId' | 'createdAt' | 'updatedAt'>>): Promise<PartnerBlockedDate> {
    return this.prisma.partnerBlockedDate.update({
      where: { id },
      data
    })
  }

  async deleteBlockedDate(id: string): Promise<void> {
    await this.prisma.partnerBlockedDate.update({
      where: { id },
      data: { active: false }
    })
  }

  // Services association methods
  async findServicesByPartnerId(partnerId: string): Promise<PartnerService[]> {
    return this.prisma.partnerService.findMany({
      where: { partnerId },
      include: {
        productService: {
          include: {
            category: true
          }
        }
      }
    })
  }

  async associateService(partnerId: string, productServiceId: string): Promise<PartnerService> {
    return this.prisma.partnerService.create({
      data: {
        partnerId,
        productServiceId
      }
    })
  }

  async dissociateService(partnerId: string, productServiceId: string): Promise<void> {
    await this.prisma.partnerService.deleteMany({
      where: {
        partnerId,
        productServiceId
      }
    })
  }

  async dissociateAllServices(partnerId: string): Promise<void> {
    await this.prisma.partnerService.deleteMany({
      where: { partnerId }
    })
  }
}
