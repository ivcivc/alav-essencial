import { ProductService } from '@prisma/client'
import { ProductServiceRepository, ProductServiceFilters } from '../repositories/product-service.repository'
import { CategoryRepository } from '../repositories/category.repository'
import { ServiceType } from '../types/shared'

export interface CreateProductServiceData {
  name: string
  type: ServiceType
  categoryId: string
  internalCode?: string
  description?: string
  salePrice: number
  costPrice?: number
  partnerPrice?: number
  durationMinutes?: number
  availableForBooking?: boolean
  requiresSpecialPrep?: boolean
  specialPrepDetails?: string
  stockLevel?: number
  minStockLevel?: number
  observations?: string
}

export interface UpdateProductServiceData extends Partial<CreateProductServiceData> {
  active?: boolean
}

export interface ProductServiceListResponse {
  productServices: ProductService[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface StockUpdateData {
  quantity: number
  operation: 'add' | 'subtract' | 'set'
}

export class ProductServiceService {
  constructor(
    private productServiceRepository: ProductServiceRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async getAllProductServices(filters: ProductServiceFilters = {}): Promise<ProductServiceListResponse> {
    const { page = 1, limit = 10 } = filters
    
    const [productServices, total] = await Promise.all([
      this.productServiceRepository.findAll(filters),
      this.productServiceRepository.count(filters)
    ])

    return {
      productServices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getProductServiceById(id: string): Promise<ProductService> {
    const productService = await this.productServiceRepository.findById(id)
    
    if (!productService) {
      throw new Error('Produto/Serviço não encontrado')
    }

    return productService
  }

  async createProductService(data: CreateProductServiceData): Promise<ProductService> {
    // Validate category exists
    const category = await this.categoryRepository.findById(data.categoryId)
    if (!category) {
      throw new Error('Categoria não encontrada')
    }

    // Validate category type matches product/service type
    if (category.type !== data.type) {
      throw new Error(`Categoria deve ser do tipo ${data.type === 'PRODUCT' ? 'produto' : 'serviço'}`)
    }

    // Check if name already exists
    const existingByName = await this.productServiceRepository.findByName(data.name)
    if (existingByName) {
      throw new Error('Já existe um produto/serviço cadastrado com este nome')
    }

    // Check if internal code already exists (if provided)
    if (data.internalCode) {
      const existingByCode = await this.productServiceRepository.findByInternalCode(data.internalCode)
      if (existingByCode) {
        throw new Error('Já existe um produto/serviço cadastrado com este código interno')
      }
    }

    // Validate required fields
    if (!data.name.trim()) {
      throw new Error('Nome é obrigatório')
    }

    if (data.salePrice < 0) {
      throw new Error('Preço de venda deve ser maior ou igual a zero')
    }

    if (data.costPrice !== undefined && data.costPrice < 0) {
      throw new Error('Preço de custo deve ser maior ou igual a zero')
    }

    if (data.partnerPrice !== undefined && data.partnerPrice < 0) {
      throw new Error('Preço do parceiro deve ser maior ou igual a zero')
    }

    // Validate service-specific fields
    if (data.type === 'SERVICE') {
      if (data.durationMinutes !== undefined && data.durationMinutes <= 0) {
        throw new Error('Duração deve ser maior que zero para serviços')
      }
    }

    // Validate product-specific fields
    if (data.type === 'PRODUCT') {
      if (data.stockLevel !== undefined && data.stockLevel < 0) {
        throw new Error('Nível de estoque deve ser maior ou igual a zero')
      }
      
      if (data.minStockLevel !== undefined && data.minStockLevel < 0) {
        throw new Error('Estoque mínimo deve ser maior ou igual a zero')
      }
    }

    // Set defaults
    const createData = {
      ...data,
      availableForBooking: data.availableForBooking ?? true,
      requiresSpecialPrep: data.requiresSpecialPrep ?? false
    }

    return this.productServiceRepository.create(createData)
  }

  async updateProductService(id: string, data: UpdateProductServiceData): Promise<ProductService> {
    // Check if product/service exists
    const existingProductService = await this.productServiceRepository.findById(id)
    if (!existingProductService) {
      throw new Error('Produto/Serviço não encontrado')
    }

    // Validate category if being updated
    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId)
      if (!category) {
        throw new Error('Categoria não encontrada')
      }

      // Validate category type matches product/service type
      const typeToCheck = data.type || existingProductService.type
      if (category.type !== typeToCheck) {
        throw new Error(`Categoria deve ser do tipo ${typeToCheck === 'PRODUCT' ? 'produto' : 'serviço'}`)
      }
    }

    // If updating name, check if it's not already in use by another product/service
    if (data.name && data.name !== existingProductService.name) {
      const productServiceWithName = await this.productServiceRepository.findByName(data.name)
      if (productServiceWithName && productServiceWithName.id !== id) {
        throw new Error('Já existe um produto/serviço cadastrado com este nome')
      }

      // Validate name
      if (!data.name.trim()) {
        throw new Error('Nome é obrigatório')
      }
    }

    // If updating internal code, check if it's not already in use by another product/service
    if (data.internalCode && data.internalCode !== existingProductService.internalCode) {
      const productServiceWithCode = await this.productServiceRepository.findByInternalCode(data.internalCode)
      if (productServiceWithCode && productServiceWithCode.id !== id) {
        throw new Error('Já existe um produto/serviço cadastrado com este código interno')
      }
    }

    // Validate price fields
    if (data.salePrice !== undefined && data.salePrice < 0) {
      throw new Error('Preço de venda deve ser maior ou igual a zero')
    }

    if (data.costPrice !== undefined && data.costPrice < 0) {
      throw new Error('Preço de custo deve ser maior ou igual a zero')
    }

    if (data.partnerPrice !== undefined && data.partnerPrice < 0) {
      throw new Error('Preço do parceiro deve ser maior ou igual a zero')
    }

    // Validate service-specific fields
    const currentType = data.type || existingProductService.type
    if (currentType === 'SERVICE') {
      if (data.durationMinutes !== undefined && data.durationMinutes <= 0) {
        throw new Error('Duração deve ser maior que zero para serviços')
      }
    }

    // Validate product-specific fields
    if (currentType === 'PRODUCT') {
      if (data.stockLevel !== undefined && data.stockLevel < 0) {
        throw new Error('Nível de estoque deve ser maior ou igual a zero')
      }
      
      if (data.minStockLevel !== undefined && data.minStockLevel < 0) {
        throw new Error('Estoque mínimo deve ser maior ou igual a zero')
      }
    }

    return this.productServiceRepository.update(id, data)
  }

  async deleteProductService(id: string): Promise<void> {
    // Check if product/service exists
    const existingProductService = await this.productServiceRepository.findById(id)
    if (!existingProductService) {
      throw new Error('Produto/Serviço não encontrado')
    }

    // Check if product/service has associated appointments
    const productServiceWithCount = existingProductService as ProductService & { 
      _count: { appointments: number; partnerServices: number } 
    }
    
    if (productServiceWithCount._count && productServiceWithCount._count.appointments > 0) {
      // Only soft delete if there are associated appointments
      await this.productServiceRepository.update(id, { active: false })
    } else {
      // Soft delete anyway to maintain consistency
      await this.productServiceRepository.delete(id)
    }
  }

  async searchProductServices(query: string, filters: Omit<ProductServiceFilters, 'search'> = {}): Promise<ProductServiceListResponse> {
    return this.getAllProductServices({ ...filters, search: query })
  }

  async getActiveProductServices(filters: Omit<ProductServiceFilters, 'active'> = {}): Promise<ProductServiceListResponse> {
    return this.getAllProductServices({ ...filters, active: true })
  }

  async getProductServicesByType(type: ServiceType, filters: Omit<ProductServiceFilters, 'type'> = {}): Promise<ProductServiceListResponse> {
    return this.getAllProductServices({ ...filters, type })
  }

  async getProductServicesByCategory(categoryId: string, filters: Omit<ProductServiceFilters, 'categoryId'> = {}): Promise<ProductServiceListResponse> {
    // Validate category exists
    const category = await this.categoryRepository.findById(categoryId)
    if (!category) {
      throw new Error('Categoria não encontrada')
    }

    return this.getAllProductServices({ ...filters, categoryId })
  }

  async getBookableServices(filters: Omit<ProductServiceFilters, 'availableForBooking' | 'type'> = {}): Promise<ProductServiceListResponse> {
    return this.getAllProductServices({ 
      ...filters, 
      type: 'SERVICE',
      availableForBooking: true,
      active: true
    })
  }

  async updateStock(id: string, stockUpdate: StockUpdateData): Promise<ProductService> {
    const productService = await this.productServiceRepository.findById(id)
    
    if (!productService) {
      throw new Error('Produto/Serviço não encontrado')
    }

    if (productService.type !== 'PRODUCT') {
      throw new Error('Apenas produtos podem ter estoque atualizado')
    }

    const currentStock = productService.stockLevel || 0
    let newQuantity: number

    switch (stockUpdate.operation) {
      case 'add':
        newQuantity = stockUpdate.quantity
        break
      case 'subtract':
        newQuantity = -stockUpdate.quantity
        break
      case 'set':
        newQuantity = stockUpdate.quantity - currentStock
        break
      default:
        throw new Error('Operação de estoque inválida')
    }

    if (stockUpdate.operation === 'set' && stockUpdate.quantity < 0) {
      throw new Error('Quantidade de estoque não pode ser negativa')
    }

    if (stockUpdate.operation === 'subtract' && currentStock < stockUpdate.quantity) {
      throw new Error('Estoque insuficiente para esta operação')
    }

    return this.productServiceRepository.updateStock(id, newQuantity)
  }

  async getLowStockProducts(): Promise<ProductService[]> {
    return this.productServiceRepository.findLowStock()
  }

  async getStockReport(): Promise<{
    totalProducts: number
    lowStockProducts: number
    outOfStockProducts: number
    products: ProductService[]
  }> {
    const allProducts = await this.getAllProductServices({ 
      type: 'PRODUCT', 
      active: true,
      limit: 1000 // Get all products for report
    })
    
    const lowStockProducts = await this.getLowStockProducts()
    const outOfStockProducts = allProducts.productServices.filter(p => 
      p.stockLevel !== null && p.stockLevel === 0
    )

    return {
      totalProducts: allProducts.total,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      products: allProducts.productServices
    }
  }
}