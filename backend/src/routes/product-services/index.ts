import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { PrismaProductServiceRepository } from '../../repositories/product-service.repository'
import { PrismaCategoryRepository } from '../../repositories/category.repository'
import { ProductServiceService } from '../../services/product-service.service'
import { 
  createProductServiceSchema, 
  updateProductServiceSchema, 
  paginationSchema, 
  searchSchema 
} from '../../schemas/validation'
import { successResponse, errorResponse } from '../../utils/response'
import { ServiceType } from '../../types/shared'

const productServicesRoutes: FastifyPluginAsync = async (fastify) => {
  const productServiceRepository = new PrismaProductServiceRepository(fastify.prisma)
  const categoryRepository = new PrismaCategoryRepository(fastify.prisma)
  const productServiceService = new ProductServiceService(productServiceRepository, categoryRepository)

  // GET /api/product-services - List all products/services with pagination and search
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string' },
          limit: { type: 'string' },
          q: { type: 'string' },
          type: { type: 'string', enum: ['PRODUCT', 'SERVICE'] },
          categoryId: { type: 'string' },
          active: { type: 'string' },
          availableForBooking: { type: 'string' }
        }
      },
      tags: ['Product Services'],
      summary: 'List products and services',
      description: 'Get a paginated list of products and services with optional search and filters'
    }
  }, async (request, reply) => {
    try {
      const queryParams = paginationSchema.merge(searchSchema).extend({
        type: z.nativeEnum(ServiceType).optional(),
        categoryId: z.string().cuid().optional(),
        availableForBooking: z.string().transform((val) => val === 'true').optional()
      }).parse(request.query)
      
      const { page, limit, q: search, type, categoryId, active, availableForBooking } = queryParams
      
      const result = await productServiceService.getAllProductServices({
        page,
        limit,
        search,
        type,
        categoryId,
        active,
        availableForBooking
      })

      return successResponse(result, 'Produtos/Serviços listados com sucesso')
    } catch (error) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao listar produtos/serviços', 500)
    }
  })

  // GET /api/product-services/search - Search products/services
  fastify.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          page: { type: 'string' },
          limit: { type: 'string' },
          type: { type: 'string', enum: ['PRODUCT', 'SERVICE'] },
          categoryId: { type: 'string' },
          active: { type: 'string' },
          availableForBooking: { type: 'string' }
        }
      },
      tags: ['Product Services'],
      summary: 'Search products and services',
      description: 'Search products and services by name, description, or internal code'
    }
  }, async (request, reply) => {
    try {
      const queryParams = searchSchema.merge(paginationSchema).extend({
        type: z.nativeEnum(ServiceType).optional(),
        categoryId: z.string().cuid().optional(),
        availableForBooking: z.string().transform((val) => val === 'true').optional()
      }).parse(request.query)
      
      const { q: query, page, limit, type, categoryId, active, availableForBooking } = queryParams
      
      if (!query) {
        return errorResponse(reply, 'Parâmetro de busca é obrigatório', 400)
      }

      const result = await productServiceService.searchProductServices(query, {
        page,
        limit,
        type,
        categoryId,
        active,
        availableForBooking
      })

      return successResponse(result, 'Busca realizada com sucesso')
    } catch (error) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao buscar produtos/serviços', 500)
    }
  })

  // GET /api/product-services/bookable - Get bookable services
  fastify.get('/bookable', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string' },
          limit: { type: 'string' },
          q: { type: 'string' },
          categoryId: { type: 'string' }
        }
      },
      tags: ['Product Services'],
      summary: 'Get bookable services',
      description: 'Get services available for booking'
    }
  }, async (request, reply) => {
    try {
      const queryParams = paginationSchema.merge(searchSchema).extend({
        categoryId: z.string().cuid().optional()
      }).parse(request.query)
      
      const { page, limit, q: search, categoryId } = queryParams
      
      const result = await productServiceService.getBookableServices({
        page,
        limit,
        search,
        categoryId
      })

      return successResponse(result, 'Serviços disponíveis para agendamento listados com sucesso')
    } catch (error) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao listar serviços disponíveis', 500)
    }
  })

  // GET /api/product-services/stock/low - Get products with low stock
  fastify.get('/stock/low', {
    schema: {
      tags: ['Product Services'],
      summary: 'Get low stock products',
      description: 'Get products with stock levels below minimum threshold'
    }
  }, async (request, reply) => {
    try {
      const result = await productServiceService.getLowStockProducts()
      return successResponse(result, 'Produtos com estoque baixo listados com sucesso')
    } catch (error) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao listar produtos com estoque baixo', 500)
    }
  })

  // GET /api/product-services/stock/report - Get stock report
  fastify.get('/stock/report', {
    schema: {
      tags: ['Product Services'],
      summary: 'Get stock report',
      description: 'Get comprehensive stock report with statistics'
    }
  }, async (request, reply) => {
    try {
      const result = await productServiceService.getStockReport()
      return successResponse(result, 'Relatório de estoque gerado com sucesso')
    } catch (error) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao gerar relatório de estoque', 500)
    }
  })

  // GET /api/product-services/category/:categoryId - Get products/services by category
  fastify.get('/category/:categoryId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          categoryId: { type: 'string' }
        },
        required: ['categoryId']
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string' },
          limit: { type: 'string' },
          q: { type: 'string' },
          active: { type: 'string' },
          availableForBooking: { type: 'string' }
        }
      },
      tags: ['Product Services'],
      summary: 'Get products/services by category',
      description: 'Get products and services filtered by category'
    }
  }, async (request, reply) => {
    try {
      const { categoryId } = request.params as { categoryId: string }
      const queryParams = paginationSchema.merge(searchSchema).extend({
        availableForBooking: z.string().transform((val) => val === 'true').optional()
      }).parse(request.query)
      
      const { page, limit, q: search, active, availableForBooking } = queryParams
      
      const result = await productServiceService.getProductServicesByCategory(categoryId, {
        page,
        limit,
        search,
        active,
        availableForBooking
      })

      return successResponse(result, 'Produtos/Serviços da categoria listados com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error && error.message === 'Categoria não encontrada') {
        return errorResponse(reply, error.message, 404)
      }
      
      return errorResponse(reply, 'Erro ao listar produtos/serviços da categoria', 500)
    }
  })

  // GET /api/product-services/:id - Get product/service by ID
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      tags: ['Product Services'],
      summary: 'Get product/service by ID',
      description: 'Get a specific product or service with full details'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const productService = await productServiceService.getProductServiceById(id)
      
      return successResponse(productService, 'Produto/Serviço encontrado com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error && error.message === 'Produto/Serviço não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      
      return errorResponse(reply, 'Erro ao buscar produto/serviço', 500)
    }
  })

  // POST /api/product-services - Create new product/service
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'type', 'categoryId', 'salePrice'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['PRODUCT', 'SERVICE'] },
          categoryId: { type: 'string' },
          internalCode: { type: 'string' },
          description: { type: 'string' },
          salePrice: { type: 'number' },
          costPrice: { type: 'number' },
          partnerPrice: { type: 'number' },
          durationMinutes: { type: 'number' },
          availableForBooking: { type: 'boolean' },
          requiresSpecialPrep: { type: 'boolean' },
          specialPrepDetails: { type: 'string' },
          stockLevel: { type: 'number' },
          minStockLevel: { type: 'number' },
          observations: { type: 'string' }
        }
      },
      tags: ['Product Services'],
      summary: 'Create product/service',
      description: 'Create a new product or service record'
    }
  }, async (request, reply) => {
    try {
      const productServiceData = createProductServiceSchema.parse(request.body)
      
      const productService = await productServiceService.createProductService(productServiceData)
      
      return successResponse(productService, 'Produto/Serviço criado com sucesso', 201)
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error) {
        if (error.message.includes('nome') || 
            error.message.includes('código') || 
            error.message.includes('categoria') ||
            error.message.includes('preço') ||
            error.message.includes('estoque') ||
            error.message.includes('duração')) {
          return errorResponse(reply, error.message, 400)
        }
      }
      
      return errorResponse(reply, 'Erro ao criar produto/serviço', 500)
    }
  })

  // PUT /api/product-services/:id - Update product/service
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
          categoryId: { type: 'string' },
          internalCode: { type: 'string' },
          description: { type: 'string' },
          salePrice: { type: 'number' },
          costPrice: { type: 'number' },
          partnerPrice: { type: 'number' },
          durationMinutes: { type: 'number' },
          availableForBooking: { type: 'boolean' },
          requiresSpecialPrep: { type: 'boolean' },
          specialPrepDetails: { type: 'string' },
          stockLevel: { type: 'number' },
          minStockLevel: { type: 'number' },
          active: { type: 'boolean' },
          observations: { type: 'string' }
        }
      },
      tags: ['Product Services'],
      summary: 'Update product/service',
      description: 'Update an existing product or service record'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const updateData = updateProductServiceSchema.parse(request.body)
      
      const productService = await productServiceService.updateProductService(id, updateData)
      
      return successResponse(productService, 'Produto/Serviço atualizado com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error) {
        if (error.message === 'Produto/Serviço não encontrado') {
          return errorResponse(reply, error.message, 404)
        }
        if (error.message.includes('nome') || 
            error.message.includes('código') || 
            error.message.includes('categoria') ||
            error.message.includes('preço') ||
            error.message.includes('estoque') ||
            error.message.includes('duração')) {
          return errorResponse(reply, error.message, 400)
        }
      }
      
      return errorResponse(reply, 'Erro ao atualizar produto/serviço', 500)
    }
  })

  // PATCH /api/product-services/:id/stock - Update product stock
  fastify.patch('/:id/stock', {
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
        required: ['quantity', 'operation'],
        properties: {
          quantity: { type: 'number' },
          operation: { type: 'string', enum: ['add', 'subtract', 'set'] }
        }
      },
      tags: ['Product Services'],
      summary: 'Update product stock',
      description: 'Update stock level for a product'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const stockUpdate = z.object({
        quantity: z.number().min(0),
        operation: z.enum(['add', 'subtract', 'set'])
      }).parse(request.body)
      
      const productService = await productServiceService.updateStock(id, stockUpdate)
      
      return successResponse(productService, 'Estoque atualizado com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error) {
        if (error.message === 'Produto/Serviço não encontrado') {
          return errorResponse(reply, error.message, 404)
        }
        if (error.message.includes('estoque') || 
            error.message.includes('produto') ||
            error.message.includes('operação')) {
          return errorResponse(reply, error.message, 400)
        }
      }
      
      return errorResponse(reply, 'Erro ao atualizar estoque', 500)
    }
  })

  // DELETE /api/product-services/:id - Delete product/service
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      tags: ['Product Services'],
      summary: 'Delete product/service',
      description: 'Delete a product or service record (soft delete if has associated appointments)'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      await productServiceService.deleteProductService(id)
      
      return successResponse(null, 'Produto/Serviço removido com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error && error.message === 'Produto/Serviço não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      
      return errorResponse(reply, 'Erro ao remover produto/serviço', 500)
    }
  })
}

export default productServicesRoutes