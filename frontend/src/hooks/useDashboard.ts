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

// Hook para comparação de períodos
export function usePeriodComparison(currentPeriod: { startDate: string; endDate: string }) {
  // Calcular período anterior com mesmo número de dias
  const calculatePreviousPeriod = () => {
    const start = new Date(currentPeriod.startDate)
    const end = new Date(currentPeriod.endDate)
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    const previousStart = new Date(start)
    previousStart.setDate(previousStart.getDate() - diffDays - 1)
    
    const previousEnd = new Date(end)
    previousEnd.setDate(previousEnd.getDate() - diffDays - 1)
    
    return {
      startDate: previousStart.toISOString().split('T')[0],
      endDate: previousEnd.toISOString().split('T')[0]
    }
  }

  const previousPeriod = calculatePreviousPeriod()

  // Buscar dados do período atual
  const currentAppointments = useAppointmentMetrics(currentPeriod.startDate, currentPeriod.endDate)
  const currentRevenue = useRevenueMetrics(currentPeriod.startDate, currentPeriod.endDate)
  
  // Buscar dados do período anterior
  const previousAppointments = useAppointmentMetrics(previousPeriod.startDate, previousPeriod.endDate)
  const previousRevenue = useRevenueMetrics(previousPeriod.startDate, previousPeriod.endDate)

  return {
    current: {
      appointments: currentAppointments.data,
      revenue: currentRevenue.data,
      loading: currentAppointments.isLoading || currentRevenue.isLoading
    },
    previous: {
      appointments: previousAppointments.data,
      revenue: previousRevenue.data,
      loading: previousAppointments.isLoading || previousRevenue.isLoading
    },
    isLoading: currentAppointments.isLoading || currentRevenue.isLoading || 
               previousAppointments.isLoading || previousRevenue.isLoading
  }
}
