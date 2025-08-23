import { FastifyInstance } from 'fastify'
import { ReportsService } from '../../services/reports.service'
import { successResponse, errorResponse } from '../../utils/response'

export default async function reportsRoutes(fastify: FastifyInstance) {
  const reportsService = new ReportsService(fastify.prisma)

  // Relatório de Agendamentos
  fastify.get('/appointments', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          partnerId: { type: 'string' },
          patientId: { type: 'string' },
          roomId: { type: 'string' },
          serviceId: { type: 'string' },
          status: { type: 'string' },
          type: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const filters = request.query as any
      const report = await reportsService.generateAppointmentReport(filters)
      
      return reply.send(successResponse(report, 'Relatório de agendamentos gerado com sucesso'))
    } catch (error) {
      fastify.log.error('Erro ao gerar relatório de agendamentos:', error)
      return reply.status(500).send(errorResponse('Erro interno do servidor'))
    }
  })

  // Relatório Financeiro
  fastify.get('/financial', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          bankAccountId: { type: 'string' },
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'], nullable: true },
          category: { type: 'string', nullable: true },
          partnerId: { type: 'string', nullable: true },
          patientId: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['PENDING', 'PAID', 'OVERDUE'], nullable: true }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const filters = request.query as any
      const report = await reportsService.generateFinancialReport(filters)
      
      return reply.send(successResponse(report, 'Relatório financeiro gerado com sucesso'))
    } catch (error) {
      fastify.log.error('Erro ao gerar relatório financeiro:', error)
      return reply.status(500).send(errorResponse('Erro interno do servidor'))
    }
  })

  // Relatório de Parceiros
  fastify.get('/partners', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          partnerId: { type: 'string' },
          partnershipType: { type: 'string', enum: ['SUBLEASE', 'PERCENTAGE', 'PERCENTAGE_WITH_PRODUCTS'], nullable: true }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const filters = request.query as any
      const report = await reportsService.generatePartnerReport(filters)
      
      return reply.send(successResponse(report, 'Relatório de parceiros gerado com sucesso'))
    } catch (error) {
      fastify.log.error('Erro ao gerar relatório de parceiros:', error)
      return reply.status(500).send(errorResponse('Erro interno do servidor'))
    }
  })

  // Exportação de Relatórios
  fastify.get('/export/:type', {
    schema: {
      params: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['appointments', 'financial', 'partners'] }
        },
        required: ['type']
      },
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['json', 'csv'], default: 'json' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          partnerId: { type: 'string' },
          patientId: { type: 'string' },
          roomId: { type: 'string' },
          serviceId: { type: 'string' },
          bankAccountId: { type: 'string' },
          type_filter: { type: 'string' },
          category: { type: 'string' },
          status: { type: 'string' },
          partnershipType: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { type } = request.params as { type: string }
      const { format = 'json', ...filters } = request.query as any
      
      const reportData = await reportsService.exportReport(type, filters, format)
      
      if (format === 'csv') {
        reply.header('Content-Type', 'text/csv')
        reply.header('Content-Disposition', `attachment; filename="${type}-report-${new Date().toISOString().split('T')[0]}.csv"`)
        return reply.send(reportData)
      }
      
      return reply.send(successResponse(reportData, 'Relatório exportado com sucesso'))
    } catch (error) {
      fastify.log.error('Erro ao exportar relatório:', error)
      return reply.status(500).send(errorResponse('Erro interno do servidor'))
    }
  })

  // Relatório de Resumo Geral (Dashboard de Relatórios)
  fastify.get('/summary', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const filters = request.query as any
      
      // Gerar todos os relatórios em paralelo
      const [appointmentReport, financialReport, partnerReport] = await Promise.all([
        reportsService.generateAppointmentReport(filters),
        reportsService.generateFinancialReport(filters),
        reportsService.generatePartnerReport(filters)
      ])

      const summary = {
        period: {
          startDate: filters.startDate,
          endDate: filters.endDate
        },
        appointments: {
          total: appointmentReport.totalAppointments,
          completed: appointmentReport.completedAppointments,
          cancelled: appointmentReport.cancelledAppointments,
          revenue: appointmentReport.totalRevenue,
          averageServiceTime: appointmentReport.averageServiceTime
        },
        financial: {
          totalIncome: financialReport.totalIncome,
          totalExpenses: financialReport.totalExpenses,
          netProfit: financialReport.netProfit,
          pendingAmount: financialReport.totalPending
        },
        partners: {
          total: partnerReport.totalPartners,
          active: partnerReport.activePartners,
          totalRevenue: partnerReport.totalRevenue,
          averageCompletionRate: partnerReport.performanceMetrics.averageCompletionRate
        },
        trends: {
          appointmentsByDate: appointmentReport.groupedByDate,
          revenueByDate: financialReport.groupedByDate,
          topServices: appointmentReport.groupedByService,
          topPartners: appointmentReport.groupedByPartner
        }
      }
      
      return reply.send(successResponse(summary, 'Resumo de relatórios gerado com sucesso'))
    } catch (error) {
      fastify.log.error('Erro ao gerar resumo de relatórios:', error)
      return reply.status(500).send(errorResponse('Erro interno do servidor'))
    }
  })

  // Relatório de Performance por Período
  fastify.get('/performance', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          groupBy: { type: 'string', enum: ['day', 'week', 'month'], default: 'day' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { startDate, endDate, groupBy = 'day' } = request.query as any
      
      // Buscar dados de performance agrupados por período
      const appointments = await fastify.prisma.appointment.findMany({
        where: {
          date: {
            gte: startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lte: endDate ? new Date(endDate) : new Date()
          }
        },
        include: {
          productService: {
            select: { salePrice: true }
          }
        }
      })

      // Agrupar dados por período
      const groupedData = new Map()
      
      appointments.forEach(appointment => {
        let periodKey: string
        const date = new Date(appointment.date)
        
        switch (groupBy) {
          case 'week':
            const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
            periodKey = weekStart.toISOString().split('T')[0]
            break
          case 'month':
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            break
          default: // day
            periodKey = appointment.date.toISOString().split('T')[0]
        }
        
        if (!groupedData.has(periodKey)) {
          groupedData.set(periodKey, {
            period: periodKey,
            totalAppointments: 0,
            completedAppointments: 0,
            cancelledAppointments: 0,
            revenue: 0
          })
        }
        
        const periodData = groupedData.get(periodKey)
        periodData.totalAppointments++
        
        if (appointment.status === 'COMPLETED') {
          periodData.completedAppointments++
          periodData.revenue += appointment.productService?.salePrice || 0
        } else if (appointment.status === 'CANCELLED') {
          periodData.cancelledAppointments++
        }
      })

      const performanceData = Array.from(groupedData.values())
        .sort((a, b) => a.period.localeCompare(b.period))

      return reply.send(successResponse({
        groupBy,
        data: performanceData,
        summary: {
          totalPeriods: performanceData.length,
          averageAppointmentsPerPeriod: performanceData.length > 0 
            ? performanceData.reduce((sum, p) => sum + p.totalAppointments, 0) / performanceData.length 
            : 0,
          averageRevenuePerPeriod: performanceData.length > 0 
            ? performanceData.reduce((sum, p) => sum + p.revenue, 0) / performanceData.length 
            : 0
        }
      }, 'Relatório de performance gerado com sucesso'))
    } catch (error) {
      fastify.log.error('Erro ao gerar relatório de performance:', error)
      return reply.status(500).send(errorResponse('Erro interno do servidor'))
    }
  })
}
