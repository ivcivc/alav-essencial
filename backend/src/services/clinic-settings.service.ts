import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface ClinicHours {
  dayOfWeek: number // 0 = domingo, 1 = segunda, ..., 6 = sábado
  isOpen: boolean
  openTime?: string // HH:MM
  closeTime?: string // HH:MM
  lunchBreakStart?: string // HH:MM
  lunchBreakEnd?: string // HH:MM
}

export interface ClinicSettings {
  id: string
  name: string
  hours: ClinicHours[]
  allowWeekendBookings: boolean
  advanceBookingDays: number // Quantos dias de antecedência
  minBookingHours: number // Mínimo de horas de antecedência
  maxBookingDays: number // Máximo de dias para agendamento
  allowCancelledMovement: boolean
  allowCompletedMovement: boolean
  createdAt: Date
  updatedAt: Date
}

class ClinicSettingsService {
  
  /**
   * Buscar configurações da clínica
   */
  async getSettings(): Promise<ClinicSettings> {
    try {
      // Buscar configurações no banco
      let settings = await prisma.clinicSettings.findFirst()

      if (!settings) {
        // Criar configurações padrão se não existir
        return this.createDefaultSettings()
      }

      return {
        ...settings,
        hours: settings.hours as ClinicHours[]
      }
    } catch (error) {
      console.error('Erro ao buscar configurações da clínica:', error)
      return this.createDefaultSettings()
    }
  }

  /**
   * Atualizar configurações da clínica
   */
  async updateSettings(settings: Partial<ClinicSettings>): Promise<ClinicSettings> {
    try {
      // Verificar se já existe configuração
      const existingSettings = await prisma.clinicSettings.findFirst()
      
      let updatedSettings
      
      if (existingSettings) {
        // Atualizar configurações existentes
        updatedSettings = await prisma.clinicSettings.update({
          where: { id: existingSettings.id },
          data: {
            name: settings.name,
            hours: settings.hours as any,
            allowWeekendBookings: settings.allowWeekendBookings,
            advanceBookingDays: settings.advanceBookingDays,
            minBookingHours: settings.minBookingHours,
            maxBookingDays: settings.maxBookingDays,
            allowCancelledMovement: settings.allowCancelledMovement,
            allowCompletedMovement: settings.allowCompletedMovement,
          }
        })
      } else {
        // Criar novas configurações
        const defaultSettings = this.createDefaultSettings()
        updatedSettings = await prisma.clinicSettings.create({
          data: {
            name: settings.name || defaultSettings.name,
            hours: (settings.hours || defaultSettings.hours) as any,
            allowWeekendBookings: settings.allowWeekendBookings ?? defaultSettings.allowWeekendBookings,
            advanceBookingDays: settings.advanceBookingDays ?? defaultSettings.advanceBookingDays,
            minBookingHours: settings.minBookingHours ?? defaultSettings.minBookingHours,
            maxBookingDays: settings.maxBookingDays ?? defaultSettings.maxBookingDays,
            allowCancelledMovement: settings.allowCancelledMovement ?? defaultSettings.allowCancelledMovement,
            allowCompletedMovement: settings.allowCompletedMovement ?? defaultSettings.allowCompletedMovement,
          }
        })
      }

      console.log('🏥 Configurações da clínica atualizadas:', updatedSettings)
      
      return {
        ...updatedSettings,
        hours: updatedSettings.hours as ClinicHours[]
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      throw error
    }
  }

  /**
   * Validar se um horário está dentro do funcionamento da clínica
   */
  async validateBusinessHours(date: Date, startTime: string, endTime: string): Promise<{
    valid: boolean
    reason?: string
  }> {
    try {
      const settings = await this.getSettings()
      const dayOfWeek = date.getDay()
      
      // Buscar horário do dia da semana
      const dayHours = settings.hours.find(h => h.dayOfWeek === dayOfWeek)
      
      if (!dayHours || !dayHours.isOpen) {
        return {
          valid: false,
          reason: 'Clínica fechada neste dia da semana'
        }
      }

      // Validar horário de funcionamento
      if (dayHours.openTime && startTime < dayHours.openTime) {
        return {
          valid: false,
          reason: `Clínica abre às ${dayHours.openTime}`
        }
      }

      if (dayHours.closeTime && endTime > dayHours.closeTime) {
        return {
          valid: false,
          reason: `Clínica fecha às ${dayHours.closeTime}`
        }
      }

      // Validar intervalo de almoço
      if (dayHours.lunchBreakStart && dayHours.lunchBreakEnd) {
        const lunchStart = dayHours.lunchBreakStart
        const lunchEnd = dayHours.lunchBreakEnd
        
        // Verificar se o agendamento não conflita com o almoço
        if ((startTime >= lunchStart && startTime < lunchEnd) || 
            (endTime > lunchStart && endTime <= lunchEnd) ||
            (startTime < lunchStart && endTime > lunchEnd)) {
          return {
            valid: false,
            reason: `Horário de almoço: ${lunchStart} às ${lunchEnd}`
          }
        }
      }

      return { valid: true }
    } catch (error) {
      console.error('Erro ao validar horário:', error)
      return {
        valid: false,
        reason: 'Erro interno na validação'
      }
    }
  }

  /**
   * Validar antecedência mínima/máxima para agendamento
   */
  async validateBookingAdvance(appointmentDate: Date): Promise<{
    valid: boolean
    reason?: string
  }> {
    try {
      const settings = await this.getSettings()
      const now = new Date()
      const diffHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      const diffDays = diffHours / 24

      // Validar antecedência mínima
      if (diffHours < settings.minBookingHours) {
        return {
          valid: false,
          reason: `Agendamento deve ser feito com pelo menos ${settings.minBookingHours} horas de antecedência`
        }
      }

      // Validar antecedência máxima
      if (diffDays > settings.maxBookingDays) {
        return {
          valid: false,
          reason: `Agendamento não pode ser feito com mais de ${settings.maxBookingDays} dias de antecedência`
        }
      }

      // Validar fins de semana se não permitido
      if (!settings.allowWeekendBookings) {
        const dayOfWeek = appointmentDate.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          return {
            valid: false,
            reason: 'Agendamentos não permitidos em fins de semana'
          }
        }
      }

      return { valid: true }
    } catch (error) {
      console.error('Erro ao validar antecedência:', error)
      return {
        valid: false,
        reason: 'Erro interno na validação'
      }
    }
  }

  /**
   * Validar se um agendamento pode ser movimentado
   */
  async validateAppointmentMovement(status: string): Promise<{
    valid: boolean
    reason?: string
  }> {
    try {
      const settings = await this.getSettings()

      switch (status) {
        case 'CANCELLED':
          if (!settings.allowCancelledMovement) {
            return {
              valid: false,
              reason: 'Movimentação de agendamentos cancelados não permitida'
            }
          }
          break

        case 'COMPLETED':
          if (!settings.allowCompletedMovement) {
            return {
              valid: false,
              reason: 'Movimentação de agendamentos concluídos não permitida'
            }
          }
          break

        default:
          // SCHEDULED, IN_PROGRESS podem ser movimentados
          break
      }

      return { valid: true }
    } catch (error) {
      console.error('Erro ao validar movimentação:', error)
      return {
        valid: false,
        reason: 'Erro interno na validação'
      }
    }
  }

  /**
   * Criar configurações padrão
   */
  private createDefaultSettings(): ClinicSettings {
    const defaultHours: ClinicHours[] = [
      { dayOfWeek: 0, isOpen: false }, // Domingo
      { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '18:00', lunchBreakStart: '12:00', lunchBreakEnd: '13:00' }, // Segunda
      { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '18:00', lunchBreakStart: '12:00', lunchBreakEnd: '13:00' }, // Terça
      { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '18:00', lunchBreakStart: '12:00', lunchBreakEnd: '13:00' }, // Quarta
      { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '18:00', lunchBreakStart: '12:00', lunchBreakEnd: '13:00' }, // Quinta
      { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '17:00', lunchBreakStart: '12:00', lunchBreakEnd: '13:00' }, // Sexta
      { dayOfWeek: 6, isOpen: false }, // Sábado
    ]

    return {
      id: 'default',
      name: 'Clínica Essencial',
      hours: defaultHours,
      allowWeekendBookings: false,
      advanceBookingDays: 30,
      minBookingHours: 2,
      maxBookingDays: 60,
      allowCancelledMovement: false,
      allowCompletedMovement: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}

export const clinicSettingsService = new ClinicSettingsService()
export { ClinicSettingsService }
