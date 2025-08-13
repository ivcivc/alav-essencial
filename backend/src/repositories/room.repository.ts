import { PrismaClient, Room, Prisma } from '@prisma/client'
import { Room as RoomEntity, RoomWithRelations } from '../types/entities'

export interface RoomFilters {
  search?: string
  active?: boolean
  page?: number
  limit?: number
}

export interface RoomRepository {
  findAll(filters?: RoomFilters): Promise<Room[]>
  findById(id: string): Promise<RoomWithRelations | null>
  findByName(name: string): Promise<Room | null>
  create(data: Omit<RoomEntity, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<Room>
  update(id: string, data: Partial<Omit<RoomEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Room>
  delete(id: string): Promise<void>
  count(filters?: Omit<RoomFilters, 'page' | 'limit'>): Promise<number>
}

export class PrismaRoomRepository implements RoomRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: RoomFilters = {}): Promise<Room[]> {
    const { search, active, page = 1, limit = 10 } = filters
    
    const where: Prisma.RoomWhereInput = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { resources: { hasSome: [search] } }
      ]
    }
    
    if (active !== undefined) {
      where.active = active
    }

    return this.prisma.room.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    })
  }

  async findById(id: string): Promise<RoomWithRelations | null> {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        productServiceRooms: {
          include: {
            productService: true
          }
        },
        appointments: {
          include: {
            patient: true,
            partner: true,
            productService: true
          },
          orderBy: { date: 'desc' },
          take: 10 // Limit recent appointments
        }
      }
    })

    return room as RoomWithRelations | null
  }

  async findByName(name: string): Promise<Room | null> {
    return this.prisma.room.findFirst({
      where: { 
        name: { 
          equals: name, 
          mode: 'insensitive' 
        },
        active: true
      }
    })
  }

  async create(data: Omit<RoomEntity, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<Room> {
    return this.prisma.room.create({
      data: {
        ...data,
        active: true
      }
    })
  }

  async update(id: string, data: Partial<Omit<RoomEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Room> {
    return this.prisma.room.update({
      where: { id },
      data
    })
  }

  async delete(id: string): Promise<void> {
    // Hard delete - actually remove from database
    await this.prisma.room.delete({
      where: { id }
    })
  }

  async count(filters: Omit<RoomFilters, 'page' | 'limit'> = {}): Promise<number> {
    const { search, active } = filters
    
    const where: Prisma.RoomWhereInput = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { resources: { hasSome: [search] } }
      ]
    }
    
    if (active !== undefined) {
      where.active = active
    }

    return this.prisma.room.count({ where })
  }
}