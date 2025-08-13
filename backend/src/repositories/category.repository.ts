import { PrismaClient, Category, Prisma } from '@prisma/client'
import { Category as CategoryEntity } from '../types/entities'

export interface CategoryFilters {
  search?: string
  type?: 'PRODUCT' | 'SERVICE'
  active?: boolean
  page?: number
  limit?: number
}

export interface CategoryRepository {
  findAll(filters?: CategoryFilters): Promise<Category[]>
  findById(id: string): Promise<Category | null>
  findByName(name: string): Promise<Category | null>
  create(data: Omit<CategoryEntity, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<Category>
  update(id: string, data: Partial<Omit<CategoryEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category>
  delete(id: string): Promise<void>
  count(filters?: Omit<CategoryFilters, 'page' | 'limit'>): Promise<number>
}

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: CategoryFilters = {}): Promise<Category[]> {
    const { search, type, active, page = 1, limit = 10 } = filters
    
    const where: Prisma.CategoryWhereInput = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (type) {
      where.type = type
    }
    
    if (active !== undefined) {
      where.active = active
    }

    return this.prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            productServices: true
          }
        }
      }
    })
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productServices: true
          }
        }
      }
    })
  }

  async findByName(name: string): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })
  }

  async create(data: Omit<CategoryEntity, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<Category> {
    return this.prisma.category.create({
      data: {
        ...data,
        active: true
      },
      include: {
        _count: {
          select: {
            productServices: true
          }
        }
      }
    })
  }

  async update(id: string, data: Partial<Omit<CategoryEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            productServices: true
          }
        }
      }
    })
  }

  async delete(id: string): Promise<void> {
    // Soft delete - set active to false
    await this.prisma.category.update({
      where: { id },
      data: { active: false }
    })
  }

  async count(filters: Omit<CategoryFilters, 'page' | 'limit'> = {}): Promise<number> {
    const { search, type, active } = filters
    
    const where: Prisma.CategoryWhereInput = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (type) {
      where.type = type
    }
    
    if (active !== undefined) {
      where.active = active
    }

    return this.prisma.category.count({ where })
  }
}