import { useQuery } from '@tanstack/react-query'
import { reportsService, type AppointmentReportFilters, type FinancialReportFilters, type PartnerReportFilters } from '../services/reports'

// Hook para relatório de agendamentos
export function useAppointmentReport(filters: AppointmentReportFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: ['reports', 'appointments', filters],
    queryFn: () => reportsService.getAppointmentReport(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para relatório financeiro
export function useFinancialReport(filters: FinancialReportFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: ['reports', 'financial', filters],
    queryFn: () => reportsService.getFinancialReport(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para relatório de parceiros
export function usePartnerReport(filters: PartnerReportFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: ['reports', 'partners', filters],
    queryFn: () => reportsService.getPartnerReport(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para resumo de relatórios
export function useReportSummary(filters: { startDate?: string; endDate?: string }, enabled: boolean = true) {
  return useQuery({
    queryKey: ['reports', 'summary', filters],
    queryFn: () => reportsService.getReportSummary(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para relatório de performance
export function usePerformanceReport(
  filters: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  },
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['reports', 'performance', filters],
    queryFn: () => reportsService.getPerformanceReport(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
