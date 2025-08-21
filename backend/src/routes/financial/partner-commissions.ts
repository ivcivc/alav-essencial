import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { successResponse, errorResponse } from '../../utils/response'

export default async function partnerCommissionsRoutes(fastify: FastifyInstance) {
  
  // GET /api/financial/partner-commissions - Get partner commissions report
  fastify.get('/partner-commissions', {
    schema: {
      querystring: {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          partnerId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      startDate: string
      endDate: string
      partnerId?: string
    }
  }>, reply: FastifyReply) => {
    try {
      const { appointmentFinancialService } = await import('../../services/appointment-financial.service')
      
      const startDate = new Date(request.query.startDate)
      const endDate = new Date(request.query.endDate)
      
      const report = await appointmentFinancialService.getPartnerCommissionsReport(
        startDate, 
        endDate, 
        request.query.partnerId
      )
      
      return reply.send(successResponse(report, 'Relatório de comissões obtido com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao gerar relatório de comissões'))
    }
  })

  // POST /api/financial/partner-commissions/calculate - Calculate commissions for a period
  fastify.post('/partner-commissions/calculate', {
    schema: {
      body: {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          partnerId: { type: 'string' },
          processPayments: { type: 'boolean', default: false }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Body: {
      startDate: string
      endDate: string
      partnerId?: string
      processPayments?: boolean
    }
  }>, reply: FastifyReply) => {
    try {
      const { appointmentFinancialService } = await import('../../services/appointment-financial.service')
      
      const startDate = new Date(request.body.startDate)
      const endDate = new Date(request.body.endDate)
      
      // Buscar agendamentos concluídos no período
      const { appointmentService } = await import('../../services/appointment.service')
      
      const appointments = await appointmentService.getAppointmentsByDateRange(
        startDate, 
        endDate, 
        { 
          status: 'COMPLETED',
          partnerId: request.body.partnerId
        }
      )

      const calculations = []
      
      for (const appointment of appointments) {
        // Verificar se já foi processado financeiramente
        const existingFinancials = await appointmentFinancialService.getAppointmentFinancials(appointment.id)
        
        if (existingFinancials.commissions.length === 0) {
          // Calcular comissão
          const calculation = await appointmentFinancialService.calculatePartnerCommission(
            appointment, 
            Number(appointment.productService.salePrice)
          )
          
          calculations.push({
            appointmentId: appointment.id,
            patientName: appointment.patient.fullName,
            serviceName: appointment.productService.name,
            serviceDate: appointment.date,
            calculation
          })
        }
      }
      
      return reply.send(successResponse(calculations, `${calculations.length} comissões calculadas`))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao calcular comissões'))
    }
  })
}
