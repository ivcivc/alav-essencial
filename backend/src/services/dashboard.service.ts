import { 
  AppointmentRepository, 
  FinancialEntryRepository, 
  PartnerRepository,
  PatientRepository,
  BankAccountRepository 
} from '../repositories'
import { AppointmentStatus, FinancialEntryType } from '../types/shared'
import { cacheService, cacheKeys } from './cacheService'

export interface DashboardKPIs {
  totalPatients: number
  totalPartners: number
  totalAppointments: number
  monthlyRevenue: number
  monthlyExpenses: number
  netProfit: number
  appointmentsToday: number
  appointmentsThisWeek: number
  appointmentsThisMonth: number
  pendingReceivables: number
  pendingPayables: number
  totalBalance: number
}

export interface AppointmentMetrics {
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  scheduledAppointments: number
  completionRate: number
  cancellationRate: number
  appointmentsByStatus: Array<{
    status: AppointmentStatus
    count: number
    percentage: number
  }>
  appointmentsByDay: Array<{
    date: string
    count: number
  }>
  appointmentsByPartner: Array<{
    partnerId: string
    partnerName: string
    count: number
    completedCount: number
    cancelledCount: number
  }>
}

export interface RevenueMetrics {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  revenueByCategory: Array<{
    category: string
    amount: number
    percentage: number
  }>
  expensesByCategory: Array<{
    category: string
    amount: number
    percentage: number
  }>
  monthlyRevenue: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
  dailyRevenue: Array<{
    date: string
    revenue: number
    expenses: number
    profit: number
  }>
}

export interface PartnerMetrics {
  totalPartners: number
  activePartners: number
  inactivePartners: number
  partnersByType: Array<{
    type: string
    count: number
    percentage: number
  }>
  topPartnersByRevenue: Array<{
    partnerId: string
    partnerName: string
    totalRevenue: number
    appointmentCount: number
    averageTicket: number
  }>
  partnerPerformance: Array<{
    partnerId: string
    partnerName: string
    appointmentsCount: number
    completionRate: number
    totalRevenue: number
    commission: number
  }>
}

export interface DateRange {
  startDate: Date
  endDate: Date
}

export class DashboardService {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private financialEntryRepository: FinancialEntryRepository,
    private partnerRepository: PartnerRepository,
    private patientRepository: PatientRepository,
    private bankAccountRepository: BankAccountRepository
  ) {}

  async getKPIs(dateRange?: DateRange): Promise<DashboardKPIs> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1)
    const startOfWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000))
    const endOfWeek = new Date(startOfWeek.getTime() + (7 * 24 * 60 * 60 * 1000) - 1)

    const range = dateRange || { startDate: startOfMonth, endDate: endOfMonth }

    // Cache key para KPIs (TTL: 5 minutos para dados do dashboard)
    const cacheKey = cacheKeys.dashboard.stats()
    
    return cacheService.remember(
      cacheKey,
      async () => this.calculateKPIs(range, now, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth),
      300 // 5 minutos
    )
  }

  private async calculateKPIs(
    range: DateRange,
    now: Date,
    startOfToday: Date,
    endOfToday: Date,
    startOfWeek: Date,
    endOfWeek: Date,
    startOfMonth: Date,
    endOfMonth: Date
  ): Promise<DashboardKPIs> {

    // Buscar dados em paralelo
    const [
      totalPatients,
      totalPartners,
      totalAppointments,
      appointmentsToday,
      appointmentsThisWeek,
      appointmentsThisMonth,
      monthlyRevenue,
      monthlyExpenses,
      pendingReceivables,
      pendingPayables,
      totalBalance
    ] = await Promise.all([
      this.patientRepository.count(),
      this.partnerRepository.count({ active: true }),
      this.appointmentRepository.count({}),
      this.appointmentRepository.count({
        startDate: startOfToday,
        endDate: endOfToday
      }),
      this.appointmentRepository.count({
        startDate: startOfWeek,
        endDate: endOfWeek
      }),
      this.appointmentRepository.count({
        startDate: startOfMonth,
        endDate: endOfMonth
      }),
      this.getRevenueInPeriod(startOfMonth, endOfMonth),
      this.getExpensesInPeriod(startOfMonth, endOfMonth),
      this.getPendingReceivables(),
      this.getPendingPayables(),
      this.getTotalBalance()
    ])

    const netProfit = monthlyRevenue - monthlyExpenses

    return {
      totalPatients,
      totalPartners,
      totalAppointments,
      monthlyRevenue,
      monthlyExpenses,
      netProfit,
      appointmentsToday,
      appointmentsThisWeek,
      appointmentsThisMonth,
      pendingReceivables,
      pendingPayables,
      totalBalance
    }
  }

  async getAppointmentMetrics(dateRange: DateRange): Promise<AppointmentMetrics> {
    const appointments = await this.appointmentRepository.findByDateRange(
      dateRange.startDate,
      dateRange.endDate,
      {}
    )

    const totalAppointments = appointments.length
    const completedAppointments = appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length
    const cancelledAppointments = appointments.filter(a => a.status === AppointmentStatus.CANCELLED).length
    const scheduledAppointments = appointments.filter(a => 
      a.status === AppointmentStatus.SCHEDULED || a.status === AppointmentStatus.CONFIRMED
    ).length

    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0
    const cancellationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0

    // Agrupamento por status
    const statusCounts = appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1
      return acc
    }, {} as Record<AppointmentStatus, number>)

    const appointmentsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: status as AppointmentStatus,
      count,
      percentage: totalAppointments > 0 ? (count / totalAppointments) * 100 : 0
    }))

    // Agrupamento por dia
    const daysCounts = appointments.reduce((acc, appointment) => {
      const date = appointment.date.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const appointmentsByDay = Object.entries(daysCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Agrupamento por parceiro
    const partnerCounts = appointments.reduce((acc, appointment) => {
      const partnerId = appointment.partnerId
      const partnerName = appointment.partner?.fullName || 'Parceiro não encontrado'
      
      if (!acc[partnerId]) {
        acc[partnerId] = {
          partnerId,
          partnerName,
          count: 0,
          completedCount: 0,
          cancelledCount: 0
        }
      }
      
      acc[partnerId].count++
      if (appointment.status === AppointmentStatus.COMPLETED) {
        acc[partnerId].completedCount++
      }
      if (appointment.status === AppointmentStatus.CANCELLED) {
        acc[partnerId].cancelledCount++
      }
      
      return acc
    }, {} as Record<string, any>)

    const appointmentsByPartner = Object.values(partnerCounts)

    return {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      scheduledAppointments,
      completionRate,
      cancellationRate,
      appointmentsByStatus,
      appointmentsByDay,
      appointmentsByPartner
    }
  }

  async getRevenueMetrics(dateRange: DateRange): Promise<RevenueMetrics> {
    const entries = await this.financialEntryRepository.findAll({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    })

    const revenues = entries.filter(e => e.type === FinancialEntryType.INCOME)
    const expenses = entries.filter(e => e.type === FinancialEntryType.EXPENSE)

    const totalRevenue = revenues.reduce((sum, entry) => sum + Number(entry.amount), 0)
    const totalExpenses = expenses.reduce((sum, entry) => sum + Number(entry.amount), 0)
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Receitas por categoria
    const revenueCategoryCounts = revenues.reduce((acc, entry) => {
      const category = entry.category || 'Sem categoria'
      acc[category] = (acc[category] || 0) + Number(entry.amount)
      return acc
    }, {} as Record<string, number>)

    const revenueByCategory = Object.entries(revenueCategoryCounts)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)

    // Despesas por categoria
    const expenseCategoryCounts = expenses.reduce((acc, entry) => {
      const category = entry.category || 'Sem categoria'
      acc[category] = (acc[category] || 0) + Number(entry.amount)
      return acc
    }, {} as Record<string, number>)

    const expensesByCategory = Object.entries(expenseCategoryCounts)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)

    // Dados mensais (últimos 12 meses)
    const monthlyData = this.generateMonthlyData(entries, 12)

    // Dados diários (período selecionado)
    const dailyData = this.generateDailyData(entries, dateRange)

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      revenueByCategory,
      expensesByCategory,
      monthlyRevenue: monthlyData,
      dailyRevenue: dailyData
    }
  }

  async getPartnerMetrics(dateRange: DateRange): Promise<PartnerMetrics> {
    const partners = await this.partnerRepository.findAll({})
    const appointments = await this.appointmentRepository.findByDateRange(
      dateRange.startDate,
      dateRange.endDate,
      {}
    )

    const totalPartners = partners.length
    const activePartners = partners.filter(p => p.status === 'active').length
    const inactivePartners = totalPartners - activePartners

    // Parceiros por tipo
    const partnerTypeCounts = partners.reduce((acc, partner) => {
      const type = partner.partnershipType || 'Não definido'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const partnersByType = Object.entries(partnerTypeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: totalPartners > 0 ? (count / totalPartners) * 100 : 0
    }))

    // Performance dos parceiros
    const partnerStats = appointments.reduce((acc, appointment) => {
      const partnerId = appointment.partnerId
      const partnerName = appointment.partner?.fullName || 'Parceiro não encontrado'
      const servicePrice = appointment.service?.salePrice || 0

      if (!acc[partnerId]) {
        acc[partnerId] = {
          partnerId,
          partnerName,
          appointmentsCount: 0,
          completedCount: 0,
          totalRevenue: 0,
          commission: 0
        }
      }

      acc[partnerId].appointmentsCount++
      
      if (appointment.status === AppointmentStatus.COMPLETED) {
        acc[partnerId].completedCount++
        acc[partnerId].totalRevenue += Number(servicePrice)
        
        // Calcular comissão baseada no tipo de parceria
        const partner = partners.find(p => p.id === partnerId)
        if (partner) {
          if (partner.partnershipType === 'percentage') {
            const rate = partner.partnershipConfig?.percentageRate || 0
            acc[partnerId].commission += (Number(servicePrice) * rate) / 100
          }
        }
      }

      return acc
    }, {} as Record<string, any>)

    const partnerPerformance = Object.values(partnerStats).map((stats: any) => ({
      ...stats,
      completionRate: stats.appointmentsCount > 0 ? (stats.completedCount / stats.appointmentsCount) * 100 : 0,
      averageTicket: stats.completedCount > 0 ? stats.totalRevenue / stats.completedCount : 0
    }))

    const topPartnersByRevenue = partnerPerformance
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    return {
      totalPartners,
      activePartners,
      inactivePartners,
      partnersByType,
      topPartnersByRevenue,
      partnerPerformance
    }
  }

  private async getRevenueInPeriod(startDate: Date, endDate: Date): Promise<number> {
    const entries = await this.financialEntryRepository.findAll({
      type: FinancialEntryType.INCOME,
      startDate: startDate,
      endDate: endDate,
      paid: true
    })

    return entries.reduce((sum, entry) => sum + Number(entry.amount), 0)
  }

  private async getExpensesInPeriod(startDate: Date, endDate: Date): Promise<number> {
    const entries = await this.financialEntryRepository.findAll({
      type: FinancialEntryType.EXPENSE,
      startDate: startDate,
      endDate: endDate,
      paid: true
    })

    return entries.reduce((sum, entry) => sum + Number(entry.amount), 0)
  }

  private async getPendingReceivables(): Promise<number> {
    const entries = await this.financialEntryRepository.findAll({
      type: FinancialEntryType.INCOME,
      paid: false
    })

    return entries.reduce((sum, entry) => sum + Number(entry.amount), 0)
  }

  private async getPendingPayables(): Promise<number> {
    const entries = await this.financialEntryRepository.findAll({
      type: FinancialEntryType.EXPENSE,
      paid: false
    })

    return entries.reduce((sum, entry) => sum + Number(entry.amount), 0)
  }

  private async getTotalBalance(): Promise<number> {
    const accounts = await this.bankAccountRepository.findAll({})
    return accounts.reduce((sum, account) => sum + Number(account.currentBalance), 0)
  }

  private generateMonthlyData(entries: any[], monthsCount: number): Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }> {
    const now = new Date()
    const monthlyData = []

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthEntries = entries.filter(entry => {
        const entryDate = new Date(entry.dueDate || entry.paidAt)
        return entryDate >= monthStart && entryDate <= monthEnd
      })

      const revenue = monthEntries
        .filter(e => e.type === FinancialEntryType.INCOME)
        .reduce((sum, entry) => sum + Number(entry.amount), 0)

      const expenses = monthEntries
        .filter(e => e.type === FinancialEntryType.EXPENSE)
        .reduce((sum, entry) => sum + Number(entry.amount), 0)

      monthlyData.push({
        month: date.toISOString().substring(0, 7), // YYYY-MM
        revenue,
        expenses,
        profit: revenue - expenses
      })
    }

    return monthlyData
  }

  private generateDailyData(entries: any[], dateRange: DateRange): Array<{
    date: string
    revenue: number
    expenses: number
    profit: number
  }> {
    const dailyData = []
    const currentDate = new Date(dateRange.startDate)

    while (currentDate <= dateRange.endDate) {
      const dayStart = new Date(currentDate)
      const dayEnd = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000 - 1)

      const dayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.dueDate || entry.paidAt)
        return entryDate >= dayStart && entryDate <= dayEnd
      })

      const revenue = dayEntries
        .filter(e => e.type === FinancialEntryType.INCOME)
        .reduce((sum, entry) => sum + Number(entry.amount), 0)

      const expenses = dayEntries
        .filter(e => e.type === FinancialEntryType.EXPENSE)
        .reduce((sum, entry) => sum + Number(entry.amount), 0)

      dailyData.push({
        date: currentDate.toISOString().split('T')[0],
        revenue,
        expenses,
        profit: revenue - expenses
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dailyData
  }
}
