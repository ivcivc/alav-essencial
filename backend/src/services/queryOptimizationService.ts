import { PrismaClient } from '@prisma/client'

/**
 * Serviço para otimização de queries do Prisma
 * Inclui query batching, eager loading otimizado e connection pooling
 */
class QueryOptimizationService {
  private batchQueue: Map<string, Array<{
    resolve: (value: any) => void
    reject: (error: any) => void
    args: any
  }>> = new Map()

  private batchTimeout: NodeJS.Timeout | null = null
  private readonly BATCH_DELAY = 10 // ms

  /**
   * Batch queries similares para reduzir round-trips ao banco
   */
  async batchQuery<T>(
    key: string,
    queryFn: (args: any[]) => Promise<T[]>,
    args: any
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batchQueue.has(key)) {
        this.batchQueue.set(key, [])
      }

      this.batchQueue.get(key)!.push({ resolve, reject, args })

      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout)
      }

      this.batchTimeout = setTimeout(async () => {
        const batch = this.batchQueue.get(key)
        if (!batch || batch.length === 0) return

        this.batchQueue.delete(key)

        try {
          const allArgs = batch.map(item => item.args)
          const results = await queryFn(allArgs)

          batch.forEach((item, index) => {
            item.resolve(results[index])
          })
        } catch (error) {
          batch.forEach(item => {
            item.reject(error)
          })
        }
      }, this.BATCH_DELAY)
    })
  }

  /**
   * Otimizações específicas para consultas de pacientes
   */
  getOptimizedPatientIncludes() {
    return {
      // Incluir apenas campos necessários
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        birthDate: true,
        gender: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Relacionamentos otimizados
        appointments: {
          select: {
            id: true,
            date: true,
            time: true,
            status: true,
            professional: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: { date: 'desc' as const },
          take: 5 // Apenas últimos 5 agendamentos
        },
        _count: {
          select: {
            appointments: true
          }
        }
      }
    }
  }

  /**
   * Otimizações para consultas de agendamentos
   */
  getOptimizedAppointmentIncludes() {
    return {
      select: {
        id: true,
        date: true,
        time: true,
        duration: true,
        status: true,
        notes: true,
        checkInTime: true,
        checkOutTime: true,
        createdAt: true,
        updatedAt: true,
        // Relacionamentos otimizados
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            specialization: true,
          }
        },
        room: {
          select: {
            id: true,
            name: true,
            location: true,
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          }
        }
      }
    }
  }

  /**
   * Query otimizada para dashboard com agregações
   */
  async getDashboardStats(prisma: PrismaClient, startDate: Date, endDate: Date) {
    // Usar transação para consistência
    return prisma.$transaction(async (tx) => {
      // Queries paralelas para performance
      const [
        totalPatients,
        todayAppointments,
        monthlyRevenue,
        appointmentsByStatus,
        recentPatients
      ] = await Promise.all([
        // Total de pacientes ativos
        tx.patient.count({
          where: { status: 'ACTIVE' }
        }),

        // Agendamentos de hoje
        tx.appointment.count({
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        }),

        // Receita do período (usando agregação)
        tx.financialTransaction.aggregate({
          where: {
            type: 'INCOME',
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: {
            amount: true
          }
        }),

        // Agendamentos por status (usando groupBy)
        tx.appointment.groupBy({
          by: ['status'],
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          },
          _count: {
            status: true
          }
        }),

        // Pacientes recentes (com limite)
        tx.patient.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        })
      ])

      return {
        totalPatients,
        todayAppointments,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        appointmentsByStatus,
        recentPatients
      }
    })
  }

  /**
   * Query otimizada para agenda com filtros
   */
  async getOptimizedAppointments(
    prisma: PrismaClient,
    {
      startDate,
      endDate,
      professionalId,
      status,
      page = 1,
      limit = 20
    }: {
      startDate?: Date
      endDate?: Date
      professionalId?: string
      status?: string
      page?: number
      limit?: number
    }
  ) {
    const where = {
      ...(startDate && endDate && {
        date: {
          gte: startDate,
          lte: endDate
        }
      }),
      ...(professionalId && { professionalId }),
      ...(status && { status })
    }

    // Queries paralelas para lista + total
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        ...this.getOptimizedAppointmentIncludes(),
        orderBy: [
          { date: 'asc' },
          { time: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.appointment.count({ where })
    ])

    return {
      data: appointments,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Busca otimizada de pacientes com full-text search
   */
  async searchPatientsOptimized(
    prisma: PrismaClient,
    {
      search,
      page = 1,
      limit = 20
    }: {
      search?: string
      page?: number
      limit?: number
    }
  ) {
    let where = {}

    if (search) {
      // Busca otimizada por múltiplos campos
      where = {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive' as const
            }
          },
          {
            email: {
              contains: search,
              mode: 'insensitive' as const
            }
          },
          {
            phone: {
              contains: search.replace(/\D/g, ''), // Remove non-digits
            }
          },
          {
            cpf: {
              contains: search.replace(/\D/g, ''),
            }
          }
        ]
      }
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        ...this.getOptimizedPatientIncludes(),
        orderBy: {
          name: 'asc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.patient.count({ where })
    ])

    return {
      data: patients,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Otimização para relatórios financeiros com agregações complexas
   */
  async getFinancialReportOptimized(
    prisma: PrismaClient,
    {
      startDate,
      endDate,
      groupBy = 'day'
    }: {
      startDate: Date
      endDate: Date
      groupBy?: 'day' | 'week' | 'month'
    }
  ) {
    // Query raw otimizada para relatórios complexos
    const groupByClause = {
      day: `DATE_TRUNC('day', "createdAt")`,
      week: `DATE_TRUNC('week', "createdAt")`,
      month: `DATE_TRUNC('month', "createdAt")`
    }[groupBy]

    const result = await prisma.$queryRaw`
      SELECT 
        ${groupByClause} as period,
        type,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM "FinancialTransaction"
      WHERE "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY ${groupByClause}, type
      ORDER BY period ASC, type
    `

    return result
  }

  /**
   * Cleanup de recursos (conexões, timeouts)
   */
  cleanup() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }
    this.batchQueue.clear()
  }
}

export const queryOptimizationService = new QueryOptimizationService()

// Middleware para logging de queries lentas
export function createSlowQueryLogger(thresholdMs = 1000) {
  return (params: any, next: any) => {
    const start = Date.now()
    
    return next(params).then((result: any) => {
      const duration = Date.now() - start
      
      if (duration > thresholdMs) {
        console.warn(`🐌 Slow query detected (${duration}ms):`, {
          model: params.model,
          action: params.action,
          duration,
          args: params.args
        })
      }
      
      return result
    })
  }
}

export default queryOptimizationService
