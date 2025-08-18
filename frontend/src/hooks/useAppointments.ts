import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentsService } from '../services/appointments'
import { 
  Appointment,
  AppointmentFilters,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentListResponse
} from '../types/entities'
import { useToast } from './useToast'

// Key factory para facilitar invalidação
const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: AppointmentFilters) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  dateRange: (startDate: string, endDate: string) => 
    [...appointmentKeys.all, 'dateRange', startDate, endDate] as const,
  availability: (partnerId: string, date: string, startTime: string, endTime: string) =>
    [...appointmentKeys.all, 'availability', partnerId, date, startTime, endTime] as const,
}

// Hook para buscar lista de agendamentos com filtros
export function useAppointments(filters: AppointmentFilters = {}) {
  const { toast } = useToast()

  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => appointmentsService.getAppointments(filters),
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar agendamentos',
        description: error.message,
        variant: 'destructive',
      })
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}

// Hook para buscar agendamentos por período
export function useAppointmentsByDateRange(startDate: string, endDate: string, enabled = true) {
  const { toast } = useToast()

  return useQuery({
    queryKey: appointmentKeys.dateRange(startDate, endDate),
    queryFn: () => appointmentsService.getAppointmentsByDateRange(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar agendamentos do período',
        description: error.message,
        variant: 'destructive',
      })
    },
    staleTime: 1000 * 60 * 1, // 1 minuto
  })
}

// Hook para buscar agendamento específico
export function useAppointment(id: string) {
  const { toast } = useToast()

  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentsService.getAppointmentById(id),
    enabled: !!id,
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar agendamento',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para criar agendamento
export function useCreateAppointment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateAppointmentData) => appointmentsService.createAppointment(data),
    onSuccess: (appointment) => {
      // Invalidar todas as listas de agendamentos
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      
      toast({
        title: 'Agendamento criado',
        description: 'O agendamento foi criado com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar agendamento',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para atualizar agendamento
export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentData }) =>
      appointmentsService.updateAppointment(id, data),
    onSuccess: (appointment) => {
      // Invalidar cache específico e listas
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(appointment.id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      
      toast({
        title: 'Agendamento atualizado',
        description: 'O agendamento foi atualizado com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar agendamento',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para deletar agendamento
export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => appointmentsService.deleteAppointment(id),
    onSuccess: (_, deletedId) => {
      // Remover do cache e invalidar listas
      queryClient.removeQueries({ queryKey: appointmentKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      
      toast({
        title: 'Agendamento excluído',
        description: 'O agendamento foi excluído com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir agendamento',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para cancelar agendamento
export function useCancelAppointment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      appointmentsService.cancelAppointment(id, reason),
    onSuccess: (appointment) => {
      // Atualizar cache específico e invalidar listas
      queryClient.setQueryData(appointmentKeys.detail(appointment.id), appointment)
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      
      toast({
        title: 'Agendamento cancelado',
        description: 'O agendamento foi cancelado com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cancelar agendamento',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para reagendar agendamento
export function useRescheduleAppointment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ 
      id, 
      newDate, 
      newStartTime, 
      newEndTime 
    }: { 
      id: string
      newDate: string
      newStartTime: string
      newEndTime: string
    }) =>
      appointmentsService.rescheduleAppointment(id, newDate, newStartTime, newEndTime),
    onSuccess: (appointment) => {
      // Atualizar cache específico e invalidar listas
      queryClient.setQueryData(appointmentKeys.detail(appointment.id), appointment)
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      
      toast({
        title: 'Agendamento reagendado',
        description: 'O agendamento foi reagendado com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao reagendar agendamento',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para check-in
export function useCheckInAppointment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => appointmentsService.checkInAppointment(id),
    onSuccess: (appointment) => {
      queryClient.setQueryData(appointmentKeys.detail(appointment.id), appointment)
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      
      toast({
        title: 'Check-in realizado',
        description: 'Check-in do agendamento realizado com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no check-in',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para check-out
export function useCheckOutAppointment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => appointmentsService.checkOutAppointment(id),
    onSuccess: (appointment) => {
      queryClient.setQueryData(appointmentKeys.detail(appointment.id), appointment)
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      
      toast({
        title: 'Check-out realizado',
        description: 'Check-out do agendamento realizado com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no check-out',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para desfazer check-in
export function useUndoCheckInAppointment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => appointmentsService.undoCheckInAppointment(id),
    onSuccess: (appointment) => {
      queryClient.setQueryData(appointmentKeys.detail(appointment.id), appointment)
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      
      toast({
        title: 'Check-in desfeito',
        description: 'O check-in foi desfeito com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao desfazer check-in',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para desfazer check-out
export function useUndoCheckOutAppointment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => appointmentsService.undoCheckOutAppointment(id),
    onSuccess: (appointment) => {
      queryClient.setQueryData(appointmentKeys.detail(appointment.id), appointment)
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      
      toast({
        title: 'Check-out desfeito',
        description: 'O check-out foi desfeito com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao desfazer check-out',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook para verificar disponibilidade
export function useCheckAvailability() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ 
      partnerId, 
      date, 
      startTime, 
      endTime, 
      excludeAppointmentId 
    }: {
      partnerId: string
      date: string
      startTime: string
      endTime: string
      excludeAppointmentId?: string
    }) =>
      appointmentsService.checkAvailability(partnerId, date, startTime, endTime, excludeAppointmentId),
    onError: (error: any) => {
      toast({
        title: 'Erro ao verificar disponibilidade',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}
