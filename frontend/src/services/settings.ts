import { apiClient } from './api'

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

export interface ValidationResult {
  valid: boolean
  reason?: string
}

class SettingsService {
  async getClinicSettings(): Promise<ClinicSettings> {
    const response = await apiClient.get('/clinic-settings')
    return response.data
  }

  async updateClinicSettings(settings: Partial<ClinicSettings>): Promise<ClinicSettings> {
    const response = await apiClient.put('/clinic-settings', settings)
    return response.data
  }

  async validateBusinessHours(date: string, startTime: string, endTime: string): Promise<ValidationResult> {
    const response = await apiClient.post('/clinic-settings/validate-hours', {
      date,
      startTime,
      endTime
    })
    return response.data
  }

  async validateAppointmentMovement(status: string): Promise<ValidationResult> {
    const response = await apiClient.post('/clinic-settings/validate-movement', {
      status
    })
    return response.data
  }

  // Utilitários para trabalhar com horários
  getDayName(dayOfWeek: number): string {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return days[dayOfWeek] || 'Inválido'
  }

  getDayShortName(dayOfWeek: number): string {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    return days[dayOfWeek] || 'Inv'
  }

  formatTime(time: string): string {
    if (!time || !time.includes(':')) return time
    const [hours, minutes] = time.split(':')
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
  }

  isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    const timeToMinutes = (t: string) => {
      const [hours, minutes] = t.split(':').map(Number)
      return hours * 60 + minutes
    }

    const timeMinutes = timeToMinutes(time)
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = timeToMinutes(endTime)

    return timeMinutes >= startMinutes && timeMinutes <= endMinutes
  }

  getDefaultHours(): ClinicHours[] {
    return [
      { dayOfWeek: 0, isOpen: false }, // Domingo
      { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '18:00', lunchBreakStart: '12:00', lunchBreakEnd: '13:00' }, // Segunda
      { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '18:00', lunchBreakStart: '12:00', lunchBreakEnd: '13:00' }, // Terça
      { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '18:00', lunchBreakStart: '12:00', lunchBreakEnd: '13:00' }, // Quarta
      { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '18:00', lunchBreakStart: '12:00', lunchBreakEnd: '13:00' }, // Quinta
      { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '17:00', lunchBreakStart: '12:00', lunchBreakEnd: '13:00' }, // Sexta
      { dayOfWeek: 6, isOpen: false }, // Sábado
    ]
  }
}

export const settingsService = new SettingsService()

