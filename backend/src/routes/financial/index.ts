import { FastifyInstance } from 'fastify'
import { 
  PrismaBankAccountRepository, 
  PrismaFinancialEntryRepository,
  PrismaAppointmentRepository
} from '../../repositories'
import { 
  BankAccountService, 
  FinancialEntryService,
  FinancialCategoryService,
  FinancialRecurringService,
  AccountsPayableReceivableService
} from '../../services'
import {
  createBankAccountSchema,
  updateBankAccountSchema,
  getBankAccountsQuerySchema,
  createFinancialEntrySchema,
  updateFinancialEntrySchema,
  getFinancialEntriesQuerySchema,
  markAsPaidSchema,
  createRecurringEntriesSchema,
  getCashFlowQuerySchema
} from '../../schemas/financial'
import { successResponse, sendErrorResponse } from '../../utils/response'
import { ZodError } from 'zod'

export default async function financialRoutes(fastify: FastifyInstance) {
  // Inicializar repositórios e serviços
  const bankAccountRepository = new PrismaBankAccountRepository(fastify.prisma)
  const financialEntryRepository = new PrismaFinancialEntryRepository(fastify.prisma)
  const appointmentRepository = new PrismaAppointmentRepository(fastify.prisma)
  const bankAccountService = new BankAccountService(bankAccountRepository, financialEntryRepository)
  const financialEntryService = new FinancialEntryService(financialEntryRepository, bankAccountRepository, appointmentRepository)
  const categoryService = new FinancialCategoryService(financialEntryRepository)
  const recurringService = new FinancialRecurringService(financialEntryRepository, bankAccountRepository)
  const accountsService = new AccountsPayableReceivableService(financialEntryRepository, bankAccountRepository)

  // 🏦 ROTAS PARA CONTAS BANCÁRIAS

  // GET /api/financial/bank-accounts - Listar contas bancárias
  fastify.get('/bank-accounts', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          active: { type: 'string' },
          accountType: { type: 'string' },
          page: { type: 'string' },
          limit: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = getBankAccountsQuerySchema.parse(request.query)
      
      const accounts = await bankAccountService.getAllBankAccounts(query)
      const total = await bankAccountRepository.count({
        active: query.active,
        accountType: query.accountType
      })

      return reply.code(200).send(successResponse(accounts, {
        total,
        page: query.page,
        limit: query.limit
      }))
    } catch (error: any) {
      if (error instanceof ZodError) {
        return sendErrorResponse(reply, 'Parâmetros de consulta inválidos', 400, error.errors)
      }
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // GET /api/financial/bank-accounts/:id - Obter conta bancária por ID
  fastify.get('/bank-accounts/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const account = await bankAccountService.getBankAccountById(id)
      if (!account) {
        return sendErrorResponse(reply, 'Conta bancária não encontrada', 404)
      }

      return reply.code(200).send(successResponse(account))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // POST /api/financial/bank-accounts - Criar nova conta bancária
  fastify.post('/bank-accounts', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          bank: { type: 'string' },
          accountType: { type: 'string' },
          agency: { type: 'string' },
          accountNumber: { type: 'string' },
          pixKey: { type: 'string' },
          initialBalance: { type: 'number' },
          active: { type: 'boolean' },
          color: { type: 'string' },
          description: { type: 'string' }
        },
        required: ['name', 'bank', 'accountType']
      }
    }
  }, async (request, reply) => {
    try {
      const data = createBankAccountSchema.parse(request.body)
      
      const account = await bankAccountService.createBankAccount(data)

      return reply.code(201).send(successResponse(account))
    } catch (error: any) {
      if (error instanceof ZodError) {
        return sendErrorResponse(reply, 'Dados inválidos', 400, error.errors)
      }
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // PUT /api/financial/bank-accounts/:id - Atualizar conta bancária
  fastify.put('/bank-accounts/:id', {
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
          bank: { type: 'string' },
          accountType: { type: 'string' },
          agency: { type: 'string' },
          accountNumber: { type: 'string' },
          pixKey: { type: 'string' },
          initialBalance: { type: 'number' },
          active: { type: 'boolean' },
          color: { type: 'string' },
          description: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const data = updateBankAccountSchema.parse(request.body)
      
      const account = await bankAccountService.updateBankAccount(id, data)

      return reply.code(200).send(successResponse(account))
    } catch (error: any) {
      if (error instanceof ZodError) {
        return sendErrorResponse(reply, 'Dados inválidos', 400, error.errors)
      }
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // DELETE /api/financial/bank-accounts/:id - Excluir conta bancária
  fastify.delete('/bank-accounts/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      await bankAccountService.deleteBankAccount(id)

      return reply.code(200).send(successResponse(null, 'Conta bancária excluída com sucesso'))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // POST /api/financial/bank-accounts/:id/recalculate-balance - Recalcular saldo da conta
  fastify.post('/bank-accounts/:id/recalculate-balance', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const account = await bankAccountService.recalculateAccountBalance(id)

      return reply.code(200).send(successResponse(account, 'Saldo recalculado com sucesso'))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // GET /api/financial/bank-accounts/:id/summary - Obter resumo da conta bancária
  fastify.get('/bank-accounts/:id/summary', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const summary = await bankAccountService.getAccountSummary(id)

      return reply.code(200).send(successResponse(summary))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // 💳 ROTAS PARA LANÇAMENTOS FINANCEIROS

  // GET /api/financial/entries - Listar lançamentos financeiros
  fastify.get('/entries', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          bankAccountId: { type: 'string' },
          type: { type: 'string' },
          status: { type: 'string' },
          category: { type: 'string' },
          partnerId: { type: 'string' },
          patientId: { type: 'string' },
          appointmentId: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          page: { type: 'string' },
          limit: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const filters = getFinancialEntriesQuerySchema.parse(request.query)
      
      const entries = await financialEntryService.getAllFinancialEntries(filters)
      const total = await financialEntryRepository.count(filters)

      return reply.code(200).send(successResponse(entries, {
        total,
        page: filters.page,
        limit: filters.limit
      }))
    } catch (error: any) {
      if (error instanceof ZodError) {
        return sendErrorResponse(reply, 'Parâmetros de consulta inválidos', 400, error.errors)
      }
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // GET /api/financial/entries/:id - Obter lançamento financeiro por ID
  fastify.get('/entries/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const entry = await financialEntryService.getFinancialEntryById(id)
      if (!entry) {
        return sendErrorResponse(reply, 'Lançamento financeiro não encontrado', 404)
      }

      return reply.code(200).send(successResponse(entry))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // POST /api/financial/entries - Criar novo lançamento financeiro
  fastify.post('/entries', {
    schema: {
      body: {
        type: 'object',
        properties: {
          bankAccountId: { type: 'string' },
          type: { type: 'string' },
          category: { type: 'string' },
          subcategory: { type: 'string' },
          description: { type: 'string' },
          amount: { type: 'number' },
          dueDate: { type: 'string' },
          paidDate: { type: 'string' },
          status: { type: 'string' },
          paymentMethod: { type: 'string' },
          notes: { type: 'string' },
          referenceId: { type: 'string' },
          referenceType: { type: 'string' },
          partnerId: { type: 'string' },
          patientId: { type: 'string' },
          appointmentId: { type: 'string' },
          recurring: { type: 'boolean' },
          parentEntryId: { type: 'string' }
        },
        required: ['bankAccountId', 'type', 'category', 'description', 'amount', 'dueDate']
      }
    }
  }, async (request, reply) => {
    try {
      console.log('📥 Dados recebidos no POST /entries:', JSON.stringify(request.body, null, 2))
      
      const data = createFinancialEntrySchema.parse(request.body)
      console.log('✅ Dados validados com sucesso:', JSON.stringify(data, null, 2))
      
      const entry = await financialEntryService.createFinancialEntry(data)

      return reply.code(201).send(successResponse(entry))
    } catch (error: any) {
      console.error('❌ Erro ao criar lançamento financeiro:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        body: request.body
      })
      
      if (error instanceof ZodError) {
        console.error('❌ Erro de validação Zod:', error.errors)
        return sendErrorResponse(reply, 'Dados inválidos', 400, error.errors)
      }
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // PUT /api/financial/entries/:id - Atualizar lançamento financeiro
  fastify.put('/entries/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const data = updateFinancialEntrySchema.parse(request.body)
      
      const entry = await financialEntryService.updateFinancialEntry(id, data)

      return reply.code(200).send(successResponse(entry))
    } catch (error: any) {
      if (error instanceof ZodError) {
        return sendErrorResponse(reply, 'Dados inválidos', 400, error.errors)
      }
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // DELETE /api/financial/entries/:id - Excluir lançamento financeiro
  fastify.delete('/entries/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      await financialEntryService.deleteFinancialEntry(id)

      return reply.code(200).send(successResponse(null, 'Lançamento financeiro excluído com sucesso'))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // POST /api/financial/entries/:id/mark-as-paid - Marcar lançamento como pago
  fastify.post('/entries/:id/mark-as-paid', {
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
          paidDate: { type: 'string' },
          paymentMethod: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const data = markAsPaidSchema.parse(request.body)
      
      const entry = await financialEntryService.markAsPaid(id, data.paidDate, data.paymentMethod)

      return reply.code(200).send(successResponse(entry, 'Lançamento marcado como pago'))
    } catch (error: any) {
      if (error instanceof ZodError) {
        return sendErrorResponse(reply, 'Dados inválidos', 400, error.errors)
      }
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // POST /api/financial/entries/:id/mark-as-cancelled - Marcar lançamento como cancelado
  fastify.post('/entries/:id/mark-as-cancelled', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const entry = await financialEntryService.markAsCancelled(id)

      return reply.code(200).send(successResponse(entry, 'Lançamento cancelado'))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // POST /api/financial/entries/:id/create-recurring - Criar lançamentos recorrentes
  fastify.post('/entries/:id/create-recurring', {
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
          occurrences: { type: 'number' },
          frequency: { type: 'string' }
        },
        required: ['occurrences', 'frequency']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const data = createRecurringEntriesSchema.parse(request.body)
      
      const entries = await financialEntryService.createRecurringEntries(id, data.occurrences, data.frequency)

      return reply.code(201).send(successResponse(entries, `${entries.length} lançamentos recorrentes criados`))
    } catch (error: any) {
      if (error instanceof ZodError) {
        return sendErrorResponse(reply, 'Dados inválidos', 400, error.errors)
      }
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // 📊 ROTAS DE RELATÓRIOS E RESUMOS

  // GET /api/financial/overdue - Obter lançamentos vencidos
  fastify.get('/overdue', async (request, reply) => {
    try {
      const entries = await financialEntryService.getOverdueEntries()

      return reply.code(200).send(successResponse(entries))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // GET /api/financial/cash-flow - Obter resumo de fluxo de caixa
  fastify.get('/cash-flow', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          bankAccountId: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const filters = getCashFlowQuerySchema.parse(request.query)
      
      const summary = await financialEntryService.getCashFlowSummary(filters)

      return reply.code(200).send(successResponse(summary))
    } catch (error: any) {
      if (error instanceof ZodError) {
        return sendErrorResponse(reply, 'Parâmetros de consulta inválidos', 400, error.errors)
      }
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // GET /api/financial/total-balance - Obter saldo total de todas as contas
  fastify.get('/total-balance', async (request, reply) => {
    try {
      const totalBalance = await bankAccountService.getTotalBalance(true)

      return reply.code(200).send(successResponse({ totalBalance }))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // 📂 ROTAS DE CATEGORIAS FINANCEIRAS

  // GET /api/financial/categories - Obter todas as categorias
  fastify.get('/categories', async (request, reply) => {
    try {
      const categories = categoryService.getAllCategories()
      return reply.code(200).send(successResponse(categories))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // GET /api/financial/categories/:type - Obter categorias por tipo
  fastify.get('/categories/:type', {
    schema: {
      params: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] }
        },
        required: ['type']
      }
    }
  }, async (request, reply) => {
    try {
      const { type } = request.params as { type: 'INCOME' | 'EXPENSE' }
      const categories = categoryService.getCategoriesByType(type)
      return reply.code(200).send(successResponse(categories))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // GET /api/financial/categories/usage - Obter categorias com estatísticas de uso
  fastify.get('/categories/usage', async (request, reply) => {
    try {
      const categoriesWithUsage = await categoryService.getCategoriesWithUsage()
      return reply.code(200).send(successResponse(categoriesWithUsage))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // POST /api/financial/categories/suggest - Sugerir categoria baseada na descrição
  fastify.post('/categories/suggest', {
    schema: {
      body: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] }
        },
        required: ['description', 'type']
      }
    }
  }, async (request, reply) => {
    try {
      const { description, type } = request.body as { description: string; type: 'INCOME' | 'EXPENSE' }
      const suggestion = categoryService.suggestCategory(description, type)
      return reply.code(200).send(successResponse(suggestion))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // 🔄 ROTAS DE LANÇAMENTOS RECORRENTES

  // POST /api/financial/recurring/create - Criar série de lançamentos recorrentes
  fastify.post('/recurring/create', {
    schema: {
      body: {
        type: 'object',
        properties: {
          baseEntry: { type: 'object' },
          config: { type: 'object' }
        },
        required: ['baseEntry', 'config']
      }
    }
  }, async (request, reply) => {
    try {
      const { baseEntry, config } = request.body as any
      const entries = await recurringService.createRecurringEntry(baseEntry, config)
      return reply.code(201).send(successResponse(entries, `${entries.length} lançamentos recorrentes criados`))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // POST /api/financial/recurring/bulk - Criar lançamentos em lote
  fastify.post('/recurring/bulk', {
    schema: {
      body: {
        type: 'object',
        properties: {
          entries: { type: 'array' },
          options: { type: 'object' }
        },
        required: ['entries', 'options']
      }
    }
  }, async (request, reply) => {
    try {
      const { entries, options } = request.body as any
      const createdEntries = await recurringService.createBulkEntries(entries, options)
      return reply.code(201).send(successResponse(createdEntries, `${createdEntries.length} lançamentos criados em lote`))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // GET /api/financial/recurring/report - Obter relatório de lançamentos recorrentes
  fastify.get('/recurring/report', async (request, reply) => {
    try {
      const report = await recurringService.getRecurringEntriesReport()
      return reply.code(200).send(successResponse(report))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // 📋 ROTAS DE CONTAS A RECEBER

  // GET /api/financial/accounts-receivable - Listar contas a receber
  fastify.get('/accounts-receivable', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          patientId: { type: 'string' },
          category: { type: 'string' },
          page: { type: 'string' },
          limit: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const filters = request.query as any
      if (filters.startDate) filters.startDate = new Date(filters.startDate)
      if (filters.endDate) filters.endDate = new Date(filters.endDate)
      if (filters.page) filters.page = parseInt(filters.page)
      if (filters.limit) filters.limit = parseInt(filters.limit)

      const receivables = await accountsService.getAccountsReceivable(filters)
      return reply.code(200).send(successResponse(receivables))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // POST /api/financial/accounts-receivable/installments - Criar conta a receber parcelada
  fastify.post('/accounts-receivable/installments', {
    schema: {
      body: {
        type: 'object',
        properties: {
          plan: { type: 'object' },
          bankAccountId: { type: 'string' },
          patientId: { type: 'string' },
          appointmentId: { type: 'string' }
        },
        required: ['plan', 'bankAccountId']
      }
    }
  }, async (request, reply) => {
    try {
      const { plan, bankAccountId, patientId, appointmentId } = request.body as any
      const installments = await accountsService.createInstallmentReceivable(plan, bankAccountId, patientId, appointmentId)
      return reply.code(201).send(successResponse(installments, `${installments.length} parcelas criadas`))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // POST /api/financial/accounts-receivable/:id/pay - Marcar conta a receber como paga
  fastify.post('/accounts-receivable/:id/pay', {
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
          paidAmount: { type: 'number' },
          paymentMethod: { type: 'string' },
          paidDate: { type: 'string' },
          bankAccountId: { type: 'string' }
        },
        required: ['paidAmount', 'paymentMethod']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { paidAmount, paymentMethod, paidDate, bankAccountId } = request.body as any
      
      const entry = await accountsService.markReceivableAsPaid(
        id,
        paidAmount,
        paymentMethod,
        paidDate ? new Date(paidDate) : undefined,
        bankAccountId
      )
      
      return reply.code(200).send(successResponse(entry, 'Conta a receber marcada como paga'))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // 💳 ROTAS DE CONTAS A PAGAR

  // GET /api/financial/accounts-payable - Listar contas a pagar
  fastify.get('/accounts-payable', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          partnerId: { type: 'string' },
          category: { type: 'string' },
          page: { type: 'string' },
          limit: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const filters = request.query as any
      if (filters.startDate) filters.startDate = new Date(filters.startDate)
      if (filters.endDate) filters.endDate = new Date(filters.endDate)
      if (filters.page) filters.page = parseInt(filters.page)
      if (filters.limit) filters.limit = parseInt(filters.limit)

      const payables = await accountsService.getAccountsPayable(filters)
      return reply.code(200).send(successResponse(payables))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // POST /api/financial/accounts-payable/installments - Criar conta a pagar parcelada
  fastify.post('/accounts-payable/installments', {
    schema: {
      body: {
        type: 'object',
        properties: {
          plan: { type: 'object' },
          bankAccountId: { type: 'string' },
          partnerId: { type: 'string' },
          referenceId: { type: 'string' }
        },
        required: ['plan', 'bankAccountId']
      }
    }
  }, async (request, reply) => {
    try {
      const { plan, bankAccountId, partnerId, referenceId } = request.body as any
      const installments = await accountsService.createInstallmentPayable(plan, bankAccountId, partnerId, referenceId)
      return reply.code(201).send(successResponse(installments, `${installments.length} parcelas criadas`))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // POST /api/financial/accounts-payable/:id/pay - Marcar conta a pagar como paga
  fastify.post('/accounts-payable/:id/pay', {
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
          paidAmount: { type: 'number' },
          paymentMethod: { type: 'string' },
          paidDate: { type: 'string' },
          bankAccountId: { type: 'string' }
        },
        required: ['paidAmount', 'paymentMethod']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { paidAmount, paymentMethod, paidDate, bankAccountId } = request.body as any
      
      const entry = await accountsService.markPayableAsPaid(
        id,
        paidAmount,
        paymentMethod,
        paidDate ? new Date(paidDate) : undefined,
        bankAccountId
      )
      
      return reply.code(200).send(successResponse(entry, 'Conta a pagar marcada como paga'))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // 📊 ROTAS DE RELATÓRIOS AVANÇADOS

  // GET /api/financial/accounts/summary - Resumo de contas a pagar e receber
  fastify.get('/accounts/summary', async (request, reply) => {
    try {
      const summary = await accountsService.getAccountsSummary()
      return reply.code(200).send(successResponse(summary))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // GET /api/financial/aging-report/:type - Relatório de aging (envelhecimento)
  fastify.get('/aging-report/:type', {
    schema: {
      params: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] }
        },
        required: ['type']
      }
    }
  }, async (request, reply) => {
    try {
      const { type } = request.params as { type: 'INCOME' | 'EXPENSE' }
      const report = await accountsService.getAgingReport(type)
      return reply.code(200).send(successResponse(report))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // Registrar rotas de comissões de parceiros
  await fastify.register(async function (fastify) {
    const partnerCommissionsRoutes = await import('./partner-commissions')
    await fastify.register(partnerCommissionsRoutes.default)
  })
}
