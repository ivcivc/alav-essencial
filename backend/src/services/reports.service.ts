import { PrismaClient } from '@prisma/client'
import { FastifyInstance } from 'fastify'

export interface AppointmentReportFilters {
  startDate?: string
  endDate?: string
  partnerId?: string
  patientId?: string
  roomId?: string
  serviceId?: string
  status?: string
  type?: string
}

export interface FinancialReportFilters {
  startDate?: string
  endDate?: string
  bankAccountId?: string
  type?: 'INCOME' | 'EXPENSE'
  category?: string
  partnerId?: string
  patientId?: string
  status?: string
}

export interface PartnerReportFilters {
  startDate?: string
  endDate?: string
  partnerId?: string
  partnershipType?: string
}

export interface AppointmentReport {
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  scheduledAppointments: number
  totalRevenue: number
  averageServiceTime: number
  appointments: any[]
  groupedByStatus: Record<string, number>
  groupedByPartner: Record<string, number>
  groupedByService: Record<string, number>
  groupedByDate: Record<string, number>
}

export interface FinancialReport {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  totalPending: number
  totalPaid: number
  entries: any[]
  groupedByCategory: Record<string, number>
  groupedByAccount: Record<string, number>
  groupedByDate: Record<string, number>
  cashFlow: Array<{
    date: string
    income: number
    expenses: number
    balance: number
  }>
}

export interface PartnerReport {
  totalPartners: number
  activePartners: number
  totalAppointments: number
  totalRevenue: number
  partners: Array<{
    id: string
    name: string
    partnershipType: string
    appointmentsCount: number
    revenue: number
    commission: number
    averageServiceTime: number
    completionRate: number
  }>
  groupedByType: Record<string, number>
  performanceMetrics: Record<string, any>
}

export class ReportsService {
  constructor(private prisma: PrismaClient) {}

  async generateAppointmentReport(filters: AppointmentReportFilters): Promise<AppointmentReport> {
    const whereClause: any = {}

    // Aplicar filtros
    if (filters.startDate && filters.endDate) {
      whereClause.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate)
      }
    }
    if (filters.partnerId) whereClause.partnerId = filters.partnerId
    if (filters.patientId) whereClause.patientId = filters.patientId
    if (filters.roomId) whereClause.roomId = filters.roomId
    if (filters.serviceId) whereClause.productServiceId = filters.serviceId
    if (filters.status) whereClause.status = filters.status
    if (filters.type) whereClause.type = filters.type

    // Buscar agendamentos com relacionamentos
    const appointments = await this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: { id: true, fullName: true, cpf: true, phone: true }
        },
        partner: {
          select: { id: true, fullName: true, partnershipType: true }
        },
        productService: {
          select: { id: true, name: true, salePrice: true, durationMinutes: true }
        },
        room: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' }
      ]
    })

    // Calcular métricas
    const totalAppointments = appointments.length
    const completedAppointments = appointments.filter(a => a.status === 'COMPLETED').length
    const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED').length
    const scheduledAppointments = appointments.filter(a => a.status === 'SCHEDULED').length

    // Calcular receita total
    const totalRevenue = appointments
      .filter(a => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + (a.productService?.salePrice || 0), 0)

    // Calcular tempo médio de serviço
    const completedWithDuration = appointments.filter(a => 
      a.status === 'COMPLETED' && a.productService?.durationMinutes
    )
    const averageServiceTime = completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, a) => sum + (a.productService?.durationMinutes || 0), 0) / completedWithDuration.length
      : 0

    // Agrupar por status
    const groupedByStatus = appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Agrupar por parceiro
    const groupedByPartner = appointments.reduce((acc, appointment) => {
      const partnerName = appointment.partner?.fullName || 'Sem parceiro'
      acc[partnerName] = (acc[partnerName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Agrupar por serviço
    const groupedByService = appointments.reduce((acc, appointment) => {
      const serviceName = appointment.productService?.name || 'Sem serviço'
      acc[serviceName] = (acc[serviceName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Agrupar por data
    const groupedByDate = appointments.reduce((acc, appointment) => {
      const dateKey = appointment.date.toISOString().split('T')[0]
      acc[dateKey] = (acc[dateKey] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      scheduledAppointments,
      totalRevenue,
      averageServiceTime,
      appointments,
      groupedByStatus,
      groupedByPartner,
      groupedByService,
      groupedByDate
    }
  }

  async generateFinancialReport(filters: FinancialReportFilters): Promise<FinancialReport> {
    const whereClause: any = {}

    // Aplicar filtros
    if (filters.startDate && filters.endDate) {
      whereClause.OR = [
        {
          dueDate: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate)
          }
        },
        {
          paidDate: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate)
          }
        }
      ]
    }
    if (filters.bankAccountId) whereClause.bankAccountId = filters.bankAccountId
    if (filters.type) whereClause.type = filters.type
    if (filters.category) whereClause.category = filters.category
    if (filters.partnerId) whereClause.partnerId = filters.partnerId
    if (filters.patientId) whereClause.patientId = filters.patientId
    if (filters.status) whereClause.status = filters.status

    // Buscar lançamentos financeiros
    const entries = await this.prisma.financialEntry.findMany({
      where: whereClause,
      include: {
        bankAccount: {
          select: { id: true, name: true }
        },
        partner: {
          select: { id: true, fullName: true }
        },
        patient: {
          select: { id: true, fullName: true }
        },
        appointment: {
          select: { id: true, date: true, startTime: true }
        }
      },
      orderBy: [
        { dueDate: 'desc' }
      ]
    })

    // Calcular métricas financeiras
    const incomeEntries = entries.filter(e => e.type === 'INCOME')
    const expenseEntries = entries.filter(e => e.type === 'EXPENSE')

    const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)
    const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalIncome - totalExpenses

    const totalPending = entries.filter(e => e.status === 'PENDING').reduce((sum, e) => sum + e.amount, 0)
    const totalPaid = entries.filter(e => e.status === 'PAID').reduce((sum, e) => sum + e.amount, 0)

    // Agrupar por categoria
    const groupedByCategory = entries.reduce((acc, entry) => {
      const category = entry.category || 'Sem categoria'
      acc[category] = (acc[category] || 0) + entry.amount
      return acc
    }, {} as Record<string, number>)

    // Agrupar por conta
    const groupedByAccount = entries.reduce((acc, entry) => {
      const accountName = entry.bankAccount?.name || 'Sem conta'
      acc[accountName] = (acc[accountName] || 0) + entry.amount
      return acc
    }, {} as Record<string, number>)

    // Agrupar por data
    const groupedByDate = entries.reduce((acc, entry) => {
      const dateKey = (entry.paidDate || entry.dueDate).toISOString().split('T')[0]
      acc[dateKey] = (acc[dateKey] || 0) + entry.amount
      return acc
    }, {} as Record<string, number>)

    // Calcular fluxo de caixa diário
    const cashFlowMap = new Map<string, { income: number; expenses: number }>()
    
    entries.forEach(entry => {
      const dateKey = (entry.paidDate || entry.dueDate).toISOString().split('T')[0]
      if (!cashFlowMap.has(dateKey)) {
        cashFlowMap.set(dateKey, { income: 0, expenses: 0 })
      }
      const dayData = cashFlowMap.get(dateKey)!
      
      if (entry.type === 'INCOME') {
        dayData.income += entry.amount
      } else {
        dayData.expenses += entry.amount
      }
    })

    const cashFlow = Array.from(cashFlowMap.entries())
      .map(([date, data]) => ({
        date,
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      totalPending,
      totalPaid,
      entries,
      groupedByCategory,
      groupedByAccount,
      groupedByDate,
      cashFlow
    }
  }

  async generatePartnerReport(filters: PartnerReportFilters): Promise<PartnerReport> {
    const whereClause: any = {}
    const appointmentWhereClause: any = {}

    // Aplicar filtros de parceiro
    if (filters.partnerId) whereClause.id = filters.partnerId
    if (filters.partnershipType) whereClause.partnershipType = filters.partnershipType

    // Aplicar filtros de data para agendamentos
    if (filters.startDate && filters.endDate) {
      appointmentWhereClause.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate)
      }
    }

    // Buscar parceiros
    const partners = await this.prisma.partner.findMany({
      where: whereClause,
      include: {
        appointments: {
          where: appointmentWhereClause,
          include: {
            productService: {
              select: { salePrice: true, durationMinutes: true }
            }
          }
        }
      }
    })

    const totalPartners = partners.length
    const activePartners = partners.filter(p => p.active).length

    // Calcular métricas por parceiro
    const partnerMetrics = partners.map(partner => {
      const appointments = partner.appointments
      const completedAppointments = appointments.filter(a => a.status === 'COMPLETED')
      
      const appointmentsCount = appointments.length
      const revenue = completedAppointments.reduce((sum, a) => sum + (a.productService?.salePrice || 0), 0)
      
      // Calcular comissão baseada no tipo de parceria
      let commission = 0
      if (partner.partnershipType === 'PERCENTAGE' && partner.percentageAmount) {
        commission = completedAppointments.length * partner.percentageAmount
      } else if (partner.partnershipType === 'PERCENTAGE_WITH_PRODUCTS' && partner.percentageRate) {
        commission = revenue * (partner.percentageRate / 100)
      }

      // Calcular tempo médio de serviço
      const appointmentsWithDuration = completedAppointments.filter(a => a.productService?.durationMinutes)
      const averageServiceTime = appointmentsWithDuration.length > 0
        ? appointmentsWithDuration.reduce((sum, a) => sum + (a.productService?.durationMinutes || 0), 0) / appointmentsWithDuration.length
        : 0

      // Taxa de conclusão
      const completionRate = appointmentsCount > 0 ? (completedAppointments.length / appointmentsCount) * 100 : 0

      return {
        id: partner.id,
        name: partner.fullName,
        partnershipType: partner.partnershipType,
        appointmentsCount,
        revenue,
        commission,
        averageServiceTime,
        completionRate
      }
    })

    // Métricas totais
    const totalAppointments = partnerMetrics.reduce((sum, p) => sum + p.appointmentsCount, 0)
    const totalRevenue = partnerMetrics.reduce((sum, p) => sum + p.revenue, 0)

    // Agrupar por tipo de parceria
    const groupedByType = partners.reduce((acc, partner) => {
      acc[partner.partnershipType] = (acc[partner.partnershipType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Métricas de performance
    const performanceMetrics = {
      averageAppointmentsPerPartner: totalPartners > 0 ? totalAppointments / totalPartners : 0,
      averageRevenuePerPartner: totalPartners > 0 ? totalRevenue / totalPartners : 0,
      topPerformer: partnerMetrics.length > 0 
        ? partnerMetrics.reduce((top, current) => current.revenue > top.revenue ? current : top)
        : null,
      averageCompletionRate: partnerMetrics.length > 0
        ? partnerMetrics.reduce((sum, p) => sum + p.completionRate, 0) / partnerMetrics.length
        : 0
    }

    return {
      totalPartners,
      activePartners,
      totalAppointments,
      totalRevenue,
      partners: partnerMetrics,
      groupedByType,
      performanceMetrics
    }
  }

  async exportReport(reportType: string, filters: any, format: 'json' | 'csv' = 'json'): Promise<any> {
    let reportData: any

    switch (reportType) {
      case 'appointments':
        reportData = await this.generateAppointmentReport(filters)
        break
      case 'financial':
        reportData = await this.generateFinancialReport(filters)
        break
      case 'partners':
        reportData = await this.generatePartnerReport(filters)
        break
      default:
        throw new Error('Tipo de relatório não suportado')
    }

    if (format === 'csv') {
      return this.convertToCSV(reportData, reportType)
    }

    return reportData
  }

  private convertToCSV(data: any, reportType: string): string {
    // Implementação básica de conversão para CSV
    // Pode ser expandida conforme necessário
    
    if (reportType === 'appointments' && data.appointments) {
      const headers = ['Data', 'Hora', 'Paciente', 'Parceiro', 'Serviço', 'Sala', 'Status', 'Valor']
      const rows = data.appointments.map((apt: any) => [
        apt.date.toISOString().split('T')[0],
        apt.startTime,
        apt.patient?.fullName || '',
        apt.partner?.fullName || '',
        apt.productService?.name || '',
        apt.room?.name || '',
        apt.status,
        apt.productService?.salePrice || 0
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }

    if (reportType === 'financial' && data.entries) {
      const headers = ['Data Vencimento', 'Data Pagamento', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Status', 'Conta']
      const rows = data.entries.map((entry: any) => [
        entry.dueDate.toISOString().split('T')[0],
        entry.paidDate?.toISOString().split('T')[0] || '',
        entry.description,
        entry.type,
        entry.category || '',
        entry.amount,
        entry.status,
        entry.bankAccount?.name || ''
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }

    if (reportType === 'partners' && data.partners) {
      const headers = ['Nome', 'Tipo Parceria', 'Agendamentos', 'Receita', 'Comissão', 'Taxa Conclusão']
      const rows = data.partners.map((partner: any) => [
        partner.name,
        partner.partnershipType,
        partner.appointmentsCount,
        partner.revenue,
        partner.commission,
        `${partner.completionRate.toFixed(1)}%`
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }

    return JSON.stringify(data, null, 2)
  }
}
