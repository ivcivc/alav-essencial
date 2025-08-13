import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { PrismaCategoryRepository } from '../../repositories/category.repository'
import { CategoryService } from '../../services/category.service'
import { 
  createCategorySchema, 
  updateCategorySchema, 
  paginationSchema, 
  searchSchema 
} from '../../schemas/validation'
import { successResponse, errorResponse } from '../../utils/response'
import { ServiceType } from '../../types/shared'

const categoriesRoutes: FastifyPluginAsync = async (fastify) => {
  const categoryRepository = new PrismaCategoryRepository(fastify.prisma)
  const categoryService = new CategoryService(categoryRepository)

  // GET /api/categories - List all categories with pagination and search
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string' },
          limit: { type: 'string' },
          q: { type: 'string' },
          type: { type: 'string', enum: ['PRODUCT', 'SERVICE'] },
          active: { type: 'string' }
        }
      },
      tags: ['Categories'],
      summary: 'List categories',
      description: 'Get a paginated list of categories with optional search and filters'
    }
  }, async (request, reply) => {
    try {
      const queryParams = paginationSchema.merge(searchSchema).extend({
        type: z.nativeEnum(ServiceType).optional()
      }).parse(request.query)
      const { page, limit, q: search, type, active } = queryParams
      
      const result = await categoryService.getAllCategories({
        page,
        limit,
        search,
        type,
        active
      })

      return successResponse(result, 'Categorias listadas com sucesso')
    } catch (error) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao listar categorias', 500)
    }
  })

  // GET /api/categories/search - Search categories (alternative endpoint)
  fastify.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          page: { type: 'string' },
          limit: { type: 'string' },
          type: { type: 'string', enum: ['PRODUCT', 'SERVICE'] },
          active: { type: 'string' }
        }
      },
      tags: ['Categories'],
      summary: 'Search categories',
      description: 'Search categories by name or description'
    }
  }, async (request, reply) => {
    try {
      const queryParams = searchSchema.merge(paginationSchema).extend({
        type: z.nativeEnum(ServiceType).optional()
      }).parse(request.query)
      const { q: query, page, limit, type, active } = queryParams
      
      if (!query) {
        return errorResponse(reply, 'Parâmetro de busca é obrigatório', 400)
      }

      const result = await categoryService.searchCategories(query, {
        page,
        limit,
        type,
        active
      })

      return successResponse(result, 'Busca realizada com sucesso')
    } catch (error) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao buscar categorias', 500)
    }
  })

  // GET /api/categories/:id - Get category by ID
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      tags: ['Categories'],
      summary: 'Get category by ID',
      description: 'Get a specific category with product/service count'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const category = await categoryService.getCategoryById(id)
      
      return successResponse(category, 'Categoria encontrada com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error && error.message === 'Categoria não encontrada') {
        return errorResponse(reply, error.message, 404)
      }
      
      return errorResponse(reply, 'Erro ao buscar categoria', 500)
    }
  })

  // POST /api/categories - Create new category
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['PRODUCT', 'SERVICE'] },
          description: { type: 'string' }
        }
      },
      tags: ['Categories'],
      summary: 'Create category',
      description: 'Create a new category record'
    }
  }, async (request, reply) => {
    try {
      const categoryData = createCategorySchema.parse(request.body)
      
      const category = await categoryService.createCategory(categoryData)
      
      return successResponse(category, 'Categoria criada com sucesso', 201)
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error) {
        if (error.message.includes('nome')) {
          return errorResponse(reply, error.message, 400)
        }
      }
      
      return errorResponse(reply, 'Erro ao criar categoria', 500)
    }
  })

  // PUT /api/categories/:id - Update category
  fastify.put('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['PRODUCT', 'SERVICE'] },
          description: { type: 'string' },
          active: { type: 'boolean' }
        }
      },
      tags: ['Categories'],
      summary: 'Update category',
      description: 'Update an existing category record'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const updateData = updateCategorySchema.parse(request.body)
      
      const category = await categoryService.updateCategory(id, updateData)
      
      return successResponse(category, 'Categoria atualizada com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error) {
        if (error.message === 'Categoria não encontrada') {
          return errorResponse(reply, error.message, 404)
        }
        if (error.message.includes('nome')) {
          return errorResponse(reply, error.message, 400)
        }
      }
      
      return errorResponse(reply, 'Erro ao atualizar categoria', 500)
    }
  })

  // DELETE /api/categories/:id - Delete category
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      tags: ['Categories'],
      summary: 'Delete category',
      description: 'Delete a category record (soft delete if has associated products/services)'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      await categoryService.deleteCategory(id)
      
      return successResponse(null, 'Categoria removida com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error && error.message === 'Categoria não encontrada') {
        return errorResponse(reply, error.message, 404)
      }
      
      return errorResponse(reply, 'Erro ao remover categoria', 500)
    }
  })
}

export default categoriesRoutes