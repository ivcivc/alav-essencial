import { apiClient } from './api'

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

export interface ReportSummary {
  period: {
    startDate?: string
    endDate?: string
  }
  appointments: {
    total: number
    completed: number
    cancelled: number
    revenue: number
    averageServiceTime: number
  }
  financial: {
    totalIncome: number
    totalExpenses: number
    netProfit: number
    pendingAmount: number
  }
  partners: {
    total: number
    active: number
    totalRevenue: number
    averageCompletionRate: number
  }
  trends: {
    appointmentsByDate: Record<string, number>
    revenueByDate: Record<string, number>
    topServices: Record<string, number>
    topPartners: Record<string, number>
  }
}

export interface PerformanceReport {
  groupBy: 'day' | 'week' | 'month'
  data: Array<{
    period: string
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    revenue: number
  }>
  summary: {
    totalPeriods: number
    averageAppointmentsPerPeriod: number
    averageRevenuePerPeriod: number
  }
}

class ReportsService {
  async getAppointmentReport(filters: AppointmentReportFilters): Promise<AppointmentReport> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await apiClient.get(`/reports/appointments?${params.toString()}`)
    return response.data
  }

  async getFinancialReport(filters: FinancialReportFilters): Promise<FinancialReport> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await apiClient.get(`/reports/financial?${params.toString()}`)
    return response.data
  }

  async getPartnerReport(filters: PartnerReportFilters): Promise<PartnerReport> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await apiClient.get(`/reports/partners?${params.toString()}`)
    return response.data
  }

  async getReportSummary(filters: { startDate?: string; endDate?: string }): Promise<ReportSummary> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await apiClient.get(`/reports/summary?${params.toString()}`)
    return response.data
  }

  async getPerformanceReport(filters: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<PerformanceReport> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await apiClient.get(`/reports/performance?${params.toString()}`)
    return response.data
  }

  async exportReport(
    type: 'appointments' | 'financial' | 'partners',
    filters: any,
    format: 'json' | 'csv' = 'json'
  ): Promise<any> {
    const params = new URLSearchParams()
    params.append('format', format)
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    if (format === 'csv') {
      // Para CSV, fazemos download direto
      const url = `/api/reports/export/${type}?${params.toString()}`
      window.open(url, '_blank')
      return
    }

    const response = await apiClient.get(`/reports/export/${type}?${params.toString()}`)
    return response.data
  }

  // Método utilitário para download de CSV
  downloadCSV(data: string, filename: string) {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const reportsService = new ReportsService()
