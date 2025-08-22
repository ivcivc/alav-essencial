import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { clinicSettingsService } from '../../services/clinic-settings.service'
import { successResponse, errorResponse } from '../../utils/response'

export default async function clinicSettingsRoutes(fastify: FastifyInstance) {
  
  // GET /api/clinic-settings - Buscar configurações da clínica
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const settings = await clinicSettingsService.getSettings()
      return reply.send(successResponse(settings, 'Configurações obtidas com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse(error instanceof Error ? error.message : 'Erro interno'))
    }
  })

  // PUT /api/clinic-settings - Atualizar configurações da clínica
  fastify.put('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          hours: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                dayOfWeek: { type: 'number', minimum: 0, maximum: 6 },
                isOpen: { type: 'boolean' },
                openTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
                closeTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
                lunchBreakStart: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
                lunchBreakEnd: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' }
              },
              required: ['dayOfWeek', 'isOpen']
            }
          },
          allowWeekendBookings: { type: 'boolean' },
          advanceBookingDays: { type: 'number', minimum: 1 },
          minBookingHours: { type: 'number', minimum: 0 },
          maxBookingDays: { type: 'number', minimum: 1 },
          allowCancelledMovement: { type: 'boolean' },
          allowCompletedMovement: { type: 'boolean' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Body: {
      name?: string
      hours?: any[]
      allowWeekendBookings?: boolean
      advanceBookingDays?: number
      minBookingHours?: number
      maxBookingDays?: number
      allowCancelledMovement?: boolean
      allowCompletedMovement?: boolean
    }
  }>, reply: FastifyReply) => {
    try {
      const updatedSettings = await clinicSettingsService.updateSettings(request.body)
      return reply.send(successResponse(updatedSettings, 'Configurações atualizadas com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao atualizar configurações'))
    }
  })

  // POST /api/clinic-settings/validate-hours - Validar horário de funcionamento
  fastify.post('/validate-hours', {
    schema: {
      body: {
        type: 'object',
        required: ['date', 'startTime', 'endTime'],
        properties: {
          date: { type: 'string', format: 'date' },
          startTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
          endTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Body: {
      date: string
      startTime: string
      endTime: string
    }
  }>, reply: FastifyReply) => {
    try {
      const { date, startTime, endTime } = request.body
      const validation = await clinicSettingsService.validateBusinessHours(new Date(date), startTime, endTime)
      return reply.send(successResponse(validation, 'Validação de horário realizada'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro na validação'))
    }
  })

  // POST /api/clinic-settings/validate-movement - Validar movimentação de agendamento
  fastify.post('/validate-movement', {
    schema: {
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Body: {
      status: string
    }
  }>, reply: FastifyReply) => {
    try {
      const { status } = request.body
      const validation = await clinicSettingsService.validateAppointmentMovement(status)
      return reply.send(successResponse(validation, 'Validação de movimentação realizada'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro na validação'))
    }
  })
}