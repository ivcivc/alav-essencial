import { useQuery } from '@tanstack/react-query'
import { dashboardService, type DateRange, type DashboardOverview, type DashboardKPIs } from '../services/dashboard'

export function useDashboardOverview(dateRange?: DateRange) {
  return useQuery({
    queryKey: ['dashboard', 'overview', dateRange],
    queryFn: () => dashboardService.getOverview(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos
  })
}

export function useDashboardKPIs(dateRange?: DateRange) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', dateRange],
    queryFn: () => dashboardService.getKPIs(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 60 * 1000, // Refetch a cada 1 minuto
  })
}

export function useAppointmentMetrics(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['dashboard', 'appointments', startDate, endDate],
    queryFn: () => dashboardService.getAppointmentMetrics(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export function useRevenueMetrics(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['dashboard', 'revenue', startDate, endDate],
    queryFn: () => dashboardService.getRevenueMetrics(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export function usePartnerMetrics(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['dashboard', 'partners', startDate, endDate],
    queryFn: () => dashboardService.getPartnerMetrics(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

export function useAppointmentChartData(startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: ['dashboard', 'charts', 'appointments', startDate, endDate, groupBy],
    queryFn: () => dashboardService.getAppointmentChartData(startDate, endDate, groupBy),
    enabled: !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export function useRevenueChartData(startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: ['dashboard', 'charts', 'revenue', startDate, endDate, groupBy],
    queryFn: () => dashboardService.getRevenueChartData(startDate, endDate, groupBy),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
