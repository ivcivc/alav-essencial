import { apiClient } from './api'
import {
  NotificationConfiguration,
  NotificationTemplate,
  NotificationSchedule,
  NotificationLog,
  NotificationProvidersStatus,
  NotificationStatistics,
  NotificationSchedulerStatus,
  NotificationLogFilters,
  CreateNotificationTemplateData,
  UpdateNotificationTemplateData,
  UpdateNotificationConfigurationData,
  SendImmediateNotificationData,
  ApiResponse
} from '../types/entities'
import {
  NotificationChannel,
  NotificationReminderType,
  NotificationStatus
} from '../types/shared'

// 🔔 SERVIÇO DE NOTIFICAÇÕES

export const notificationsService = {
  // 📊 CONFIGURAÇÃO
  async getConfiguration(): Promise<NotificationConfiguration> {
    const response = await apiClient.request<ApiResponse<NotificationConfiguration>>('/api/notifications/configuration')
    return response.data
  },

  async updateConfiguration(data: UpdateNotificationConfigurationData): Promise<NotificationConfiguration> {
    const response = await apiClient.request<ApiResponse<NotificationConfiguration>>('/api/notifications/configuration', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
    return response.data
  },

  // 📝 TEMPLATES
  async getTemplates(filters?: {
    channel?: NotificationChannel
    type?: NotificationReminderType
    active?: boolean
  }): Promise<NotificationTemplate[]> {
    const params = new URLSearchParams()
    if (filters?.channel) params.append('channel', filters.channel)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.active !== undefined) params.append('active', filters.active.toString())

    const url = `/api/notifications/templates${params.toString() ? `?${params.toString()}` : ''}`
    const response = await apiClient.request<ApiResponse<NotificationTemplate[]>>(url)
    return response.data
  },

  async getTemplate(id: string): Promise<NotificationTemplate> {
    const response = await apiClient.request<ApiResponse<NotificationTemplate>>(`/api/notifications/templates/${id}`)
    return response.data
  },

  async createTemplate(data: CreateNotificationTemplateData): Promise<NotificationTemplate> {
    const response = await apiClient.request<ApiResponse<NotificationTemplate>>('/api/notifications/templates', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return response.data
  },

  async updateTemplate(id: string, data: UpdateNotificationTemplateData): Promise<NotificationTemplate> {
    const response = await apiClient.request<ApiResponse<NotificationTemplate>>(`/api/notifications/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
    return response.data
  },

  async deleteTemplate(id: string): Promise<void> {
    await apiClient.request<ApiResponse<null>>(`/api/notifications/templates/${id}`, {
      method: 'DELETE'
    })
  },

  // 📤 ENVIO IMEDIATO
  async sendImmediateNotification(data: SendImmediateNotificationData): Promise<void> {
    await apiClient.request<ApiResponse<null>>('/api/notifications/send', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 📋 LOGS E HISTÓRICO
  async getLogs(filters?: NotificationLogFilters): Promise<{ logs: NotificationLog[]; total: number }> {
    const params = new URLSearchParams()
    if (filters?.appointmentId) params.append('appointmentId', filters.appointmentId)
    if (filters?.channel) params.append('channel', filters.channel)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString())
    if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString())
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const url = `/api/notifications/logs${params.toString() ? `?${params.toString()}` : ''}`
    const response = await apiClient.request<ApiResponse<{ logs: NotificationLog[]; total: number }>>(url)
    return response.data
  },

  // 📊 ESTATÍSTICAS
  async getStatistics(filters?: {
    appointmentId?: string
    dateFrom?: Date
    dateTo?: Date
  }): Promise<NotificationStatistics> {
    const params = new URLSearchParams()
    if (filters?.appointmentId) params.append('appointmentId', filters.appointmentId)
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString())
    if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString())

    const url = `/api/notifications/stats${params.toString() ? `?${params.toString()}` : ''}`
    const response = await apiClient.request<ApiResponse<NotificationStatistics>>(url)
    return response.data
  },

  // 🔧 UTILITÁRIOS
  async getProvidersStatus(): Promise<NotificationProvidersStatus> {
    const response = await apiClient.request<ApiResponse<NotificationProvidersStatus>>('/api/notifications/providers')
    return response.data
  },

  async getSchedulerStatus(): Promise<NotificationSchedulerStatus> {
    const response = await apiClient.request<ApiResponse<NotificationSchedulerStatus>>('/api/notifications/scheduler/status')
    return response.data
  },

  async processSchedulerManually(): Promise<void> {
    await apiClient.request<ApiResponse<null>>('/api/notifications/scheduler/process', {
      method: 'POST'
    })
  },

  // 🎨 HELPERS PARA UI
  getChannelLabel(channel: NotificationChannel): string {
    const labels = {
      [NotificationChannel.WHATSAPP]: 'WhatsApp',
      [NotificationChannel.SMS]: 'SMS',
      [NotificationChannel.EMAIL]: 'Email'
    }
    return labels[channel] || channel
  },

  getChannelIcon(channel: NotificationChannel): string {
    const icons = {
      [NotificationChannel.WHATSAPP]: '📱',
      [NotificationChannel.SMS]: '💬',
      [NotificationChannel.EMAIL]: '📧'
    }
    return icons[channel] || '📨'
  },

  getReminderTypeLabel(type: NotificationReminderType): string {
    const labels = {
      [NotificationReminderType.FIRST_REMINDER]: '1º Lembrete (3 dias antes)',
      [NotificationReminderType.SECOND_REMINDER]: '2º Lembrete (1 dia antes)',
      [NotificationReminderType.THIRD_REMINDER]: '3º Lembrete (2 horas antes)',
      [NotificationReminderType.IMMEDIATE]: 'Notificação Imediata'
    }
    return labels[type] || type
  },

  getStatusLabel(status: NotificationStatus): string {
    const labels = {
      [NotificationStatus.PENDING]: 'Pendente',
      [NotificationStatus.SENDING]: 'Enviando',
      [NotificationStatus.SENT]: 'Enviado',
      [NotificationStatus.DELIVERED]: 'Entregue',
      [NotificationStatus.READ]: 'Lido',
      [NotificationStatus.FAILED]: 'Falhou',
      [NotificationStatus.CANCELLED]: 'Cancelado'
    }
    return labels[status] || status
  },

  getStatusColor(status: NotificationStatus): string {
    const colors = {
      [NotificationStatus.PENDING]: 'text-yellow-600',
      [NotificationStatus.SENDING]: 'text-blue-600',
      [NotificationStatus.SENT]: 'text-green-600',
      [NotificationStatus.DELIVERED]: 'text-green-700',
      [NotificationStatus.READ]: 'text-green-800',
      [NotificationStatus.FAILED]: 'text-red-600',
      [NotificationStatus.CANCELLED]: 'text-gray-600'
    }
    return colors[status] || 'text-gray-600'
  },

  // 📱 TEMPLATE VARIABLES
  getAvailableVariables(): string[] {
    return [
      'paciente',
      'profissional',
      'servico',
      'data',
      'hora',
      'sala',
      'clinica',
      'endereco',
      'telefone'
    ]
  },

  getVariableDescription(variable: string): string {
    const descriptions = {
      'paciente': 'Nome completo do paciente',
      'profissional': 'Nome completo do profissional/parceiro',
      'servico': 'Nome do serviço/procedimento',
      'data': 'Data do agendamento (formato brasileiro)',
      'hora': 'Horário do agendamento',
      'sala': 'Nome da sala (se houver)',
      'clinica': 'Nome da clínica',
      'endereco': 'Endereço da clínica',
      'telefone': 'Telefone de contato da clínica'
    }
    return descriptions[variable] || variable
  }
}
