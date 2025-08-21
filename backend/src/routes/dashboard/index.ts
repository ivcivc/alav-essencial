import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { 
  PrismaAppointmentRepository,
  PrismaFinancialEntryRepository,
  PrismaPartnerRepository,
  PrismaPatientRepository,
  PrismaBankAccountRepository
} from '../../repositories'
import { DashboardService } from '../../services/dashboard.service'
import { successResponse, sendErrorResponse } from '../../utils/response'

// Schema para validação de datas
const dateRangeSchema = z.object({
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional()
})

const metricsQuerySchema = z.object({
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str))
})

export default async function dashboardRoutes(fastify: FastifyInstance) {
  // Inicializar repositórios e serviços
  const appointmentRepository = new PrismaAppointmentRepository(fastify.prisma)
  const financialEntryRepository = new PrismaFinancialEntryRepository(fastify.prisma)
  const partnerRepository = new PrismaPartnerRepository(fastify.prisma)
  const patientRepository = new PrismaPatientRepository(fastify.prisma)
  const bankAccountRepository = new PrismaBankAccountRepository(fastify.prisma)
  
  const dashboardService = new DashboardService(
    appointmentRepository,
    financialEntryRepository,
    partnerRepository,
    patientRepository,
    bankAccountRepository
  )

  // 📊 GET /api/dashboard/kpis - KPIs principais da clínica
  fastify.get('/kpis', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      },
      tags: ['Dashboard'],
      summary: 'Get clinic KPIs',
      description: 'Get key performance indicators for the clinic including patient count, revenue, appointments, etc.'
    }
  }, async (request, reply) => {
    try {
      const query = dateRangeSchema.parse(request.query)
      
      const dateRange = query.startDate && query.endDate ? {
        startDate: query.startDate,
        endDate: query.endDate
      } : undefined

      const kpis = await dashboardService.getKPIs(dateRange)
      
      return successResponse(kpis, 'KPIs obtidos com sucesso')
    } catch (error) {
      fastify.log.error('Erro ao obter KPIs:', error)
      return sendErrorResponse(reply, 'Erro ao obter KPIs do dashboard', 500)
    }
  })

  // 📅 GET /api/dashboard/appointments - Métricas de agendamentos
  fastify.get('/appointments', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        },
        required: ['startDate', 'endDate']
      },
      tags: ['Dashboard'],
      summary: 'Get appointment metrics',
      description: 'Get detailed metrics about appointments including completion rates, cancellations, and partner performance'
    }
  }, async (request, reply) => {
    try {
      const { startDate, endDate } = metricsQuerySchema.parse(request.query)
      
      const metrics = await dashboardService.getAppointmentMetrics({ startDate, endDate })
      
      return successResponse(metrics, 'Métricas de agendamentos obtidas com sucesso')
    } catch (error) {
      fastify.log.error('Erro ao obter métricas de agendamentos:', error)
      return sendErrorResponse(reply, 'Erro ao obter métricas de agendamentos', 500)
    }
  })

  // 💰 GET /api/dashboard/revenue - Métricas de receita
  fastify.get('/revenue', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        },
        required: ['startDate', 'endDate']
      },
      tags: ['Dashboard'],
      summary: 'Get revenue metrics',
      description: 'Get detailed financial metrics including revenue, expenses, profit margins, and category breakdowns'
    }
  }, async (request, reply) => {
    try {
      const { startDate, endDate } = metricsQuerySchema.parse(request.query)
      
      const metrics = await dashboardService.getRevenueMetrics({ startDate, endDate })
      
      return successResponse(metrics, 'Métricas de receita obtidas com sucesso')
    } catch (error) {
      fastify.log.error('Erro ao obter métricas de receita:', error)
      return sendErrorResponse(reply, 'Erro ao obter métricas de receita', 500)
    }
  })

  // 👥 GET /api/dashboard/partners - Métricas de parceiros
  fastify.get('/partners', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        },
        required: ['startDate', 'endDate']
      },
      tags: ['Dashboard'],
      summary: 'Get partner metrics',
      description: 'Get detailed metrics about partner performance including revenue, completion rates, and rankings'
    }
  }, async (request, reply) => {
    try {
      const { startDate, endDate } = metricsQuerySchema.parse(request.query)
      
      const metrics = await dashboardService.getPartnerMetrics({ startDate, endDate })
      
      return successResponse(metrics, 'Métricas de parceiros obtidas com sucesso')
    } catch (error) {
      fastify.log.error('Erro ao obter métricas de parceiros:', error)
      return sendErrorResponse(reply, 'Erro ao obter métricas de parceiros', 500)
    }
  })

  // 📈 GET /api/dashboard/overview - Visão geral completa
  fastify.get('/overview', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      },
      tags: ['Dashboard'],
      summary: 'Get complete dashboard overview',
      description: 'Get a complete overview including KPIs and basic metrics for quick dashboard loading'
    }
  }, async (request, reply) => {
    try {
      const query = dateRangeSchema.parse(request.query)
      
      // Se não informar datas, usar o mês atual
      const now = new Date()
      const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
      const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      const dateRange = {
        startDate: query.startDate || defaultStartDate,
        endDate: query.endDate || defaultEndDate
      }

      // Buscar dados em paralelo
      const [kpis, appointmentMetrics, revenueMetrics] = await Promise.all([
        dashboardService.getKPIs(dateRange),
        dashboardService.getAppointmentMetrics(dateRange),
        dashboardService.getRevenueMetrics(dateRange)
      ])

      const overview = {
        kpis,
        appointments: {
          totalAppointments: appointmentMetrics.totalAppointments,
          completionRate: appointmentMetrics.completionRate,
          cancellationRate: appointmentMetrics.cancellationRate,
          appointmentsByStatus: appointmentMetrics.appointmentsByStatus
        },
        revenue: {
          totalRevenue: revenueMetrics.totalRevenue,
          totalExpenses: revenueMetrics.totalExpenses,
          netProfit: revenueMetrics.netProfit,
          profitMargin: revenueMetrics.profitMargin
        },
        period: {
          startDate: dateRange.startDate.toISOString().split('T')[0],
          endDate: dateRange.endDate.toISOString().split('T')[0]
        }
      }
      
      return successResponse(overview, 'Visão geral do dashboard obtida com sucesso')
    } catch (error) {
      fastify.log.error('Erro ao obter visão geral do dashboard:', error)
      return sendErrorResponse(reply, 'Erro ao obter visão geral do dashboard', 500)
    }
  })

  // 📊 GET /api/dashboard/charts/appointments - Dados para gráficos de agendamentos
  fastify.get('/charts/appointments', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          groupBy: { type: 'string', enum: ['day', 'week', 'month'], default: 'day' }
        },
        required: ['startDate', 'endDate']
      },
      tags: ['Dashboard'],
      summary: 'Get appointment chart data',
      description: 'Get data optimized for appointment charts with different grouping options'
    }
  }, async (request, reply) => {
    try {
      const { startDate, endDate } = metricsQuerySchema.parse(request.query)
      
      const metrics = await dashboardService.getAppointmentMetrics({ startDate, endDate })
      
      const chartData = {
        appointmentsByDay: metrics.appointmentsByDay,
        appointmentsByStatus: metrics.appointmentsByStatus,
        appointmentsByPartner: metrics.appointmentsByPartner.slice(0, 10) // Top 10 parceiros
      }
      
      return successResponse(chartData, 'Dados de gráficos de agendamentos obtidos com sucesso')
    } catch (error) {
      fastify.log.error('Erro ao obter dados de gráficos de agendamentos:', error)
      return sendErrorResponse(reply, 'Erro ao obter dados de gráficos de agendamentos', 500)
    }
  })

  // 💰 GET /api/dashboard/charts/revenue - Dados para gráficos financeiros
  fastify.get('/charts/revenue', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          groupBy: { type: 'string', enum: ['day', 'week', 'month'], default: 'day' }
        },
        required: ['startDate', 'endDate']
      },
      tags: ['Dashboard'],
      summary: 'Get revenue chart data',
      description: 'Get data optimized for financial charts with different grouping options'
    }
  }, async (request, reply) => {
    try {
      const { startDate, endDate } = metricsQuerySchema.parse(request.query)
      
      const metrics = await dashboardService.getRevenueMetrics({ startDate, endDate })
      
      const chartData = {
        dailyRevenue: metrics.dailyRevenue,
        monthlyRevenue: metrics.monthlyRevenue,
        revenueByCategory: metrics.revenueByCategory,
        expensesByCategory: metrics.expensesByCategory
      }
      
      return successResponse(chartData, 'Dados de gráficos financeiros obtidos com sucesso')
    } catch (error) {
      fastify.log.error('Erro ao obter dados de gráficos financeiros:', error)
      return sendErrorResponse(reply, 'Erro ao obter dados de gráficos financeiros', 500)
    }
  })
}
