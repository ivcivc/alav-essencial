import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { NotificationService } from '../../services/notification.service'
import { NotificationSchedulerSingleton } from '../../services/notification-scheduler'
import { NotificationProviderFactory } from '../../services/notification-providers'
import { successResponse, errorResponse } from '../../utils/response'
import { NotificationChannel, NotificationReminderType, NotificationStatus } from '../../types/shared'

// 🔔 SCHEMAS ZOD PARA VALIDAÇÃO

const updateConfigurationSchema = z.object({
  enabled: z.boolean().optional(),
  defaultChannel: z.enum(['whatsapp', 'sms', 'email']).optional(),
  firstReminderDays: z.number().int().min(0).max(30).optional(),
  secondReminderDays: z.number().int().min(0).max(30).optional(),
  thirdReminderHours: z.number().int().min(0).max(48).optional(),
  whatsappEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  retryAttempts: z.number().int().min(0).max(10).optional(),
  retryIntervalMinutes: z.number().int().min(1).max(1440).optional()
})

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['FIRST_REMINDER', 'SECOND_REMINDER', 'THIRD_REMINDER', 'IMMEDIATE']),
  channel: z.enum(['WHATSAPP', 'SMS', 'EMAIL']),
  subject: z.string().optional(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  variables: z.any().optional(),
  active: z.boolean().default(true)
})

const updateTemplateSchema = createTemplateSchema.partial()

const sendImmediateNotificationSchema = z.object({
  appointmentId: z.string().min(1, 'ID do agendamento é obrigatório'),
  type: z.enum(['FIRST_REMINDER', 'SECOND_REMINDER', 'THIRD_REMINDER', 'IMMEDIATE']).default('IMMEDIATE'),
  customMessage: z.string().optional(),
  channels: z.array(z.enum(['WHATSAPP', 'SMS', 'EMAIL'])).optional()
})

const getLogsQuerySchema = z.object({
  appointmentId: z.string().optional(),
  channel: z.enum(['WHATSAPP', 'SMS', 'EMAIL']).optional(),
  status: z.enum(['PENDING', 'SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
})

// 🔔 ROTAS DE NOTIFICAÇÕES

export default async function notificationsRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma as PrismaClient
  const notificationService = new NotificationService(prisma)

  // 📊 CONFIGURAÇÃO

  // GET /api/notifications/configuration
  fastify.get('/configuration', {
    schema: {
      description: 'Obter configuração de notificações',
      tags: ['notifications'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const config = await notificationService.getConfiguration()
      return reply.send(successResponse(config, 'Configuração obtida com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse('Erro ao obter configuração'))
    }
  })

  // PUT /api/notifications/configuration
  fastify.put('/configuration', {
    schema: {
      description: 'Atualizar configuração de notificações',
      tags: ['notifications'],
      body: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          defaultChannel: { type: 'string', enum: ['whatsapp', 'sms', 'email'] },
          firstReminderDays: { type: 'integer', minimum: 0, maximum: 30 },
          secondReminderDays: { type: 'integer', minimum: 0, maximum: 30 },
          thirdReminderHours: { type: 'integer', minimum: 0, maximum: 48 },
          whatsappEnabled: { type: 'boolean' },
          smsEnabled: { type: 'boolean' },
          emailEnabled: { type: 'boolean' },
          retryAttempts: { type: 'integer', minimum: 0, maximum: 10 },
          retryIntervalMinutes: { type: 'integer', minimum: 1, maximum: 1440 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedData = updateConfigurationSchema.parse(request.body)
      const config = await notificationService.updateConfiguration(validatedData as any)
      return reply.send(successResponse(config, 'Configuração atualizada com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      if (error instanceof z.ZodError) {
        return reply.code(400).send(errorResponse('Dados inválidos', error.errors[0]?.message))
      }
      return reply.code(500).send(errorResponse('Erro ao atualizar configuração'))
    }
  })

  // 📝 TEMPLATES

  // GET /api/notifications/templates
  fastify.get('/templates', {
    schema: {
      description: 'Listar templates de notificação',
      tags: ['notifications'],
      querystring: {
        type: 'object',
        properties: {
          channel: { type: 'string', enum: ['WHATSAPP', 'SMS', 'EMAIL'] },
          type: { type: 'string', enum: ['FIRST_REMINDER', 'SECOND_REMINDER', 'THIRD_REMINDER', 'IMMEDIATE'] },
          active: { type: 'boolean' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const { channel, type, active } = request.query
      const filters: any = {}
      
      if (channel) filters.channel = channel as NotificationChannel
      if (type) filters.type = type as NotificationReminderType
      if (active !== undefined) filters.active = active

      const templates = await new (require('../../repositories/notification.repository').PrismaNotificationTemplateRepository)(prisma).findAll(filters)
      return reply.send(successResponse(templates, 'Templates obtidos com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse('Erro ao obter templates'))
    }
  })

  // GET /api/notifications/templates/:id
  fastify.get('/templates/:id', {
    schema: {
      description: 'Obter template por ID',
      tags: ['notifications'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const template = await new (require('../../repositories/notification.repository').PrismaNotificationTemplateRepository)(prisma).findById(id)
      
      if (!template) {
        return reply.code(404).send(errorResponse('Template não encontrado'))
      }

      return reply.send(successResponse(template, 'Template obtido com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse('Erro ao obter template'))
    }
  })

  // POST /api/notifications/templates
  fastify.post('/templates', {
    schema: {
      description: 'Criar template de notificação',
      tags: ['notifications'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['FIRST_REMINDER', 'SECOND_REMINDER', 'THIRD_REMINDER', 'IMMEDIATE'] },
          channel: { type: 'string', enum: ['WHATSAPP', 'SMS', 'EMAIL'] },
          subject: { type: 'string' },
          content: { type: 'string' },
          variables: { type: 'object' },
          active: { type: 'boolean' }
        },
        required: ['name', 'type', 'channel', 'content']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedData = createTemplateSchema.parse(request.body)
      const template = await new (require('../../repositories/notification.repository').PrismaNotificationTemplateRepository)(prisma).create(validatedData as any)
      return reply.send(successResponse(template, 'Template criado com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      if (error instanceof z.ZodError) {
        return reply.code(400).send(errorResponse('Dados inválidos', error.errors[0]?.message))
      }
      return reply.code(500).send(errorResponse('Erro ao criar template'))
    }
  })

  // PUT /api/notifications/templates/:id
  fastify.put('/templates/:id', {
    schema: {
      description: 'Atualizar template de notificação',
      tags: ['notifications'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const validatedData = updateTemplateSchema.parse(request.body)
      const template = await new (require('../../repositories/notification.repository').PrismaNotificationTemplateRepository)(prisma).update(id, validatedData as any)
      return reply.send(successResponse(template, 'Template atualizado com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      if (error instanceof z.ZodError) {
        return reply.code(400).send(errorResponse('Dados inválidos', error.errors[0]?.message))
      }
      return reply.code(500).send(errorResponse('Erro ao atualizar template'))
    }
  })

  // DELETE /api/notifications/templates/:id
  fastify.delete('/templates/:id', {
    schema: {
      description: 'Excluir template de notificação',
      tags: ['notifications'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      await new (require('../../repositories/notification.repository').PrismaNotificationTemplateRepository)(prisma).delete(id)
      return reply.send(successResponse(null, 'Template excluído com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse('Erro ao excluir template'))
    }
  })

  // 📤 ENVIO IMEDIATO

  // POST /api/notifications/send
  fastify.post('/send', {
    schema: {
      description: 'Enviar notificação imediata',
      tags: ['notifications'],
      body: {
        type: 'object',
        properties: {
          appointmentId: { type: 'string' },
          type: { type: 'string', enum: ['FIRST_REMINDER', 'SECOND_REMINDER', 'THIRD_REMINDER', 'IMMEDIATE'] },
          customMessage: { type: 'string' },
          channels: { type: 'array', items: { type: 'string', enum: ['WHATSAPP', 'SMS', 'EMAIL'] } }
        },
        required: ['appointmentId']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedData = sendImmediateNotificationSchema.parse(request.body)
      
      // Buscar agendamento
      const appointment = await new (require('../../repositories/appointment.repository').PrismaAppointmentRepository)(prisma).findById(validatedData.appointmentId)
      
      if (!appointment) {
        return reply.code(404).send(errorResponse('Agendamento não encontrado'))
      }

      await notificationService.sendImmediateNotification(
        appointment as any,
        validatedData.type as NotificationReminderType,
        validatedData.customMessage,
        validatedData.channels as NotificationChannel[]
      )

      return reply.send(successResponse(null, 'Notificação enviada com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      if (error instanceof z.ZodError) {
        return reply.code(400).send(errorResponse('Dados inválidos', error.errors[0]?.message))
      }
      return reply.code(500).send(errorResponse('Erro ao enviar notificação'))
    }
  })

  // 📋 LOGS E HISTÓRICO

  // GET /api/notifications/logs
  fastify.get('/logs', {
    schema: {
      description: 'Obter logs de notificações',
      tags: ['notifications'],
      querystring: {
        type: 'object',
        properties: {
          appointmentId: { type: 'string' },
          channel: { type: 'string', enum: ['WHATSAPP', 'SMS', 'EMAIL'] },
          status: { type: 'string', enum: ['PENDING', 'SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED'] },
          dateFrom: { type: 'string' },
          dateTo: { type: 'string' },
          page: { type: 'string' },
          limit: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const validatedQuery = getLogsQuerySchema.parse(request.query)
      
      const filters: any = {}
      if (validatedQuery.appointmentId) filters.appointmentId = validatedQuery.appointmentId
      if (validatedQuery.channel) filters.channel = validatedQuery.channel as NotificationChannel
      if (validatedQuery.status) filters.status = validatedQuery.status as NotificationStatus
      if (validatedQuery.dateFrom) filters.dateFrom = new Date(validatedQuery.dateFrom)
      if (validatedQuery.dateTo) filters.dateTo = new Date(validatedQuery.dateTo)
      if (validatedQuery.page) filters.page = parseInt(validatedQuery.page)
      if (validatedQuery.limit) filters.limit = parseInt(validatedQuery.limit)

      const result = await new (require('../../repositories/notification.repository').PrismaNotificationLogRepository)(prisma).findAll(filters)
      return reply.send(successResponse(result, 'Logs obtidos com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse('Erro ao obter logs'))
    }
  })

  // 📊 ESTATÍSTICAS

  // GET /api/notifications/stats
  fastify.get('/stats', {
    schema: {
      description: 'Obter estatísticas de notificações',
      tags: ['notifications'],
      querystring: {
        type: 'object',
        properties: {
          appointmentId: { type: 'string' },
          dateFrom: { type: 'string' },
          dateTo: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const { appointmentId, dateFrom, dateTo } = request.query
      
      const stats = await notificationService.getNotificationStats(
        appointmentId,
        dateFrom ? new Date(dateFrom) : undefined,
        dateTo ? new Date(dateTo) : undefined
      )

      return reply.send(successResponse(stats, 'Estatísticas obtidas com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse('Erro ao obter estatísticas'))
    }
  })

  // 🔧 UTILITÁRIOS

  // GET /api/notifications/providers
  fastify.get('/providers', {
    schema: {
      description: 'Obter status dos provedores',
      tags: ['notifications']
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const configuredProviders = NotificationProviderFactory.getConfiguredProviders()
      
      const providersStatus = {
        configured: configuredProviders,
        available: Object.values(NotificationChannel),
        whatsapp: configuredProviders.includes(NotificationChannel.WHATSAPP),
        sms: configuredProviders.includes(NotificationChannel.SMS),
        email: configuredProviders.includes(NotificationChannel.EMAIL)
      }

      return reply.send(successResponse(providersStatus, 'Status dos provedores obtido com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse('Erro ao obter status dos provedores'))
    }
  })

  // GET /api/notifications/scheduler/status
  fastify.get('/scheduler/status', {
    schema: {
      description: 'Obter status do agendador',
      tags: ['notifications']
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const scheduler = NotificationSchedulerSingleton.getInstance(prisma)
      const status = scheduler.getStatus()
      return reply.send(successResponse(status, 'Status do agendador obtido com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse('Erro ao obter status do agendador'))
    }
  })

  // POST /api/notifications/scheduler/process
  fastify.post('/scheduler/process', {
    schema: {
      description: 'Processar notificações manualmente',
      tags: ['notifications']
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await NotificationSchedulerSingleton.processNow(prisma)
      return reply.send(successResponse(null, 'Processamento manual concluído'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse('Erro no processamento manual'))
    }
  })
}
