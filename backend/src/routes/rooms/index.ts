import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { PrismaRoomRepository } from '../../repositories/room.repository'
import { RoomService } from '../../services/room.service'
import { 
  createRoomSchema, 
  updateRoomSchema, 
  paginationSchema, 
  searchSchema 
} from '../../schemas/validation'
import { successResponse, errorResponse } from '../../utils/response'

const roomsRoutes: FastifyPluginAsync = async (fastify) => {
  const roomRepository = new PrismaRoomRepository(fastify.prisma)
  const roomService = new RoomService(roomRepository)

  // GET /api/rooms - List all rooms with pagination and search
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string' },
          limit: { type: 'string' },
          q: { type: 'string' },
          active: { type: 'string' }
        }
      },
      tags: ['Rooms'],
      summary: 'List rooms',
      description: 'Get a paginated list of rooms with optional search and filters'
    }
  }, async (request, reply) => {
    try {
      const queryParams = paginationSchema.merge(searchSchema).parse(request.query)
      const { page, limit, q: search, active } = queryParams
      
      const result = await roomService.getAllRooms({
        page,
        limit,
        search,
        active
      })

      return successResponse(result, 'Salas listadas com sucesso')
    } catch (error) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao listar salas', 500)
    }
  })

  // GET /api/rooms/search - Search rooms (alternative endpoint)
  fastify.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          page: { type: 'string' },
          limit: { type: 'string' },
          active: { type: 'string' }
        }
      },
      tags: ['Rooms'],
      summary: 'Search rooms',
      description: 'Search rooms by name, description, or resources'
    }
  }, async (request, reply) => {
    try {
      const queryParams = searchSchema.merge(paginationSchema).parse(request.query)
      const { q: query, page, limit, active } = queryParams
      
      if (!query) {
        return errorResponse(reply, 'Parâmetro de busca é obrigatório', 400)
      }

      const result = await roomService.searchRooms(query, {
        page,
        limit,
        active
      })

      return successResponse(result, 'Busca realizada com sucesso')
    } catch (error) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao buscar salas', 500)
    }
  })

  // GET /api/rooms/:id - Get room by ID
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      tags: ['Rooms'],
      summary: 'Get room by ID',
      description: 'Get a specific room with its associated services and recent appointments'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const room = await roomService.getRoomById(id)
      
      return successResponse(room, 'Sala encontrada com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error && error.message === 'Sala não encontrada') {
        return errorResponse(reply, error.message, 404)
      }
      
      return errorResponse(reply, 'Erro ao buscar sala', 500)
    }
  })

  // GET /api/rooms/:id/availability - Get room availability for a specific date
  fastify.get('/:id/availability', {
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
          date: { type: 'string' }
        },
        required: ['date']
      },
      tags: ['Rooms'],
      summary: 'Get room availability',
      description: 'Get room availability for a specific date'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { date } = request.query as { date: string }
      
      const targetDate = new Date(date)
      if (isNaN(targetDate.getTime())) {
        return errorResponse(reply, 'Data inválida', 400)
      }
      
      const availability = await roomService.getRoomAvailability(id, targetDate)
      
      return successResponse(availability, 'Disponibilidade da sala obtida com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error && error.message === 'Sala não encontrada') {
        return errorResponse(reply, error.message, 404)
      }
      
      return errorResponse(reply, 'Erro ao buscar disponibilidade da sala', 500)
    }
  })

  // POST /api/rooms - Create new room
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          resources: { 
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      tags: ['Rooms'],
      summary: 'Create room',
      description: 'Create a new room record'
    }
  }, async (request, reply) => {
    try {
      const roomData = createRoomSchema.parse(request.body)
      
      const room = await roomService.createRoom(roomData)
      
      return successResponse(room, 'Sala criada com sucesso', 201)
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error) {
        if (error.message.includes('nome')) {
          return errorResponse(reply, error.message, 400)
        }
      }
      
      return errorResponse(reply, 'Erro ao criar sala', 500)
    }
  })

  // PUT /api/rooms/:id - Update room
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
          description: { type: 'string' },
          resources: { 
            type: 'array',
            items: { type: 'string' }
          },
          active: { type: 'boolean' }
        }
      },
      tags: ['Rooms'],
      summary: 'Update room',
      description: 'Update an existing room record'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      fastify.log.info(`Room update request: ${id} - ${JSON.stringify(request.body)}`)
      
      const updateData = createRoomSchema.partial().extend({
        active: z.boolean().optional()
      }).parse(request.body)
      
      fastify.log.info(`Parsed update data: ${JSON.stringify(updateData)}`)
      
      const room = await roomService.updateRoom(id, updateData)
      
      return successResponse(room, 'Sala atualizada com sucesso')
    } catch (error) {
      fastify.log.error(`Room update error: ${error instanceof Error ? error.message : String(error)}`)
      
      if (error instanceof Error) {
        if (error.message === 'Sala não encontrada') {
          return errorResponse(reply, error.message, 404)
        }
        if (error.message.includes('nome')) {
          return errorResponse(reply, error.message, 400)
        }
        // Return the actual error message for debugging
        return errorResponse(reply, `Erro ao atualizar sala: ${error.message}`, 500)
      }
      
      return errorResponse(reply, 'Erro ao atualizar sala: erro desconhecido', 500)
    }
  })

  // DELETE /api/rooms/:id - Delete room
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      tags: ['Rooms'],
      summary: 'Delete room',
      description: 'Delete a room record (soft delete if has appointments)'
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      await roomService.deleteRoom(id)
      
      return successResponse(null, 'Sala removida com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error && error.message === 'Sala não encontrada') {
        return errorResponse(reply, error.message, 404)
      }
      
      return errorResponse(reply, 'Erro ao remover sala', 500)
    }
  })
}

export default roomsRoutes