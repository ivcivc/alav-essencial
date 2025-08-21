import { FastifyInstance } from 'fastify'
import { 
  PrismaPartnerRepository,
  PrismaAppointmentRepository,
  PrismaFinancialEntryRepository, 
  PrismaBankAccountRepository 
} from '../../repositories'
import { PartnerSettlementService } from '../../services'
import { successResponse, sendErrorResponse } from '../../utils/response'
import { ZodError } from 'zod'

export default async function partnerSettlementRoutes(fastify: FastifyInstance) {
  // Inicializar repositórios e serviços
  const partnerRepository = new PrismaPartnerRepository(fastify.prisma)
  const appointmentRepository = new PrismaAppointmentRepository(fastify.prisma)
  const financialEntryRepository = new PrismaFinancialEntryRepository(fastify.prisma)
  const bankAccountRepository = new PrismaBankAccountRepository(fastify.prisma)
  const settlementService = new PartnerSettlementService(
    partnerRepository,
    appointmentRepository,
    financialEntryRepository,
    bankAccountRepository
  )

  // 🧮 CÁLCULO DE ACERTOS

  // POST /api/partner-settlement/calculate/:partnerId - Calcular acerto de um parceiro
  fastify.post('/calculate/:partnerId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          partnerId: { type: 'string' }
        },
        required: ['partnerId']
      },
      body: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          description: { type: 'string' }
        },
        required: ['startDate', 'endDate']
      }
    }
  }, async (request, reply) => {
    try {
      const { partnerId } = request.params as { partnerId: string }
      const { startDate, endDate, description } = request.body as {
        startDate: string
        endDate: string
        description?: string
      }

      const period = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description
      }

      // Buscar parceiro para determinar tipo de parceria
      const partner = await partnerRepository.findById(partnerId)
      if (!partner) {
        return sendErrorResponse(reply, 'Parceiro não encontrado', 404)
      }

      let settlement
      switch (partner.partnershipType) {
        case 'PERCENTAGE':
          settlement = await settlementService.calculatePercentageSettlement(partnerId, period)
          break
        case 'SUBLEASE':
          settlement = await settlementService.calculateSubleaseSettlement(partnerId, period)
          break
        case 'PERCENTAGE_WITH_PRODUCTS':
          settlement = await settlementService.calculatePercentageWithProductsSettlement(partnerId, period)
          break
        default:
          return sendErrorResponse(reply, 'Tipo de parceria não suportado', 400)
      }

      return reply.code(200).send(successResponse(settlement, 'Acerto calculado com sucesso'))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // POST /api/partner-settlement/generate/:partnerId - Gerar lançamentos financeiros do acerto
  fastify.post('/generate/:partnerId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          partnerId: { type: 'string' }
        },
        required: ['partnerId']
      },
      body: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          bankAccountId: { type: 'string' },
          generatePayment: { type: 'boolean' },
          description: { type: 'string' }
        },
        required: ['startDate', 'endDate', 'bankAccountId']
      }
    }
  }, async (request, reply) => {
    try {
      const { partnerId } = request.params as { partnerId: string }
      const { 
        startDate, 
        endDate, 
        bankAccountId, 
        generatePayment = true,
        description 
      } = request.body as {
        startDate: string
        endDate: string
        bankAccountId: string
        generatePayment?: boolean
        description?: string
      }

      const period = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description
      }

      // Buscar parceiro
      const partner = await partnerRepository.findById(partnerId)
      if (!partner) {
        return sendErrorResponse(reply, 'Parceiro não encontrado', 404)
      }

      // Calcular acerto primeiro
      let settlement
      switch (partner.partnershipType) {
        case 'PERCENTAGE':
          settlement = await settlementService.calculatePercentageSettlement(partnerId, period)
          break
        case 'SUBLEASE':
          settlement = await settlementService.calculateSubleaseSettlement(partnerId, period)
          break
        case 'PERCENTAGE_WITH_PRODUCTS':
          settlement = await settlementService.calculatePercentageWithProductsSettlement(partnerId, period)
          break
        default:
          return sendErrorResponse(reply, 'Tipo de parceria não suportado', 400)
      }

      // Gerar lançamentos financeiros
      const entries = await settlementService.generateSettlementEntries(
        settlement,
        bankAccountId,
        generatePayment
      )

      return reply.code(201).send(successResponse({
        settlement,
        entries,
        entriesCount: entries.length
      }, `Acerto gerado com ${entries.length} lançamentos financeiros`))

    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // 📊 RELATÓRIOS

  // GET /api/partner-settlement/report - Relatório geral de acertos
  fastify.get('/report', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          partnerIds: { type: 'string' }, // IDs separados por vírgula
          description: { type: 'string' }
        },
        required: ['startDate', 'endDate']
      }
    }
  }, async (request, reply) => {
    try {
      const { 
        startDate, 
        endDate, 
        partnerIds, 
        description 
      } = request.query as {
        startDate: string
        endDate: string
        partnerIds?: string
        description?: string
      }

      const period = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description
      }

      const partnerIdsList = partnerIds ? partnerIds.split(',') : undefined

      const report = await settlementService.generateSettlementReport(period, partnerIdsList)

      return reply.code(200).send(successResponse(report))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // GET /api/partner-settlement/partner/:partnerId/balance - Saldo do parceiro
  fastify.get('/partner/:partnerId/balance', {
    schema: {
      params: {
        type: 'object',
        properties: {
          partnerId: { type: 'string' }
        },
        required: ['partnerId']
      }
    }
  }, async (request, reply) => {
    try {
      const { partnerId } = request.params as { partnerId: string }

      const balance = await settlementService.getPartnerBalance(partnerId)

      return reply.code(200).send(successResponse(balance))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // 🏢 SUBLOCAÇÃO

  // POST /api/partner-settlement/sublease/monthly - Gerar sublocações mensais
  fastify.post('/sublease/monthly', {
    schema: {
      body: {
        type: 'object',
        properties: {
          month: { type: 'number', minimum: 1, maximum: 12 },
          year: { type: 'number', minimum: 2020 },
          bankAccountId: { type: 'string' }
        },
        required: ['month', 'year', 'bankAccountId']
      }
    }
  }, async (request, reply) => {
    try {
      const { month, year, bankAccountId } = request.body as {
        month: number
        year: number
        bankAccountId: string
      }

      const monthlyEntries = await settlementService.generateMonthlySubleases(
        month,
        year,
        bankAccountId
      )

      return reply.code(201).send(successResponse(monthlyEntries, 
        `${monthlyEntries.length} sublocações criadas para ${month}/${year}`
      ))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 400)
    }
  })

  // GET /api/partner-settlement/sublease/upcoming - Próximas sublocações
  fastify.get('/sublease/upcoming', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          months: { type: 'number', minimum: 1, maximum: 12 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { months = 3 } = request.query as { months?: number }

      const now = new Date()
      const endDate = new Date(now.getFullYear(), now.getMonth() + months, 0)

      // Buscar parceiros de sublocação
      const subleasePartners = await partnerRepository.findAll({
        partnershipType: 'SUBLEASE',
        active: true
      })

      const upcomingSubleases = subleasePartners.map(partner => {
        const subleaseAmount = Number(partner.subleaseAmount || 0)
        const paymentDay = partner.subleasePaymentDay || 5
        
        const nextDueDate = new Date(now.getFullYear(), now.getMonth(), paymentDay)
        if (nextDueDate < now) {
          nextDueDate.setMonth(nextDueDate.getMonth() + 1)
        }

        return {
          partnerId: partner.id,
          partnerName: partner.fullName,
          subleaseAmount,
          nextDueDate,
          paymentDay,
          status: 'UPCOMING'
        }
      })

      return reply.code(200).send(successResponse(upcomingSubleases))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // 📈 ESTATÍSTICAS

  // GET /api/partner-settlement/stats/partner/:partnerId - Estatísticas do parceiro
  fastify.get('/stats/partner/:partnerId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          partnerId: { type: 'string' }
        },
        required: ['partnerId']
      },
      querystring: {
        type: 'object',
        properties: {
          months: { type: 'number', minimum: 1, maximum: 24 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { partnerId } = request.params as { partnerId: string }
      const { months = 6 } = request.query as { months?: number }

      const endDate = new Date()
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - months, 1)

      // Buscar dados do período
      const revenue = await appointmentRepository.getPartnerRevenue(partnerId, startDate, endDate)
      const balance = await settlementService.getPartnerBalance(partnerId)

      const stats = {
        period: {
          startDate,
          endDate,
          months
        },
        revenue,
        balance,
        averageMonthlyRevenue: revenue.totalRevenue / months,
        efficiency: revenue.totalAppointments > 0 ? revenue.totalRevenue / revenue.totalAppointments : 0
      }

      return reply.code(200).send(successResponse(stats))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })

  // GET /api/partner-settlement/stats/overview - Visão geral das parcerias
  fastify.get('/stats/overview', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { startDate, endDate } = request.query as {
        startDate?: string
        endDate?: string
      }

      const defaultEndDate = new Date()
      const defaultStartDate = new Date(defaultEndDate.getFullYear(), defaultEndDate.getMonth() - 1, 1)

      const period = {
        startDate: startDate ? new Date(startDate) : defaultStartDate,
        endDate: endDate ? new Date(endDate) : defaultEndDate
      }

      // Buscar todos os parceiros ativos
      const allPartners = await partnerRepository.findAll({ active: true })

      // Estatísticas por tipo de parceria
      const statsByType = {
        PERCENTAGE: { count: 0, totalRevenue: 0, totalPartnerShare: 0 },
        SUBLEASE: { count: 0, totalRevenue: 0, totalPartnerShare: 0 },
        FIXED_PARTNERSHIP: { count: 0, totalRevenue: 0, totalPartnerShare: 0 }
      }

      for (const partner of allPartners) {
        if (!partner.partnershipType) continue

        const revenue = await appointmentRepository.getPartnerRevenue(
          partner.id,
          period.startDate,
          period.endDate
        )

        if (statsByType[partner.partnershipType as keyof typeof statsByType]) {
          statsByType[partner.partnershipType as keyof typeof statsByType].count++
          statsByType[partner.partnershipType as keyof typeof statsByType].totalRevenue += revenue.totalRevenue
          
          // Calcular repasse estimado
          let partnerShare = 0
          if (partner.partnershipType === 'PERCENTAGE') {
            partnerShare = (revenue.totalRevenue * (Number(partner.percentageRate) || 0)) / 100
          } else if (partner.partnershipType === 'SUBLEASE') {
            partnerShare = revenue.totalRevenue - (Number(partner.subleaseAmount) || 0)
          }
          
          statsByType[partner.partnershipType as keyof typeof statsByType].totalPartnerShare += partnerShare
        }
      }

      const overview = {
        period,
        totalPartners: allPartners.length,
        statsByType,
        totalRevenue: Object.values(statsByType).reduce((sum, type) => sum + type.totalRevenue, 0),
        totalPartnerShare: Object.values(statsByType).reduce((sum, type) => sum + type.totalPartnerShare, 0)
      }

      return reply.code(200).send(successResponse(overview))
    } catch (error: any) {
      return sendErrorResponse(reply, error.message, 500)
    }
  })
}
