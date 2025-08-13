import { PrismaClient, ProductService, Prisma } from '@prisma/client'
import { ProductService as ProductServiceEntity } from '../types/entities'

export interface ProductServiceFilters {
  search?: string
  type?: 'PRODUCT' | 'SERVICE'
  categoryId?: string
  active?: boolean
  availableForBooking?: boolean
  page?: number
  limit?: number
}

export interface ProductServiceRepository {
  findAll(filters?: ProductServiceFilters): Promise<ProductService[]>
  findById(id: string): Promise<ProductService | null>
  findByName(name: string): Promise<ProductService | null>
  findByInternalCode(code: string): Promise<ProductService | null>
  create(data: Omit<ProductServiceEntity, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<ProductService>
  update(id: string, data: Partial<Omit<ProductServiceEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProductService>
  delete(id: string): Promise<void>
  count(filters?: Omit<ProductServiceFilters, 'page' | 'limit'>): Promise<number>
  updateStock(id: string, quantity: number): Promise<ProductService>
  findLowStock(): Promise<ProductService[]>
}

export class PrismaProductServiceRepository implements ProductServiceRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: ProductServiceFilters = {}): Promise<ProductService[]> {
    const { search, type, categoryId, active, availableForBooking, page = 1, limit = 10 } = filters
    
    const where: Prisma.ProductServiceWhereInput = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { internalCode: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (type) {
      where.type = type
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (active !== undefined) {
      where.active = active
    }
    
    if (availableForBooking !== undefined) {
      where.availableForBooking = availableForBooking
    }

    return this.prisma.productService.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        productServiceRooms: {
          include: {
            room: true
          }
        },
        _count: {
          select: {
            appointments: true,
            partnerServices: true
          }
        }
      }
    })
  }

  async findById(id: string): Promise<ProductService | null> {
    return this.prisma.productService.findUnique({
      where: { id },
      include: {
        category: true,
        productServiceRooms: {
          include: {
            room: true
          }
        },
        partnerServices: {
          include: {
            partner: true
          }
        },
        _count: {
          select: {
            appointments: true,
            partnerServices: true
          }
        }
      }
    })
  }

  async findByName(name: string): Promise<ProductService | null> {
    return this.prisma.productService.findFirst({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })
  }

  async findByInternalCode(code: string): Promise<ProductService | null> {
    return this.prisma.productService.findFirst({
      where: { 
        internalCode: {
          equals: code,
          mode: 'insensitive'
        }
      }
    })
  }

  async create(data: Omit<ProductServiceEntity, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<ProductService> {
    return this.prisma.productService.create({
      data: {
        ...data,
        active: true
      },
      include: {
        category: true,
        productServiceRooms: {
          include: {
            room: true
          }
        },
        _count: {
          select: {
            appointments: true,
            partnerServices: true
          }
        }
      }
    })
  }

  async update(id: string, data: Partial<Omit<ProductServiceEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProductService> {
    return this.prisma.productService.update({
      where: { id },
      data,
      include: {
        category: true,
        productServiceRooms: {
          include: {
            room: true
          }
        },
        _count: {
          select: {
            appointments: true,
            partnerServices: true
          }
        }
      }
    })
  }

  async delete(id: string): Promise<void> {
    // Soft delete - set active to false
    await this.prisma.productService.update({
      where: { id },
      data: { active: false }
    })
  }

  async count(filters: Omit<ProductServiceFilters, 'page' | 'limit'> = {}): Promise<number> {
    const { search, type, categoryId, active, availableForBooking } = filters
    
    const where: Prisma.ProductServiceWhereInput = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { internalCode: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (type) {
      where.type = type
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (active !== undefined) {
      where.active = active
    }
    
    if (availableForBooking !== undefined) {
      where.availableForBooking = availableForBooking
    }

    return this.prisma.productService.count({ where })
  }

  async updateStock(id: string, quantity: number): Promise<ProductService> {
    const productService = await this.prisma.productService.findUnique({
      where: { id }
    })

    if (!productService) {
      throw new Error('Produto/Serviço não encontrado')
    }

    if (productService.type !== 'PRODUCT') {
      throw new Error('Apenas produtos podem ter estoque atualizado')
    }

    const currentStock = productService.stockLevel || 0
    const newStock = Math.max(0, currentStock + quantity)

    return this.prisma.productService.update({
      where: { id },
      data: { stockLevel: newStock },
      include: {
        category: true,
        productServiceRooms: {
          include: {
            room: true
          }
        },
        _count: {
          select: {
            appointments: true,
            partnerServices: true
          }
        }
      }
    })
  }

  async findLowStock(): Promise<ProductService[]> {
    return this.prisma.productService.findMany({
      where: {
        type: 'PRODUCT',
        active: true,
        AND: [
          {
            stockLevel: {
              not: null
            }
          },
          {
            minStockLevel: {
              not: null
            }
          },
          {
            stockLevel: {
              lte: this.prisma.productService.fields.minStockLevel
            }
          }
        ]
      },
      include: {
        category: true
      },
      orderBy: [
        { stockLevel: 'asc' },
        { name: 'asc' }
      ]
    })
  }
}