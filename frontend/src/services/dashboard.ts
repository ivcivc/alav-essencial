import { apiClient } from './api'

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
    status: string
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

export interface DashboardOverview {
  kpis: DashboardKPIs
  appointments: {
    totalAppointments: number
    completionRate: number
    cancellationRate: number
    appointmentsByStatus: Array<{
      status: string
      count: number
      percentage: number
    }>
  }
  revenue: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    profitMargin: number
  }
  period: {
    startDate: string
    endDate: string
  }
}

export interface DateRange {
  startDate?: string
  endDate?: string
}

export const dashboardService = {
  // 📊 Obter KPIs principais
  async getKPIs(dateRange?: DateRange): Promise<DashboardKPIs> {
    const params = new URLSearchParams()
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate)
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate)
    
    const queryString = params.toString()
    const url = `/dashboard/kpis${queryString ? `?${queryString}` : ''}`
    
    const response = await apiClient.get<DashboardKPIs>(url)
    return response.data
  },

  // 📈 Obter visão geral completa
  async getOverview(dateRange?: DateRange): Promise<DashboardOverview> {
    const params = new URLSearchParams()
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate)
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate)
    
    const queryString = params.toString()
    const url = `/dashboard/overview${queryString ? `?${queryString}` : ''}`
    
    const response = await apiClient.get<DashboardOverview>(url)
    return response.data
  },

  // 📅 Obter métricas de agendamentos
  async getAppointmentMetrics(startDate: string, endDate: string): Promise<AppointmentMetrics> {
    const response = await apiClient.get<AppointmentMetrics>(`/dashboard/appointments?startDate=${startDate}&endDate=${endDate}`)
    return response.data
  },

  // 💰 Obter métricas de receita
  async getRevenueMetrics(startDate: string, endDate: string): Promise<RevenueMetrics> {
    const response = await apiClient.get<RevenueMetrics>(`/dashboard/revenue?startDate=${startDate}&endDate=${endDate}`)
    return response.data
  },

  // 👥 Obter métricas de parceiros
  async getPartnerMetrics(startDate: string, endDate: string): Promise<PartnerMetrics> {
    const response = await apiClient.get<PartnerMetrics>(`/dashboard/partners?startDate=${startDate}&endDate=${endDate}`)
    return response.data
  },

  // 📊 Obter dados para gráficos de agendamentos
  async getAppointmentChartData(startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month' = 'day') {
    const response = await apiClient.get(`/dashboard/charts/appointments?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`)
    return response.data
  },

  // 💰 Obter dados para gráficos financeiros
  async getRevenueChartData(startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month' = 'day') {
    const response = await apiClient.get(`/dashboard/charts/revenue?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`)
    return response.data
  }
}
