import { 
  Appointment, 
  AppointmentWithRelations, 
  CreateAppointmentData, 
  UpdateAppointmentData,
  AppointmentFilters,
  AppointmentListResponse 
} from '../types/entities'

export interface ConflictDetail {
  type: 'appointment' | 'availability' | 'blocked' | 'break'
  message: string
  appointment?: AppointmentWithRelations
  timeSlot?: {
    startTime: string
    endTime: string
  }
}

const API_BASE_URL = ''

export const appointmentsService = {
  // Buscar agendamentos com filtros
  async getAppointments(filters: AppointmentFilters = {}): Promise<AppointmentListResponse> {
    const searchParams = new URLSearchParams()
    
    if (filters.page) searchParams.append('page', filters.page.toString())
    if (filters.limit) searchParams.append('limit', filters.limit.toString())
    if (filters.patientId) searchParams.append('patientId', filters.patientId)
    if (filters.partnerId) searchParams.append('partnerId', filters.partnerId)
    if (filters.roomId) searchParams.append('roomId', filters.roomId)
    if (filters.productServiceId) searchParams.append('productServiceId', filters.productServiceId)
    if (filters.status) searchParams.append('status', filters.status)
    if (filters.type) searchParams.append('type', filters.type)
    if (filters.date) searchParams.append('date', filters.date)
    if (filters.startDate) searchParams.append('startDate', filters.startDate)
    if (filters.endDate) searchParams.append('endDate', filters.endDate)

    const response = await fetch(`${API_BASE_URL}/api/appointments?${searchParams}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao buscar agendamentos')
    }

    const data = await response.json()
    return data.data
  },

  // Buscar agendamentos por período de datas
  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<AppointmentWithRelations[]> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/date-range?startDate=${startDate}&endDate=${endDate}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao buscar agendamentos por período')
    }

    const data = await response.json()
    return data.data
  },

  // Buscar agendamento por ID
  async getAppointmentById(id: string): Promise<AppointmentWithRelations> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao buscar agendamento')
    }

    const data = await response.json()
    return data.data
  },

  // Criar novo agendamento
  async createAppointment(appointmentData: CreateAppointmentData): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao criar agendamento')
    }

    const data = await response.json()
    return data.data
  },

  // Atualizar agendamento
  async updateAppointment(id: string, appointmentData: UpdateAppointmentData): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao atualizar agendamento')
    }

    const data = await response.json()
    return data.data
  },

  // Deletar agendamento
  async deleteAppointment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao deletar agendamento')
    }
  },

  // Cancelar agendamento
  async cancelAppointment(id: string, cancellationReason: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: cancellationReason }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao cancelar agendamento')
    }

    const data = await response.json()
    return data.data
  },

  // Cancelar checkout (apenas lançamentos financeiros)
  async cancelCheckout(id: string, reason: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/cancel-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao cancelar checkout')
    }

    const data = await response.json()
    return data.data
  },

  // Reagendar agendamento
  async rescheduleAppointment(id: string, newDate: string, newStartTime: string, newEndTime: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/reschedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newDate,
        newStartTime,
        newEndTime
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao reagendar agendamento')
    }

    const data = await response.json()
    return data.data
  },

  // Check-in do agendamento
  async checkInAppointment(id: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/checkin`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao fazer check-in')
    }

    const data = await response.json()
    return data.data
  },

  // Check-out do agendamento
  async checkOutAppointment(id: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/checkout`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao fazer check-out')
    }

    const data = await response.json()
    return data.data
  },

  // Desfazer check-in
  async undoCheckInAppointment(id: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/undo-checkin`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao desfazer check-in')
    }

    const data = await response.json()
    return data.data
  },

  // Desfazer check-out
  async undoCheckOutAppointment(id: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/undo-checkout`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao desfazer check-out')
    }

    const data = await response.json()
    return data.data
  },

  // Check-out com processamento financeiro
  async checkOutAppointmentWithPayment(
    id: string, 
    paymentData: {
      paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_TRANSFER'
      bankAccountId: string
      totalAmount: number
      discountAmount?: number
      additionalCharges?: number
      notes?: string
    }
  ): Promise<{
    appointment: Appointment
    financialResult: any
  }> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/checkout-with-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao processar checkout financeiro')
    }

    const data = await response.json()
    return data.data
  },

  // Buscar dados financeiros de um agendamento
  async getAppointmentFinancials(id: string): Promise<{
    revenue: any[]
    commissions: any[]
    total: {
      revenue: number
      commissions: number
    }
  }> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/financials`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao buscar dados financeiros')
    }

    const data = await response.json()
    return data.data
  },

  // Verificar disponibilidade
  async checkAvailability(partnerId: string, date: string, startTime: string, endTime: string, excludeAppointmentId?: string): Promise<{ available: boolean; conflicts: ConflictDetail[] }> {
    const requestBody: any = {
      partnerId,
      date,
      startTime,
      endTime
    }

    if (excludeAppointmentId) {
      requestBody.excludeAppointmentId = excludeAppointmentId
    }

    const response = await fetch(`${API_BASE_URL}/api/appointments/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erro ao verificar disponibilidade')
    }

    const data = await response.json()
    return data.data
  }
}
