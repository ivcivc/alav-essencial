import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService, type ClinicSettings } from '../services/settings'
import { useToast } from './useToast'

// Hook para buscar configurações da clínica
export function useClinicSettings() {
  return useQuery({
    queryKey: ['clinic-settings'],
    queryFn: () => settingsService.getClinicSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para atualizar configurações da clínica
export function useUpdateClinicSettings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (settings: Partial<ClinicSettings>) => 
      settingsService.updateClinicSettings(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(['clinic-settings'], data)
      toast({
        title: 'Configurações atualizadas',
        description: 'As configurações da clínica foram salvas com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Erro ao salvar as configurações.',
        variant: 'destructive',
      })
    },
  })
}

// Hook para validar horários de funcionamento
export function useValidateBusinessHours() {
  return useMutation({
    mutationFn: ({ date, startTime, endTime }: { date: string; startTime: string; endTime: string }) =>
      settingsService.validateBusinessHours(date, startTime, endTime),
  })
}

// Hook para validar movimentação de agendamentos
export function useValidateAppointmentMovement() {
  return useMutation({
    mutationFn: (status: string) =>
      settingsService.validateAppointmentMovement(status),
  })
}

