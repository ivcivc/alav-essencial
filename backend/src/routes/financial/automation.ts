import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { financialAutomationService } from '../../services/financial-automation.service'
import { successResponse, errorResponse } from '../../utils/response'

export default async function financialAutomationRoutes(fastify: FastifyInstance) {
  
  // POST /api/financial/automation/recalculate-balances - Recalcular saldos de contas
  fastify.post('/recalculate-balances', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const results = await financialAutomationService.recalculateAllAccountBalances()
      return reply.send(successResponse(results, 'Saldos recalculados com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse(error instanceof Error ? error.message : 'Erro ao recalcular saldos'))
    }
  })

  // POST /api/financial/automation/recalculate-account/:accountId - Recalcular saldo de conta específica
  fastify.post('/recalculate-account/:accountId', {
    schema: {
      params: {
        type: 'object',
        required: ['accountId'],
        properties: {
          accountId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { accountId: string }
  }>, reply: FastifyReply) => {
    try {
      const result = await financialAutomationService.recalculateAccountBalance(request.params.accountId)
      return reply.send(successResponse(result, 'Saldo da conta recalculado com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(400).send(errorResponse(error instanceof Error ? error.message : 'Erro ao recalcular saldo da conta'))
    }
  })

  // POST /api/financial/automation/process-overdue - Processar lançamentos vencidos
  fastify.post('/process-overdue', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await financialAutomationService.processOverdueEntries()
      return reply.send(successResponse(result, 'Lançamentos vencidos processados com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse(error instanceof Error ? error.message : 'Erro ao processar lançamentos vencidos'))
    }
  })

  // POST /api/financial/automation/run-all - Executar todas as automações
  fastify.post('/run-all', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await financialAutomationService.runAllAutomations()
      return reply.send(successResponse(result, 'Todas as automações executadas com sucesso'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse(error instanceof Error ? error.message : 'Erro nas automações financeiras'))
    }
  })

  // GET /api/financial/automation/inconsistencies - Verificar inconsistências financeiras
  fastify.get('/inconsistencies', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await financialAutomationService.getFinancialInconsistencies()
      return reply.send(successResponse(result, 'Verificação de inconsistências concluída'))
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send(errorResponse(error instanceof Error ? error.message : 'Erro ao verificar inconsistências'))
    }
  })
}
