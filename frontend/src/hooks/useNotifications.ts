import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '../services/notifications'
import {
  NotificationConfiguration,
  NotificationTemplate,
  NotificationLog,
  NotificationProvidersStatus,
  NotificationStatistics,
  NotificationSchedulerStatus,
  NotificationLogFilters,
  CreateNotificationTemplateData,
  UpdateNotificationTemplateData,
  UpdateNotificationConfigurationData,
  SendImmediateNotificationData
} from '../types/entities'
import {
  NotificationChannel,
  NotificationReminderType
} from '../types/shared'
import { useToast } from './useToast'

// 🔑 QUERY KEYS
export const notificationKeys = {
  all: ['notifications'] as const,
  configuration: () => [...notificationKeys.all, 'configuration'] as const,
  templates: () => [...notificationKeys.all, 'templates'] as const,
  templatesFiltered: (filters: any) => [...notificationKeys.templates(), filters] as const,
  template: (id: string) => [...notificationKeys.templates(), id] as const,
  logs: () => [...notificationKeys.all, 'logs'] as const,
  logsFiltered: (filters: NotificationLogFilters) => [...notificationKeys.logs(), filters] as const,
  statistics: (filters: any) => [...notificationKeys.all, 'statistics', filters] as const,
  providers: () => [...notificationKeys.all, 'providers'] as const,
  scheduler: () => [...notificationKeys.all, 'scheduler'] as const,
}

// 📊 CONFIGURAÇÃO
export function useNotificationConfiguration() {
  return useQuery({
    queryKey: notificationKeys.configuration(),
    queryFn: () => notificationsService.getConfiguration(),
    staleTime: 5 * 60 * 1000 // 5 minutos
  })
}

export function useUpdateNotificationConfiguration() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: UpdateNotificationConfigurationData) => 
      notificationsService.updateConfiguration(data),
    onSuccess: (updatedConfig) => {
      queryClient.setQueryData(notificationKeys.configuration(), updatedConfig)
      toast({
        title: 'Configuração atualizada',
        description: 'As configurações de notificação foram salvas com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar configuração',
        description: error.error || error.message || 'Não foi possível salvar as configurações.',
        variant: 'destructive'
      })
    }
  })
}

// 📝 TEMPLATES
export function useNotificationTemplates(filters?: {
  channel?: NotificationChannel
  type?: NotificationReminderType
  active?: boolean
}) {
  return useQuery({
    queryKey: notificationKeys.templatesFiltered(filters || {}),
    queryFn: () => notificationsService.getTemplates(filters),
    staleTime: 2 * 60 * 1000 // 2 minutos
  })
}

export function useNotificationTemplate(id: string) {
  return useQuery({
    queryKey: notificationKeys.template(id),
    queryFn: () => notificationsService.getTemplate(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000 // 5 minutos
  })
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateNotificationTemplateData) => 
      notificationsService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates() })
      toast({
        title: 'Template criado',
        description: 'O template de notificação foi criado com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar template',
        description: error.error || error.message || 'Não foi possível criar o template.',
        variant: 'destructive'
      })
    }
  })
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotificationTemplateData }) => 
      notificationsService.updateTemplate(id, data),
    onSuccess: (updatedTemplate) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates() })
      queryClient.setQueryData(notificationKeys.template(updatedTemplate.id), updatedTemplate)
      toast({
        title: 'Template atualizado',
        description: 'O template foi atualizado com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar template',
        description: error.error || error.message || 'Não foi possível atualizar o template.',
        variant: 'destructive'
      })
    }
  })
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => notificationsService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates() })
      toast({
        title: 'Template excluído',
        description: 'O template foi excluído com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir template',
        description: error.error || error.message || 'Não foi possível excluir o template.',
        variant: 'destructive'
      })
    }
  })
}

// 📤 ENVIO IMEDIATO
export function useSendImmediateNotification() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: SendImmediateNotificationData) => 
      notificationsService.sendImmediateNotification(data),
    onSuccess: () => {
      toast({
        title: 'Notificação enviada',
        description: 'A notificação foi enviada com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao enviar notificação',
        description: error.error || error.message || 'Não foi possível enviar a notificação.',
        variant: 'destructive'
      })
    }
  })
}

// 📋 LOGS E HISTÓRICO
export function useNotificationLogs(filters?: NotificationLogFilters) {
  return useQuery({
    queryKey: notificationKeys.logsFiltered(filters || {}),
    queryFn: () => notificationsService.getLogs(filters),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000 // Refetch a cada minuto
  })
}

// 📊 ESTATÍSTICAS
export function useNotificationStatistics(filters?: {
  appointmentId?: string
  dateFrom?: Date
  dateTo?: Date
}) {
  return useQuery({
    queryKey: notificationKeys.statistics(filters || {}),
    queryFn: () => notificationsService.getStatistics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000 // Refetch a cada 5 minutos
  })
}

// 🔧 UTILITÁRIOS
export function useNotificationProviders() {
  return useQuery({
    queryKey: notificationKeys.providers(),
    queryFn: () => notificationsService.getProvidersStatus(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: 5 * 60 * 1000 // Refetch a cada 5 minutos
  })
}

export function useNotificationScheduler() {
  return useQuery({
    queryKey: notificationKeys.scheduler(),
    queryFn: () => notificationsService.getSchedulerStatus(),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000 // Refetch a cada minuto
  })
}

export function useProcessSchedulerManually() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => notificationsService.processSchedulerManually(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.scheduler() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.logs() })
      toast({
        title: 'Processamento executado',
        description: 'O processamento manual de notificações foi executado.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no processamento',
        description: error.error || error.message || 'Não foi possível executar o processamento.',
        variant: 'destructive'
      })
    }
  })
}

// 📱 HOOKS AUXILIARES

export function useNotificationChannels() {
  const channels = Object.values(NotificationChannel)
  return channels.map(channel => ({
    value: channel,
    label: notificationsService.getChannelLabel(channel),
    icon: notificationsService.getChannelIcon(channel)
  }))
}

export function useNotificationReminderTypes() {
  const types = Object.values(NotificationReminderType)
  return types.map(type => ({
    value: type,
    label: notificationsService.getReminderTypeLabel(type)
  }))
}

export function useTemplateVariables() {
  const variables = notificationsService.getAvailableVariables()
  return variables.map(variable => ({
    name: variable,
    placeholder: `{${variable}}`,
    description: notificationsService.getVariableDescription(variable)
  }))
}
