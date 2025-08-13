import { apiClient as api } from './api'
import { 
  ProductService, 
  ProductServiceWithRelations, 
  Category,
  ApiResponse, 
  PaginatedResponse,
  ServiceType 
} from '../types'

export interface ProductServiceFilters {
  page?: number
  limit?: number
  q?: string
  type?: ServiceType
  categoryId?: string
  active?: boolean
  availableForBooking?: boolean
}

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

export interface StockUpdateData {
  quantity: number
  operation: 'add' | 'subtract' | 'set'
}

export interface StockReport {
  totalProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  totalStockValue: number
  averageStockLevel: number
}

export const productsService = {
  // Get all products/services with filters
  async getAll(filters: ProductServiceFilters = {}): Promise<PaginatedResponse<ProductServiceWithRelations>> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.q) params.append('q', filters.q)
    if (filters.type) params.append('type', filters.type)
    if (filters.categoryId) params.append('categoryId', filters.categoryId)
    if (filters.active !== undefined) params.append('active', filters.active.toString())
    if (filters.availableForBooking !== undefined) params.append('availableForBooking', filters.availableForBooking.toString())

    const response = await api.get(`/product-services?${params.toString()}`)
    return response.data
  },

  // Search products/services
  async search(query: string, filters: Omit<ProductServiceFilters, 'q'> = {}): Promise<PaginatedResponse<ProductServiceWithRelations>> {
    const params = new URLSearchParams()
    params.append('q', query)
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.type) params.append('type', filters.type)
    if (filters.categoryId) params.append('categoryId', filters.categoryId)
    if (filters.active !== undefined) params.append('active', filters.active.toString())
    if (filters.availableForBooking !== undefined) params.append('availableForBooking', filters.availableForBooking.toString())

    const response = await api.get(`/product-services/search?${params.toString()}`)
    return response.data
  },

  // Get bookable services
  async getBookableServices(filters: Pick<ProductServiceFilters, 'page' | 'limit' | 'q' | 'categoryId'> = {}): Promise<PaginatedResponse<ProductServiceWithRelations>> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.q) params.append('q', filters.q)
    if (filters.categoryId) params.append('categoryId', filters.categoryId)

    const response = await api.get(`/product-services/bookable?${params.toString()}`)
    return response.data
  },

  // Get products with low stock
  async getLowStockProducts(): Promise<ApiResponse<ProductServiceWithRelations[]>> {
    const response = await api.get('/product-services/stock/low')
    return response.data
  },

  // Get stock report
  async getStockReport(): Promise<ApiResponse<StockReport>> {
    const response = await api.get('/product-services/stock/report')
    return response.data
  },

  // Get products/services by category
  async getByCategory(categoryId: string, filters: Omit<ProductServiceFilters, 'categoryId'> = {}): Promise<PaginatedResponse<ProductServiceWithRelations>> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.q) params.append('q', filters.q)
    if (filters.active !== undefined) params.append('active', filters.active.toString())
    if (filters.availableForBooking !== undefined) params.append('availableForBooking', filters.availableForBooking.toString())

    const response = await api.get(`/product-services/category/${categoryId}?${params.toString()}`)
    return response.data
  },

  // Get product/service by ID
  async getById(id: string): Promise<ApiResponse<ProductServiceWithRelations>> {
    const response = await api.get(`/product-services/${id}`)
    return response.data
  },

  // Create new product/service
  async create(data: CreateProductServiceData): Promise<ApiResponse<ProductService>> {
    const response = await api.post('/product-services', data)
    return response.data
  },

  // Update product/service
  async update(id: string, data: UpdateProductServiceData): Promise<ApiResponse<ProductService>> {
    const response = await api.put(`/product-services/${id}`, data)
    return response.data
  },

  // Update product stock
  async updateStock(id: string, data: StockUpdateData): Promise<ApiResponse<ProductService>> {
    const response = await api.patch(`/product-services/${id}/stock`, data)
    return response.data
  },

  // Delete product/service
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/product-services/${id}`)
    return response.data
  }
}

// Categories service
export interface CategoryFilters {
  page?: number
  limit?: number
  q?: string
  type?: ServiceType
  active?: boolean
}

export interface CreateCategoryData {
  name: string
  type: ServiceType
  description?: string
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  active?: boolean
}

export const categoriesService = {
  // Get all categories with filters
  async getAll(filters: CategoryFilters = {}): Promise<PaginatedResponse<Category>> {
    console.log('🔍 categoriesService.getAll: Iniciando com filtros:', filters)
    
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.q) params.append('q', filters.q)
    if (filters.type) params.append('type', filters.type)
    if (filters.active !== undefined) params.append('active', filters.active.toString())

    const url = `/categories?${params.toString()}`
    console.log('🔍 categoriesService.getAll: URL:', url)
    
    try {
      const response = await api.get(url)
      console.log('🔍 categoriesService.getAll: Resposta do api.get:', response)
      console.log('🔍 categoriesService.getAll: response.data:', response.data)
      console.log('🔍 categoriesService.getAll: Tipo de response.data:', typeof response.data)
      
      return response.data
    } catch (error) {
      console.log('🔍 categoriesService.getAll: Erro:', error)
      throw error
    }
  },

  // Search categories
  async search(query: string, filters: Omit<CategoryFilters, 'q'> = {}): Promise<PaginatedResponse<Category>> {
    const params = new URLSearchParams()
    params.append('q', query)
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.type) params.append('type', filters.type)
    if (filters.active !== undefined) params.append('active', filters.active.toString())

    const response = await api.get(`/categories/search?${params.toString()}`)
    return response.data
  },

  // Get category by ID
  async getById(id: string): Promise<ApiResponse<Category>> {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  // Create new category
  async create(data: CreateCategoryData): Promise<ApiResponse<Category>> {
    const response = await api.post('/categories', data)
    return response.data
  },

  // Update category
  async update(id: string, data: UpdateCategoryData): Promise<ApiResponse<Category>> {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  },

  // Delete category
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  }
}