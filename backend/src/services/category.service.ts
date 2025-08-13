import { Category } from '@prisma/client'
import { CategoryRepository, CategoryFilters } from '../repositories/category.repository'
import { ServiceType } from '../types/shared'

export interface CreateCategoryData {
  name: string
  type: ServiceType
  description?: string
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  active?: boolean
}

export interface CategoryListResponse {
  categories: Category[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async getAllCategories(filters: CategoryFilters = {}): Promise<CategoryListResponse> {
    const { page = 1, limit = 10 } = filters
    
    const [categories, total] = await Promise.all([
      this.categoryRepository.findAll(filters),
      this.categoryRepository.count(filters)
    ])

    return {
      categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id)
    
    if (!category) {
      throw new Error('Categoria não encontrada')
    }

    return category
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    // Check if category name already exists
    const existingCategory = await this.categoryRepository.findByName(data.name)
    if (existingCategory) {
      throw new Error('Já existe uma categoria cadastrada com este nome')
    }

    // Validate name
    if (!data.name.trim()) {
      throw new Error('Nome da categoria é obrigatório')
    }

    return this.categoryRepository.create(data)
  }

  async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    // Check if category exists
    const existingCategory = await this.categoryRepository.findById(id)
    if (!existingCategory) {
      throw new Error('Categoria não encontrada')
    }

    // If updating name, check if it's not already in use by another category
    if (data.name && data.name !== existingCategory.name) {
      const categoryWithName = await this.categoryRepository.findByName(data.name)
      if (categoryWithName && categoryWithName.id !== id) {
        throw new Error('Já existe uma categoria cadastrada com este nome')
      }

      // Validate name
      if (!data.name.trim()) {
        throw new Error('Nome da categoria é obrigatório')
      }
    }

    return this.categoryRepository.update(id, data)
  }

  async deleteCategory(id: string): Promise<void> {
    // Check if category exists
    const existingCategory = await this.categoryRepository.findById(id)
    if (!existingCategory) {
      throw new Error('Categoria não encontrada')
    }

    // Check if category has associated products/services
    const categoryWithCount = existingCategory as Category & { _count: { productServices: number } }
    if (categoryWithCount._count && categoryWithCount._count.productServices > 0) {
      // Only soft delete if there are associated products/services
      await this.categoryRepository.update(id, { active: false })
    } else {
      // Soft delete anyway to maintain consistency
      await this.categoryRepository.delete(id)
    }
  }

  async searchCategories(query: string, filters: Omit<CategoryFilters, 'search'> = {}): Promise<CategoryListResponse> {
    return this.getAllCategories({ ...filters, search: query })
  }

  async getActiveCategories(filters: Omit<CategoryFilters, 'active'> = {}): Promise<CategoryListResponse> {
    return this.getAllCategories({ ...filters, active: true })
  }

  async getCategoriesByType(type: ServiceType, filters: Omit<CategoryFilters, 'type'> = {}): Promise<CategoryListResponse> {
    return this.getAllCategories({ ...filters, type })
  }
}