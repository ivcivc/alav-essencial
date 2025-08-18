import { PrismaClient } from '@prisma/client'
import {
  NotificationConfigurationRepository,
  NotificationTemplateRepository,
  NotificationScheduleRepository,
  NotificationLogRepository,
  PrismaNotificationConfigurationRepository,
  PrismaNotificationTemplateRepository,
  PrismaNotificationScheduleRepository,
  PrismaNotificationLogRepository
} from '../repositories/notification.repository'
import {
  NotificationProviderFactory,
  NotificationProvider,
  NotificationMessage,
  NotificationResult
} from './notification-providers'
import {
  NotificationConfiguration,
  NotificationTemplate,
  NotificationSchedule,
  NotificationLog,
  AppointmentWithRelations
} from '../types/entities'
import {
  NotificationChannel,
  NotificationReminderType,
  NotificationStatus
} from '../types/shared'

// 🔔 INTERFACES DE DADOS

export interface CreateNotificationScheduleData {
  appointmentId: string
  type: NotificationReminderType
  channel?: NotificationChannel
  scheduledFor?: Date
}

export interface TemplateVariables {
  paciente: string
  profissional: string
  servico: string
  data: string
  hora: string
  sala?: string
  clinica: string
  endereco?: string
  telefone?: string
}

// 🔔 SERVIÇO PRINCIPAL DE NOTIFICAÇÕES

export class NotificationService {
  private configRepository: NotificationConfigurationRepository
  private templateRepository: NotificationTemplateRepository
  private scheduleRepository: NotificationScheduleRepository
  private logRepository: NotificationLogRepository

  constructor(prisma: PrismaClient) {
    this.configRepository = new PrismaNotificationConfigurationRepository(prisma)
    this.templateRepository = new PrismaNotificationTemplateRepository(prisma)
    this.scheduleRepository = new PrismaNotificationScheduleRepository(prisma)
    this.logRepository = new PrismaNotificationLogRepository(prisma)
  }

  // 📅 AGENDAMENTO DE LEMBRETES

  async scheduleReminders(appointment: AppointmentWithRelations): Promise<void> {
    try {
      const config = await this.getConfiguration()
      if (!config.enabled) {
        console.log(`📵 Notificações desabilitadas - não agendando lembretes para agendamento ${appointment.id}`)
        return
      }

      // Cancelar lembretes existentes se houver
      await this.cancelReminders(appointment.id)

      const appointmentDateTime = new Date(`${appointment.date.toISOString().split('T')[0]}T${appointment.startTime}`)
      
      // Agendar primeiro lembrete (3 dias antes)
      await this.scheduleReminderByType(
        appointment,
        NotificationReminderType.FIRST_REMINDER,
        this.calculateReminderTime(appointmentDateTime, config.firstReminderDays, 'days'),
        config
      )

      // Agendar segundo lembrete (1 dia antes)
      await this.scheduleReminderByType(
        appointment,
        NotificationReminderType.SECOND_REMINDER,
        this.calculateReminderTime(appointmentDateTime, config.secondReminderDays, 'days'),
        config
      )

      // Agendar terceiro lembrete (2 horas antes)
      await this.scheduleReminderByType(
        appointment,
        NotificationReminderType.THIRD_REMINDER,
        this.calculateReminderTime(appointmentDateTime, config.thirdReminderHours, 'hours'),
        config
      )

      console.log(`✅ Lembretes agendados para o agendamento ${appointment.id}`)

    } catch (error) {
      console.error(`❌ Erro ao agendar lembretes para agendamento ${appointment.id}:`, error)
      throw error
    }
  }

  async cancelReminders(appointmentId: string): Promise<void> {
    try {
      await this.scheduleRepository.deleteByAppointmentId(appointmentId)
      console.log(`🗑️ Lembretes cancelados para agendamento ${appointmentId}`)
    } catch (error) {
      console.error(`❌ Erro ao cancelar lembretes para agendamento ${appointmentId}:`, error)
      throw error
    }
  }

  async rescheduleReminders(appointment: AppointmentWithRelations): Promise<void> {
    await this.scheduleReminders(appointment)
  }

  // 📤 ENVIO IMEDIATO

  async sendImmediateNotification(
    appointment: AppointmentWithRelations,
    type: NotificationReminderType,
    customMessage?: string,
    channels?: NotificationChannel[]
  ): Promise<void> {
    try {
      const config = await this.getConfiguration()
      const targetChannels = channels || [config.defaultChannel as NotificationChannel]

      for (const channel of targetChannels) {
        if (await this.isChannelEnabled(channel, config)) {
          await this.sendNotificationForChannel(appointment, type, channel, customMessage)
        }
      }

    } catch (error) {
      console.error(`❌ Erro ao enviar notificação imediata:`, error)
      throw error
    }
  }

  // 🔄 PROCESSAMENTO DE AGENDAMENTOS

  async processScheduledNotifications(): Promise<void> {
    try {
      const pendingSchedules = await this.scheduleRepository.findPendingSchedules()
      
      console.log(`📬 Processando ${pendingSchedules.length} notificações agendadas`)

      for (const schedule of pendingSchedules) {
        await this.processSingleSchedule(schedule)
      }

    } catch (error) {
      console.error(`❌ Erro ao processar notificações agendadas:`, error)
      throw error
    }
  }

  // 🔧 MÉTODOS AUXILIARES

  private async scheduleReminderByType(
    appointment: AppointmentWithRelations,
    type: NotificationReminderType,
    scheduledFor: Date,
    config: NotificationConfiguration
  ): Promise<void> {
    // Verificar se a data de agendamento já passou
    if (scheduledFor <= new Date()) {
      console.log(`⏰ Horário do lembrete ${type} já passou para agendamento ${appointment.id}`)
      return
    }

    const channel = this.getPreferredChannel(appointment, config)
    const template = await this.templateRepository.findByTypeAndChannel(type, channel)

    if (!template) {
      console.warn(`⚠️ Template não encontrado para tipo ${type} e canal ${channel}`)
      return
    }

    await this.scheduleRepository.create({
      appointmentId: appointment.id,
      templateId: template.id,
      scheduledFor,
      status: NotificationStatus.PENDING,
      channel,
      retryCount: 0
    })
  }

  private async processSingleSchedule(schedule: any): Promise<void> {
    try {
      // Atualizar status para SENDING
      await this.scheduleRepository.updateStatus(schedule.id, NotificationStatus.SENDING)

      const provider = NotificationProviderFactory.getProvider(schedule.channel)
      if (!provider || !provider.isConfigured()) {
        await this.scheduleRepository.updateStatus(
          schedule.id,
          NotificationStatus.FAILED,
          `Provedor ${schedule.channel} não configurado`
        )
        return
      }

      // Preparar mensagem
      const message = await this.prepareMessage(schedule.appointment, schedule.template, schedule.channel)
      
      // Enviar notificação
      const result = await provider.send(message)

      // Registrar log
      await this.logRepository.create({
        appointmentId: schedule.appointmentId,
        channel: schedule.channel,
        recipient: message.recipient,
        content: message.content,
        subject: message.subject,
        status: result.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        errorMessage: result.errorMessage,
        providerData: result.providerData
      })

      // Atualizar agendamento
      if (result.success) {
        await this.scheduleRepository.updateStatus(schedule.id, NotificationStatus.SENT)
        console.log(`✅ Notificação enviada: ${schedule.id}`)
      } else {
        const config = await this.getConfiguration()
        if (schedule.retryCount < config.retryAttempts) {
          // Reagendar para retry
          const retryTime = new Date(Date.now() + config.retryIntervalMinutes * 60 * 1000)
          await this.scheduleRepository.update(schedule.id, {
            status: NotificationStatus.PENDING,
            scheduledFor: retryTime
          })
          console.log(`🔄 Notificação reagendada para retry: ${schedule.id}`)
        } else {
          await this.scheduleRepository.updateStatus(schedule.id, NotificationStatus.FAILED, result.errorMessage)
          console.log(`❌ Notificação falhou após ${schedule.retryCount} tentativas: ${schedule.id}`)
        }
      }

    } catch (error) {
      console.error(`❌ Erro ao processar notificação ${schedule.id}:`, error)
      await this.scheduleRepository.updateStatus(
        schedule.id,
        NotificationStatus.FAILED,
        error instanceof Error ? error.message : 'Erro desconhecido'
      )
    }
  }

  private async prepareMessage(
    appointment: any,
    template: NotificationTemplate,
    channel: NotificationChannel
  ): Promise<NotificationMessage> {
    const variables = this.createTemplateVariables(appointment)
    const content = this.interpolateTemplate(template.content, variables)
    const subject = template.subject ? this.interpolateTemplate(template.subject, variables) : undefined

    // Determinar destinatário baseado no canal
    let recipient: string
    switch (channel) {
      case NotificationChannel.WHATSAPP:
        recipient = appointment.patient?.whatsapp || appointment.patient?.phone || ''
        break
      case NotificationChannel.SMS:
        recipient = appointment.patient?.phone || appointment.patient?.whatsapp || ''
        break
      case NotificationChannel.EMAIL:
        recipient = appointment.patient?.email || ''
        break
      default:
        recipient = ''
    }

    if (!recipient) {
      throw new Error(`Destinatário não encontrado para canal ${channel}`)
    }

    return {
      recipient,
      content,
      subject
    }
  }

  private createTemplateVariables(appointment: any): TemplateVariables {
    const appointmentDate = new Date(appointment.date)
    
    return {
      paciente: appointment.patient?.fullName || 'Paciente',
      profissional: appointment.partner?.fullName || 'Profissional',
      servico: appointment.productService?.name || 'Serviço',
      data: appointmentDate.toLocaleDateString('pt-BR'),
      hora: appointment.startTime || '',
      sala: appointment.room?.name,
      clinica: 'Clínica Essencial',
      endereco: 'Endereço da Clínica',
      telefone: '(11) 99999-9999'
    }
  }

  private interpolateTemplate(template: string, variables: TemplateVariables): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      const value = variables[key as keyof TemplateVariables]
      return value !== undefined ? String(value) : match
    })
  }

  private calculateReminderTime(appointmentTime: Date, amount: number, unit: 'days' | 'hours'): Date {
    const reminderTime = new Date(appointmentTime)
    
    if (unit === 'days') {
      reminderTime.setDate(reminderTime.getDate() - amount)
    } else {
      reminderTime.setHours(reminderTime.getHours() - amount)
    }
    
    return reminderTime
  }

  private getPreferredChannel(appointment: AppointmentWithRelations, config: NotificationConfiguration): NotificationChannel {
    // Lógica para determinar canal preferencial
    // Por enquanto, usar canal padrão da configuração
    
    const defaultChannel = config.defaultChannel as NotificationChannel
    
    // Verificar se o paciente tem o contato do canal padrão
    switch (defaultChannel) {
      case NotificationChannel.WHATSAPP:
        if (appointment.patient?.whatsapp) return NotificationChannel.WHATSAPP
        break
      case NotificationChannel.SMS:
        if (appointment.patient?.phone) return NotificationChannel.SMS
        break
      case NotificationChannel.EMAIL:
        if (appointment.patient?.email) return NotificationChannel.EMAIL
        break
    }

    // Fallback: tentar outros canais
    if (appointment.patient?.whatsapp && config.whatsappEnabled) return NotificationChannel.WHATSAPP
    if (appointment.patient?.phone && config.smsEnabled) return NotificationChannel.SMS
    if (appointment.patient?.email && config.emailEnabled) return NotificationChannel.EMAIL

    return defaultChannel // Retornar padrão mesmo se não tiver contato
  }

  private async isChannelEnabled(channel: NotificationChannel, config: NotificationConfiguration): Promise<boolean> {
    switch (channel) {
      case NotificationChannel.WHATSAPP:
        return config.whatsappEnabled
      case NotificationChannel.SMS:
        return config.smsEnabled
      case NotificationChannel.EMAIL:
        return config.emailEnabled
      default:
        return false
    }
  }

  private async sendNotificationForChannel(
    appointment: AppointmentWithRelations,
    type: NotificationReminderType,
    channel: NotificationChannel,
    customMessage?: string
  ): Promise<void> {
    const provider = NotificationProviderFactory.getProvider(channel)
    if (!provider || !provider.isConfigured()) {
      throw new Error(`Provedor ${channel} não configurado`)
    }

    let template: NotificationTemplate | null = null
    let content = customMessage

    if (!customMessage) {
      template = await this.templateRepository.findByTypeAndChannel(type, channel)
      if (!template) {
        throw new Error(`Template não encontrado para tipo ${type} e canal ${channel}`)
      }
      
      const variables = this.createTemplateVariables(appointment)
      content = this.interpolateTemplate(template.content, variables)
    }

    const message = await this.prepareMessage(appointment, template || { content, subject: undefined } as any, channel)
    const result = await provider.send(message)

    // Registrar log
    await this.logRepository.create({
      appointmentId: appointment.id,
      channel,
      recipient: message.recipient,
      content: message.content,
      subject: message.subject,
      status: result.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
      errorMessage: result.errorMessage,
      providerData: result.providerData
    })

    if (!result.success) {
      throw new Error(result.errorMessage || 'Falha ao enviar notificação')
    }
  }

  // 🔧 CONFIGURAÇÃO

  async getConfiguration(): Promise<NotificationConfiguration> {
    let config = await this.configRepository.findFirst()
    
    if (!config) {
      // Criar configuração padrão
      config = await this.configRepository.create({
        enabled: true,
        defaultChannel: 'whatsapp',
        firstReminderDays: 3,
        secondReminderDays: 1,
        thirdReminderHours: 2,
        whatsappEnabled: true,
        smsEnabled: true,
        emailEnabled: true,
        retryAttempts: 3,
        retryIntervalMinutes: 30
      })
    }
    
    return config
  }

  async updateConfiguration(data: Partial<NotificationConfiguration>): Promise<NotificationConfiguration> {
    const config = await this.getConfiguration()
    return await this.configRepository.update(config.id, data)
  }

  // 📊 RELATÓRIOS

  async getNotificationStats(appointmentId?: string, dateFrom?: Date, dateTo?: Date): Promise<{
    total: number
    sent: number
    failed: number
    pending: number
    byChannel: Record<string, number>
  }> {
    const { logs } = await this.logRepository.findAll({
      appointmentId,
      dateFrom,
      dateTo,
      limit: 1000
    })

    const stats = {
      total: logs.length,
      sent: 0,
      failed: 0,
      pending: 0,
      byChannel: {} as Record<string, number>
    }

    logs.forEach(log => {
      if (log.status === NotificationStatus.SENT || log.status === NotificationStatus.DELIVERED) {
        stats.sent++
      } else if (log.status === NotificationStatus.FAILED) {
        stats.failed++
      } else {
        stats.pending++
      }

      stats.byChannel[log.channel] = (stats.byChannel[log.channel] || 0) + 1
    })

    return stats
  }
}
