import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { AppointmentService } from '../../services/appointment.service'
import { PrismaAppointmentRepository } from '../../repositories/appointment.repository'
import { PrismaPartnerRepository } from '../../repositories/partner.repository'
import { PrismaPatientRepository } from '../../repositories/patient.repository'
import { PrismaRoomRepository } from '../../repositories/room.repository'
import { PrismaProductServiceRepository } from '../../repositories/product-service.repository'
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema,
  rescheduleAppointmentSchema,
  checkAvailabilitySchema,
  appointmentFiltersSchema
} from '../../schemas/appointment'
import { successResponse, errorResponse } from '../../utils/response'

export default async function appointmentsRoutes(fastify: FastifyInstance) {
  // Initialize repositories and service
  const appointmentRepository = new PrismaAppointmentRepository(fastify.prisma)
  const partnerRepository = new PrismaPartnerRepository(fastify.prisma)
  const patientRepository = new PrismaPatientRepository(fastify.prisma)
  const roomRepository = new PrismaRoomRepository(fastify.prisma)
  const productServiceRepository = new PrismaProductServiceRepository(fastify.prisma)
  
  const appointmentService = new AppointmentService(
    appointmentRepository,
    partnerRepository,
    patientRepository,
    roomRepository,
    productServiceRepository
  )

  // GET /api/appointments - List appointments with filters
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          patientId: { type: 'string' },
          partnerId: { type: 'string' },
          roomId: { type: 'string' },
          productServiceId: { type: 'string' },
          date: { type: 'string', format: 'date' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          status: { type: 'string', enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] },
          type: { type: 'string', enum: ['CONSULTATION', 'EXAM', 'PROCEDURE', 'RETURN'] },
          page: { type: 'string', pattern: '^\\d+$' },
          limit: { type: 'string', pattern: '^\\d+$' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const filters = appointmentFiltersSchema.parse(request.query)
      const result = await appointmentService.getAllAppointments(filters)
      
      return reply.send(successResponse(result, 'Agendamentos listados com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao listar agendamentos'))
    }
  })

  // GET /api/appointments/:id - Get appointment by ID
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const appointment = await appointmentService.getAppointmentById(request.params.id)
      return reply.send(successResponse(appointment, 'Agendamento encontrado com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(404).send(errorResponse(error instanceof Error ? error.message : 'Agendamento não encontrado', 404))
    }
  })

  // POST /api/appointments - Create new appointment
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['patientId', 'partnerId', 'productServiceId', 'date', 'startTime', 'type'],
        properties: {
          patientId: { type: 'string' },
          partnerId: { type: 'string' },
          productServiceId: { type: 'string' },
          roomId: { type: 'string' },
          date: { type: 'string', format: 'date' },
          startTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
          endTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
          type: { type: 'string', enum: ['CONSULTATION', 'EXAM', 'PROCEDURE', 'RETURN'] },
          observations: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const appointmentData = createAppointmentSchema.parse(request.body)
      const appointment = await appointmentService.createAppointment(appointmentData)
      
      return reply.code(201).send(successResponse(appointment, 'Agendamento criado com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao criar agendamento'))
    }
  })

  // PUT /api/appointments/:id - Update appointment
  fastify.put('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          patientId: { type: 'string' },
          partnerId: { type: 'string' },
          productServiceId: { type: 'string' },
          roomId: { type: ['string', 'null'] },
          date: { type: 'string', format: 'date' },
          startTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
          endTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
          type: { type: 'string', enum: ['CONSULTATION', 'EXAM', 'PROCEDURE', 'RETURN'] },
          status: { type: 'string', enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] },
          observations: { type: 'string' },
          cancellationReason: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const appointmentData = updateAppointmentSchema.parse(request.body)
      const appointment = await appointmentService.updateAppointment(request.params.id, appointmentData)
      
      return reply.send(successResponse(appointment, 'Agendamento atualizado com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao atualizar agendamento'))
    }
  })

  // DELETE /api/appointments/:id - Delete appointment
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await appointmentService.deleteAppointment(request.params.id)
      return reply.send(successResponse(null, 'Agendamento excluído com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao excluir agendamento'))
    }
  })

  // POST /api/appointments/:id/cancel - Cancel appointment
  fastify.post('/:id/cancel', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { reason } = cancelAppointmentSchema.parse(request.body)
      const appointment = await appointmentService.cancelAppointment(request.params.id, reason)
      
      return reply.send(successResponse(appointment, 'Agendamento cancelado com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao cancelar agendamento'))
    }
  })

  // POST /api/appointments/:id/reschedule - Reschedule appointment
  fastify.post('/:id/reschedule', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['newDate', 'newStartTime', 'newEndTime'],
        properties: {
          newDate: { type: 'string', format: 'date' },
          newStartTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
          newEndTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
          newRoomId: { type: ['string', 'null'] },
          reason: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const rescheduleData = rescheduleAppointmentSchema.parse(request.body)
      const appointment = await appointmentService.rescheduleAppointment({
        appointmentId: request.params.id,
        ...rescheduleData
      })
      
      return reply.send(successResponse(appointment, 'Agendamento reagendado com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao reagendar agendamento'))
    }
  })

  // POST /api/appointments/:id/checkin - Check-in appointment
  fastify.post('/:id/checkin', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const appointment = await appointmentService.checkInAppointment(request.params.id)
      return reply.send(successResponse(appointment, 'Check-in realizado com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao realizar check-in'))
    }
  })

  // POST /api/appointments/:id/checkout - Check-out appointment
  fastify.post('/:id/checkout', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const appointment = await appointmentService.checkOutAppointment(request.params.id)
      return reply.send(successResponse(appointment, 'Check-out realizado com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao realizar check-out'))
    }
  })

  // POST /api/appointments/:id/undo-checkin - Undo check-in
  fastify.post('/:id/undo-checkin', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }
      const appointment = await appointmentService.undoCheckIn(id)
      
      return reply.send(successResponse(appointment, 'Check-in desfeito com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao desfazer check-in'))
    }
  })

  // POST /api/appointments/:id/undo-checkout - Undo check-out
  fastify.post('/:id/undo-checkout', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }
      const appointment = await appointmentService.undoCheckOut(id)
      
      return reply.send(successResponse(appointment, 'Check-out desfeito com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao desfazer check-out'))
    }
  })

  // POST /api/appointments/check-availability - Check availability
  fastify.post('/check-availability', {
    schema: {
      body: {
        type: 'object',
        required: ['partnerId', 'date', 'startTime', 'endTime'],
        properties: {
          partnerId: { type: 'string' },
          roomId: { type: 'string' },
          date: { type: 'string', format: 'date' },
          startTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
          endTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
          excludeAppointmentId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const availabilityData = checkAvailabilitySchema.parse(request.body)
      const result = await appointmentService.checkAvailability(availabilityData)
      
      return reply.send(successResponse(result, 'Disponibilidade verificada com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao verificar disponibilidade'))
    }
  })

  // GET /api/appointments/date-range - Get appointments by date range
  fastify.get('/date-range', {
    schema: {
      querystring: {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          patientId: { type: 'string' },
          partnerId: { type: 'string' },
          roomId: { type: 'string' },
          productServiceId: { type: 'string' },
          status: { type: 'string', enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] },
          type: { type: 'string', enum: ['CONSULTATION', 'EXAM', 'PROCEDURE', 'RETURN'] }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any
      const startDate = new Date(query.startDate)
      const endDate = new Date(query.endDate)
      
      const filters = {
        patientId: query.patientId,
        partnerId: query.partnerId,
        roomId: query.roomId,
        productServiceId: query.productServiceId,
        status: query.status,
        type: query.type
      }

      const appointments = await appointmentService.getAppointmentsByDateRange(startDate, endDate, filters)
      return reply.send(successResponse(appointments, 'Agendamentos encontrados com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao buscar agendamentos'))
    }
  })
}
