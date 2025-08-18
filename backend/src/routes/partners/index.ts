import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { PrismaPartnerRepository } from '../../repositories/partner.repository'
import { PartnerService } from '../../services/partner.service'
import { 
  createPartnerSchema, 
  updatePartnerSchema, 
  createPartnerAvailabilitySchema,
  updatePartnerAvailabilitySchema,
  createPartnerServiceSchema,
  paginationSchema, 
  searchSchema 
} from '../../schemas/validation'
import { successResponse, errorResponse } from '../../utils/response'
import { PartnershipType } from '../../types/shared'

const partnersRoutes: FastifyPluginAsync = async (fastify) => {
  const partnerRepository = new PrismaPartnerRepository(fastify.prisma)
  const partnerService = new PartnerService(partnerRepository)

  // GET /api/partners - List all partners with pagination and search
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string' },
          limit: { type: 'string' },
          q: { type: 'string' },
          active: { type: 'string' },
          partnershipType: { type: 'string', enum: Object.values(PartnershipType) }
        }
      },
      tags: ['Partners'],
      summary: 'List partners',
      description: 'Get a paginated list of partners with optional search and filters'
    }
  }, async (request, reply) => {
    try {
      const queryParams = paginationSchema.merge(searchSchema).extend({
        partnershipType: z.string().optional()
      }).parse(request.query)
      
      const { page, limit, q: search, active, partnershipType } = queryParams
      
      const result = await partnerService.getAllPartners({
        page,
        limit,
        search,
        active,
        partnershipType
      })

      return successResponse(result, 'Parceiros listados com sucesso')
    } catch (error) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao listar parceiros', 500)
    }
  })

  // GET /api/partners/search - Search partners (alternative endpoint)
  fastify.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          page: { type: 'string' },
          limit: { type: 'string' },
          active: { type: 'string' },
          partnershipType: { type: 'string', enum: Object.values(PartnershipType) }
        },
        required: ['q']
      },
      tags: ['Partners'],
      summary: 'Search partners',
      description: 'Search partners by name, document, email or phone'
    }
  }, async (request, reply) => {
    try {
      const queryParams = searchSchema.merge(paginationSchema).extend({
        partnershipType: z.string().optional()
      }).parse(request.query)
      
      const { q: query, page, limit, active, partnershipType } = queryParams
      
      if (!query) {
        return errorResponse(reply, 'Parâmetro de busca é obrigatório', 400)
      }

      const result = await partnerService.searchPartners(query, {
        page,
        limit,
        active,
        partnershipType
      })

      return successResponse(result, 'Busca realizada com sucesso')
    } catch (error) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao buscar parceiros', 500)
    }
  })

  // GET /api/partners/:id - Get partner by ID
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      tags: ['Partners'],
      summary: 'Get partner by ID',
      description: 'Get a single partner with full details including availability and services'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const partner = await partnerService.getPartnerById(id)
      
      return successResponse(partner, 'Parceiro encontrado com sucesso')
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message === 'Parceiro não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      return errorResponse(reply, 'Erro ao buscar parceiro', 500)
    }
  })

  // POST /api/partners - Create new partner
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          fullName: { type: 'string', minLength: 1 },
          document: { type: 'string', minLength: 1 },
          phone: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          street: { type: 'string' },
          number: { type: 'string' },
          complement: { type: 'string' },
          neighborhood: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          zipCode: { type: 'string' },
          bank: { type: 'string' },
          agency: { type: 'string' },
          account: { type: 'string' },
          pix: { type: 'string' },
          partnershipType: { type: 'string', enum: ['SUBLEASE', 'PERCENTAGE', 'PERCENTAGE_WITH_PRODUCTS'] },
          subleaseAmount: { type: 'number', minimum: 0 },
          subleasePaymentDay: { type: 'number', minimum: 1, maximum: 31 },
          percentageAmount: { type: 'number', minimum: 0 },
          percentageRate: { type: 'number', minimum: 0, maximum: 100 }
        },
        required: ['fullName', 'document', 'phone', 'email', 'partnershipType']
      },
      tags: ['Partners'],
      summary: 'Create partner',
      description: 'Create a new partner'
    }
  }, async (request, reply) => {
    try {
      const partnerData = createPartnerSchema.parse(request.body)
      const partner = await partnerService.createPartner(partnerData)
      
      return successResponse(partner, 'Parceiro criado com sucesso', 201)
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message.includes('já existe') || error.message.includes('deve conter')) {
        return errorResponse(reply, error.message, 400)
      }
      return errorResponse(reply, 'Erro ao criar parceiro', 500)
    }
  })

  // PUT /api/partners/:id - Update partner
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
          fullName: { type: 'string', minLength: 1 },
          document: { type: 'string', minLength: 1 },
          phone: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          street: { type: 'string' },
          number: { type: 'string' },
          complement: { type: 'string' },
          neighborhood: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          zipCode: { type: 'string' },
          bank: { type: 'string' },
          agency: { type: 'string' },
          account: { type: 'string' },
          pix: { type: 'string' },
          partnershipType: { type: 'string', enum: ['SUBLEASE', 'PERCENTAGE', 'PERCENTAGE_WITH_PRODUCTS'] },
          subleaseAmount: { type: 'number', minimum: 0 },
          subleasePaymentDay: { type: 'number', minimum: 1, maximum: 31 },
          percentageAmount: { type: 'number', minimum: 0 },
          percentageRate: { type: 'number', minimum: 0, maximum: 100 },
          active: { type: 'boolean' }
        }
      },
      tags: ['Partners'],
      summary: 'Update partner',
      description: 'Update an existing partner'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const partnerData = updatePartnerSchema.parse(request.body)
      
      const partner = await partnerService.updatePartner(id, partnerData)
      
      return successResponse(partner, 'Parceiro atualizado com sucesso')
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message === 'Parceiro não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      if (error.message.includes('já existe') || error.message.includes('deve conter')) {
        return errorResponse(reply, error.message, 400)
      }
      return errorResponse(reply, 'Erro ao atualizar parceiro', 500)
    }
  })

  // DELETE /api/partners/:id - Delete partner (soft delete)
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      tags: ['Partners'],
      summary: 'Delete partner',
      description: 'Delete a partner (soft delete if has appointments)'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      await partnerService.deletePartner(id)
      
      return successResponse(null, 'Parceiro excluído com sucesso')
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message === 'Parceiro não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      return errorResponse(reply, 'Erro ao excluir parceiro', 500)
    }
  })

  // AVAILABILITY ROUTES

  // GET /api/partners/:id/availability - Get partner availability
  fastify.get('/:id/availability', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      tags: ['Partners'],
      summary: 'Get partner availability',
      description: 'Get the availability schedule for a partner'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const availability = await partnerService.getPartnerAvailability(id)
      
      return successResponse(availability, 'Disponibilidade do parceiro encontrada com sucesso')
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message === 'Parceiro não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      return errorResponse(reply, 'Erro ao buscar disponibilidade do parceiro', 500)
    }
  })

  // POST /api/partners/:id/availability - Create partner availability
  fastify.post('/:id/availability', {
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
          dayOfWeek: { type: 'number', minimum: 0, maximum: 6 },
          startTime: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
          endTime: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
          breakStart: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
          breakEnd: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' }
        },
        required: ['dayOfWeek', 'startTime', 'endTime']
      },
      tags: ['Partners'],
      summary: 'Create partner availability',
      description: 'Add availability schedule for a partner'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const availabilityData = createPartnerAvailabilitySchema.omit({ partnerId: true }).parse(request.body)
      
      const availability = await partnerService.createPartnerAvailability({
        ...availabilityData,
        partnerId: id
      })
      
      return successResponse(availability, 'Disponibilidade criada com sucesso', 201)
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message === 'Parceiro não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      if (error.message.includes('deve') || error.message.includes('anterior')) {
        return errorResponse(reply, error.message, 400)
      }
      return errorResponse(reply, 'Erro ao criar disponibilidade', 500)
    }
  })

  // PUT /api/partners/availability/:availabilityId - Update partner availability
  fastify.put('/availability/:availabilityId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          availabilityId: { type: 'string' }
        },
        required: ['availabilityId']
      },
      body: {
        type: 'object',
        properties: {
          dayOfWeek: { type: 'number', minimum: 0, maximum: 6 },
          startTime: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
          endTime: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
          breakStart: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
          breakEnd: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
          active: { type: 'boolean' }
        }
      },
      tags: ['Partners'],
      summary: 'Update partner availability',
      description: 'Update an existing partner availability schedule'
    }
  }, async (request, reply) => {
    try {
      const { availabilityId } = request.params as { availabilityId: string }
      const availabilityData = updatePartnerAvailabilitySchema.parse(request.body)
      
      const availability = await partnerService.updatePartnerAvailability(availabilityId, availabilityData)
      
      return successResponse(availability, 'Disponibilidade atualizada com sucesso')
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message.includes('deve') || error.message.includes('anterior')) {
        return errorResponse(reply, error.message, 400)
      }
      return errorResponse(reply, 'Erro ao atualizar disponibilidade', 500)
    }
  })

  // DELETE /api/partners/availability/:availabilityId - Delete partner availability
  fastify.delete('/availability/:availabilityId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          availabilityId: { type: 'string' }
        },
        required: ['availabilityId']
      },
      tags: ['Partners'],
      summary: 'Delete partner availability',
      description: 'Delete a partner availability schedule'
    }
  }, async (request, reply) => {
    try {
      const { availabilityId } = request.params as { availabilityId: string }
      await partnerService.deletePartnerAvailability(availabilityId)
      
      return successResponse(null, 'Disponibilidade excluída com sucesso')
    } catch (error: any) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao excluir disponibilidade', 500)
    }
  })

  // SERVICE ASSOCIATION ROUTES

  // GET /api/partners/:id/services - Get partner services
  fastify.get('/:id/services', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      tags: ['Partners'],
      summary: 'Get partner services',
      description: 'Get all services associated with a partner'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const services = await partnerService.getPartnerServices(id)
      
      return successResponse(services, 'Serviços do parceiro encontrados com sucesso')
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message === 'Parceiro não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      return errorResponse(reply, 'Erro ao buscar serviços do parceiro', 500)
    }
  })

  // POST /api/partners/:id/services - Associate service with partner
  fastify.post('/:id/services', {
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
          productServiceId: { type: 'string' }
        },
        required: ['productServiceId']
      },
      tags: ['Partners'],
      summary: 'Associate service with partner',
      description: 'Associate a service with a partner'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { productServiceId } = request.body as { productServiceId: string }
      
      const association = await partnerService.associatePartnerService(id, productServiceId)
      
      return successResponse(association, 'Serviço associado com sucesso', 201)
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message === 'Parceiro não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      if (error.message.includes('já está associado')) {
        return errorResponse(reply, error.message, 400)
      }
      return errorResponse(reply, 'Erro ao associar serviço', 500)
    }
  })

  // DELETE /api/partners/:id/services/:serviceId - Dissociate service from partner
  fastify.delete('/:id/services/:serviceId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          serviceId: { type: 'string' }
        },
        required: ['id', 'serviceId']
      },
      tags: ['Partners'],
      summary: 'Dissociate service from partner',
      description: 'Remove service association from a partner'
    }
  }, async (request, reply) => {
    try {
      const { id, serviceId } = request.params as { id: string, serviceId: string }
      
      await partnerService.dissociatePartnerService(id, serviceId)
      
      return successResponse(null, 'Serviço desassociado com sucesso')
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message === 'Parceiro não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      return errorResponse(reply, 'Erro ao desassociar serviço', 500)
    }
  })

  // PUT /api/partners/:id/services - Update all partner services
  fastify.put('/:id/services', {
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
          productServiceIds: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['productServiceIds']
      },
      tags: ['Partners'],
      summary: 'Update all partner services',
      description: 'Replace all service associations for a partner'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { productServiceIds } = request.body as { productServiceIds: string[] }
      
      await partnerService.updatePartnerServices(id, productServiceIds)
      
      return successResponse(null, 'Serviços do parceiro atualizados com sucesso')
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message === 'Parceiro não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      return errorResponse(reply, 'Erro ao atualizar serviços do parceiro', 500)
    }
  })

  // GET /api/partners/:id/blocked-dates - Get partner blocked dates
  fastify.get('/:id/blocked-dates', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      },
      tags: ['Partners'],
      summary: 'Get partner blocked dates',
      description: 'Get blocked dates for a specific partner'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { startDate, endDate } = request.query as { startDate?: string, endDate?: string }

      const startDateObj = startDate ? new Date(startDate) : undefined
      const endDateObj = endDate ? new Date(endDate) : undefined

      const blockedDates = await partnerService.getPartnerBlockedDates(id, startDateObj, endDateObj)
      
      return successResponse(blockedDates)
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message === 'Parceiro não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      return errorResponse(reply, 'Erro ao buscar datas bloqueadas do parceiro', 500)
    }
  })

  // POST /api/partners/:id/blocked-dates - Create blocked date
  fastify.post('/:id/blocked-dates', {
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
          blockedDate: { type: 'string', format: 'date' },
          startTime: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
          endTime: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
          reason: { type: 'string' }
        },
        required: ['blockedDate']
      },
      tags: ['Partners'],
      summary: 'Create blocked date',
      description: 'Create a blocked date for a partner'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const body = request.body as any

      const blockedDate = await partnerService.createPartnerBlockedDate({
        partnerId: id,
        blockedDate: new Date(body.blockedDate),
        startTime: body.startTime,
        endTime: body.endTime,
        reason: body.reason
      })
      
      return successResponse(blockedDate, 'Data bloqueada criada com sucesso')
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message === 'Parceiro não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      return errorResponse(reply, error.message || 'Erro ao criar data bloqueada', 500)
    }
  })

  // PUT /api/partners/blocked-dates/:blockedDateId - Update blocked date
  fastify.put('/blocked-dates/:blockedDateId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          blockedDateId: { type: 'string' }
        },
        required: ['blockedDateId']
      },
      body: {
        type: 'object',
        properties: {
          blockedDate: { type: 'string', format: 'date' },
          startTime: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
          endTime: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
          reason: { type: 'string' },
          active: { type: 'boolean' }
        }
      },
      tags: ['Partners'],
      summary: 'Update blocked date',
      description: 'Update a blocked date'
    }
  }, async (request, reply) => {
    try {
      const { blockedDateId } = request.params as { blockedDateId: string }
      const body = request.body as any

      const updateData: any = {}
      if (body.blockedDate) updateData.blockedDate = new Date(body.blockedDate)
      if (body.startTime !== undefined) updateData.startTime = body.startTime
      if (body.endTime !== undefined) updateData.endTime = body.endTime
      if (body.reason !== undefined) updateData.reason = body.reason
      if (body.active !== undefined) updateData.active = body.active

      const blockedDate = await partnerService.updatePartnerBlockedDate(blockedDateId, updateData)
      
      return successResponse(blockedDate, 'Data bloqueada atualizada com sucesso')
    } catch (error: any) {
      fastify.log.error(error)
      return errorResponse(reply, error.message || 'Erro ao atualizar data bloqueada', 500)
    }
  })

  // DELETE /api/partners/blocked-dates/:blockedDateId - Delete blocked date
  fastify.delete('/blocked-dates/:blockedDateId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          blockedDateId: { type: 'string' }
        },
        required: ['blockedDateId']
      },
      tags: ['Partners'],
      summary: 'Delete blocked date',
      description: 'Delete a blocked date'
    }
  }, async (request, reply) => {
    try {
      const { blockedDateId } = request.params as { blockedDateId: string }

      await partnerService.deletePartnerBlockedDate(blockedDateId)
      
      return successResponse(null, 'Data bloqueada removida com sucesso')
    } catch (error: any) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao remover data bloqueada', 500)
    }
  })

  // POST /api/partners/:id/check-availability - Check availability
  fastify.post('/:id/check-availability', {
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
          date: { type: 'string', format: 'date' },
          startTime: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
          endTime: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' }
        },
        required: ['date', 'startTime', 'endTime']
      },
      tags: ['Partners'],
      summary: 'Check availability',
      description: 'Check if a partner is available at a specific date and time'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const body = request.body as any

      const result = await partnerService.checkPartnerAvailability({
        partnerId: id,
        date: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime
      })
      
      return successResponse(result)
    } catch (error: any) {
      fastify.log.error(error)
      if (error.message === 'Parceiro não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      return errorResponse(reply, 'Erro ao verificar disponibilidade', 500)
    }
  })
}

export default partnersRoutes
