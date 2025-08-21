import { Appointment, PrismaClient } from '@prisma/client'
import { AppointmentRepository, AppointmentFilters } from '../repositories/appointment.repository'
import { PartnerRepository } from '../repositories/partner.repository'
import { PatientRepository } from '../repositories/patient.repository'
import { RoomRepository } from '../repositories/room.repository'
import { ProductServiceRepository } from '../repositories/product-service.repository'
import { Appointment as AppointmentEntity, AppointmentWithRelations } from '../types/entities'
import { AppointmentStatus, AppointmentType, NotificationReminderType } from '../types/shared'
import { convertPrismaAppointments, convertPrismaAppointment, convertPrismaProductService } from '../utils/typeConverters'
import { NotificationService } from './notification.service'
import { appointmentFinancialService, type CheckoutFinancialData } from './appointment-financial.service'
import { clinicSettingsService } from './clinic-settings.service'

const prisma = new PrismaClient()

export interface CreateAppointmentData {
  patientId: string
  partnerId: string
  productServiceId: string
  roomId?: string
  date: Date
  startTime: string
  endTime: string
  type: AppointmentType
  isEncaixe?: boolean
  observations?: string
}

export interface UpdateAppointmentData extends Partial<Omit<CreateAppointmentData, 'patientId'>> {
  status?: AppointmentStatus
  cancellationReason?: string
}

export interface AppointmentListResponse {
  appointments: AppointmentEntity[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AvailabilityCheckData {
  partnerId: string
  roomId?: string
  date: Date
  startTime: string
  endTime: string
  excludeAppointmentId?: string
}

export interface ConflictDetail {
  type: 'appointment' | 'availability' | 'blocked' | 'break'
  message: string
  appointment?: Appointment
  timeSlot?: {
    startTime: string
    endTime: string
  }
}

export interface AvailabilityResult {
  available: boolean
  conflicts: ConflictDetail[]
  suggestedTimes?: string[]
}

export interface RescheduleData {
  appointmentId: string
  newDate: Date
  newStartTime: string
  newEndTime: string
  newRoomId?: string
  reason?: string
}

export class AppointmentService {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private partnerRepository: PartnerRepository,
    private patientRepository: PatientRepository,
    private roomRepository: RoomRepository,
    private productServiceRepository: ProductServiceRepository,
    private notificationService?: NotificationService
  ) {}

  async getAllAppointments(filters: AppointmentFilters = {}): Promise<AppointmentListResponse> {
    const { page = 1, limit = 50 } = filters
    
    const [appointments, total] = await Promise.all([
      this.appointmentRepository.findAll(filters),
      this.appointmentRepository.count(filters)
    ])

    return {
      appointments: convertPrismaAppointments(appointments),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getAppointmentById(id: string): Promise<AppointmentWithRelations> {
    const appointment = await this.appointmentRepository.findById(id)
    
    if (!appointment) {
      throw new Error('Agendamento não encontrado')
    }

    // Convert the main appointment data and relations
    const convertedAppointment = convertPrismaAppointment(appointment)
    return {
      ...convertedAppointment,
      patient: appointment.patient,
      partner: appointment.partner,
      productService: appointment.productService ? convertPrismaProductService(appointment.productService) : undefined,
      room: appointment.room
    } as AppointmentWithRelations
  }

  async createAppointment(data: CreateAppointmentData): Promise<AppointmentEntity> {
    // Validate that all referenced entities exist
    await this.validateAppointmentEntities(data)

    // 🏥 VALIDAR REGRAS DE NEGÓCIO DA CLÍNICA
    await this.validateBusinessRules(data)

    // Check for conflicts
    const availabilityResult = await this.checkAvailability({
      partnerId: data.partnerId,
      roomId: data.roomId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      isEncaixe: data.isEncaixe
    })

    if (!availabilityResult.available) {
      const conflictMessages = availabilityResult.conflicts.map(c => c.message).join('; ')
      throw new Error(`Conflito de horário: ${conflictMessages}`)
    }

    // Calculate end time based on service duration if not provided
    if (!data.endTime) {
      const service = await this.productServiceRepository.findById(data.productServiceId)
      if (service?.durationMinutes) {
        data.endTime = this.addMinutesToTime(data.startTime, service.durationMinutes)
      }
    }

    const createdAppointment = await this.appointmentRepository.create({
      ...data,
      status: 'SCHEDULED',
      isEncaixe: data.isEncaixe || false
    })

    // 🔔 Agendar lembretes de notificação
    if (this.notificationService) {
      try {
        const appointmentWithRelations = await this.getAppointmentById(createdAppointment.id)
        await this.notificationService.scheduleReminders(appointmentWithRelations)
        console.log(`✅ Lembretes agendados para novo agendamento ${createdAppointment.id}`)
      } catch (error) {
        console.warn(`⚠️ Falha ao agendar lembretes para agendamento ${createdAppointment.id}:`, error)
        // Não falhar a criação do agendamento por causa de erro nas notificações
      }
    }

    return convertPrismaAppointment(createdAppointment)
  }

  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<AppointmentEntity> {
    // Check if appointment exists
    const existingAppointment = await this.appointmentRepository.findById(id)
    if (!existingAppointment) {
      throw new Error('Agendamento não encontrado')
    }

    // 🔄 VALIDAR REGRAS DE MOVIMENTAÇÃO
    await this.validateAppointmentMovement(id, data)

    // If changing date/time/partner/room, check for conflicts
    if (data.date || data.startTime || data.endTime || data.partnerId || data.roomId !== undefined) {
      const checkData: AvailabilityCheckData = {
        partnerId: data.partnerId || existingAppointment.partnerId,
        roomId: data.roomId !== undefined ? data.roomId : existingAppointment.roomId,
        date: data.date || existingAppointment.date,
        startTime: data.startTime || existingAppointment.startTime,
        endTime: data.endTime || existingAppointment.endTime,
        excludeAppointmentId: id
      }

      const availabilityResult = await this.checkAvailability(checkData)
      if (!availabilityResult.available) {
        const conflictMessages = availabilityResult.conflicts.map(c => c.message).join('; ')
      throw new Error(`Conflito de horário: ${conflictMessages}`)
      }
    }

    // Validate entities if they are being changed
    if (data.patientId || data.partnerId || data.productServiceId || data.roomId !== undefined) {
      await this.validateAppointmentEntities({
        patientId: data.patientId || existingAppointment.patientId,
        partnerId: data.partnerId || existingAppointment.partnerId,
        productServiceId: data.productServiceId || existingAppointment.productServiceId,
        roomId: data.roomId !== undefined ? data.roomId : existingAppointment.roomId,
        date: data.date || existingAppointment.date,
        startTime: data.startTime || existingAppointment.startTime,
        endTime: data.endTime || existingAppointment.endTime,
        type: data.type || existingAppointment.type
      })
    }

    const updatedAppointment = await this.appointmentRepository.update(id, data)

    // 🔔 Reagendar lembretes se data/hora mudaram
    if (this.notificationService && (data.date || data.startTime || data.endTime)) {
      try {
        const appointmentWithRelations = await this.getAppointmentById(id)
        await this.notificationService.rescheduleReminders(appointmentWithRelations)
        console.log(`✅ Lembretes reagendados para agendamento ${id}`)
      } catch (error) {
        console.warn(`⚠️ Falha ao reagendar lembretes para agendamento ${id}:`, error)
      }
    }

    return convertPrismaAppointment(updatedAppointment)
  }

  async deleteAppointment(id: string): Promise<void> {
    // Check if appointment exists
    const existingAppointment = await this.appointmentRepository.findById(id)
    if (!existingAppointment) {
      throw new Error('Agendamento não encontrado')
    }

    // Only allow deletion of scheduled appointments
    if (existingAppointment.status !== 'SCHEDULED') {
      throw new Error('Apenas agendamentos com status "AGENDADO" podem ser excluídos')
    }

    await this.appointmentRepository.delete(id)

    // 🔔 Cancelar lembretes
    if (this.notificationService) {
      try {
        await this.notificationService.cancelReminders(id)
        console.log(`✅ Lembretes cancelados para agendamento excluído ${id}`)
      } catch (error) {
        console.warn(`⚠️ Falha ao cancelar lembretes para agendamento ${id}:`, error)
      }
    }
  }

  async cancelAppointment(id: string, reason: string): Promise<AppointmentEntity> {
    // Check if appointment exists
    const existingAppointment = await this.appointmentRepository.findById(id)
    if (!existingAppointment) {
      throw new Error('Agendamento não encontrado')
    }

    // Only allow cancellation of scheduled or in-progress appointments
    if (!['SCHEDULED', 'IN_PROGRESS'].includes(existingAppointment.status)) {
      throw new Error('Apenas agendamentos "AGENDADOS" ou "EM ANDAMENTO" podem ser cancelados')
    }

    // Verificar se há lançamentos financeiros que impedem o cancelamento
    const criticalFinancialEntries = await prisma.financialEntry.count({
      where: {
        OR: [
          { referenceId: id, referenceType: 'APPOINTMENT' },
          { appointmentId: id }
        ],
        status: 'PAID',
        // Verificar se foi pago há mais de 24 horas (regra de negócio opcional)
        paidDate: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })

    if (criticalFinancialEntries > 0) {
      console.log(`⚠️ Agendamento ${id} tem ${criticalFinancialEntries} lançamentos pagos há mais de 24h`)
      // Opcional: Permitir cancelamento mesmo assim, mas com aviso nos logs
    }

    const cancelledAppointment = await this.appointmentRepository.cancel(id, reason)

    // 💰 Cancelar lançamentos financeiros relacionados ao agendamento
    try {
      console.log(`🔍 Iniciando cancelamento de lançamentos financeiros para agendamento ${id}`)
      const result = await appointmentFinancialService.cancelFinancialEntries(id, reason)
      console.log(`💰 Cancelamento concluído: ${result.cancelledEntries} lançamentos cancelados, R$ ${result.totalAmount} total`)
    } catch (error) {
      console.error(`❌ ERRO ao cancelar lançamentos financeiros para agendamento ${id}:`, error)
    }

    // 🔔 Cancelar lembretes e enviar notificação de cancelamento
    if (this.notificationService) {
      try {
        await this.notificationService.cancelReminders(id)
        
        // Enviar notificação imediata de cancelamento
        const appointmentWithRelations = await this.getAppointmentById(id)
        await this.notificationService.sendImmediateNotification(
          appointmentWithRelations,
          NotificationReminderType.IMMEDIATE,
          `Seu agendamento para ${appointmentWithRelations.productService?.name} foi cancelado. Motivo: ${reason}`
        )
        console.log(`✅ Notificação de cancelamento enviada para agendamento ${id}`)
      } catch (error) {
        console.warn(`⚠️ Falha ao processar notificações de cancelamento para agendamento ${id}:`, error)
      }
    }

    return convertPrismaAppointment(cancelledAppointment)
  }

  async rescheduleAppointment(data: RescheduleData): Promise<AppointmentEntity> {
    const { appointmentId, newDate, newStartTime, newEndTime, newRoomId, reason } = data

    // Check if appointment exists
    const existingAppointment = await this.appointmentRepository.findById(appointmentId)
    if (!existingAppointment) {
      throw new Error('Agendamento não encontrado')
    }

    // Only allow rescheduling of scheduled appointments
    if (existingAppointment.status !== 'SCHEDULED') {
      throw new Error('Apenas agendamentos "AGENDADOS" podem ser reagendados')
    }

    // Check availability for new time slot
    const availabilityResult = await this.checkAvailability({
      partnerId: existingAppointment.partnerId,
      roomId: newRoomId !== undefined ? newRoomId : existingAppointment.roomId,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      excludeAppointmentId: appointmentId
    })

    if (!availabilityResult.available) {
      const conflictMessages = availabilityResult.conflicts.map(c => c.message).join('; ')
      throw new Error(`Conflito de horário: ${conflictMessages}`)
    }

    // Update appointment with new date/time
    const rescheduledAppointment = await this.appointmentRepository.update(appointmentId, {
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      roomId: newRoomId !== undefined ? newRoomId : existingAppointment.roomId,
      observations: reason ? `${existingAppointment.observations || ''}\nReagendado: ${reason}`.trim() : existingAppointment.observations
    })

    // 🔔 Reagendar lembretes e enviar notificação de reagendamento
    if (this.notificationService) {
      try {
        const appointmentWithRelations = await this.getAppointmentById(appointmentId)
        await this.notificationService.rescheduleReminders(appointmentWithRelations)
        
        // Enviar notificação imediata de reagendamento
        const newDateTime = new Date(newDate).toLocaleDateString('pt-BR')
        await this.notificationService.sendImmediateNotification(
          appointmentWithRelations,
          NotificationReminderType.IMMEDIATE,
          `Seu agendamento foi reagendado para ${newDateTime} às ${newStartTime}. ${reason ? `Motivo: ${reason}` : ''}`
        )
        console.log(`✅ Notificação de reagendamento enviada para agendamento ${appointmentId}`)
      } catch (error) {
        console.warn(`⚠️ Falha ao processar notificações de reagendamento para agendamento ${appointmentId}:`, error)
      }
    }

    return convertPrismaAppointment(rescheduledAppointment)
  }

  async checkInAppointment(id: string): Promise<AppointmentEntity> {
    // Check if appointment exists
    const existingAppointment = await this.appointmentRepository.findById(id)
    if (!existingAppointment) {
      throw new Error('Agendamento não encontrado')
    }

    // Only allow check-in for scheduled appointments
    if (existingAppointment.status !== 'SCHEDULED') {
      throw new Error('Apenas agendamentos "AGENDADOS" podem fazer check-in')
    }

    const checkedInAppointment = await this.appointmentRepository.checkIn(id)
    return convertPrismaAppointment(checkedInAppointment)
  }

  async checkOutAppointment(id: string): Promise<AppointmentEntity> {
    // Check if appointment exists
    const existingAppointment = await this.appointmentRepository.findById(id)
    if (!existingAppointment) {
      throw new Error('Agendamento não encontrado')
    }

    // Only allow check-out for in-progress appointments
    if (existingAppointment.status !== 'IN_PROGRESS') {
      throw new Error('Apenas agendamentos "EM ANDAMENTO" podem fazer check-out')
    }

    const checkedOutAppointment = await this.appointmentRepository.checkOut(id)
    return convertPrismaAppointment(checkedOutAppointment)
  }

  /**
   * Checkout com processamento financeiro automático
   * Gera lançamentos de receita e comissões automaticamente
   */
  async checkOutAppointmentWithFinancials(
    id: string, 
    financialData: CheckoutFinancialData
  ): Promise<{
    appointment: AppointmentEntity
    financialResult: any
  }> {
    // Primeiro fazer o checkout normal
    const appointment = await this.checkOutAppointment(id)

    // Processar automações financeiras
    const financialResult = await appointmentFinancialService.processCheckoutFinancials(
      id, 
      financialData
    )

    console.log(`💰 Checkout financeiro processado para agendamento ${id}`)
    console.log(`📊 Receita: R$ ${financialResult.totalProcessed}`)
    console.log(`🤝 Comissão: R$ ${financialResult.commissionCalculation.commissionAmount}`)

    return {
      appointment,
      financialResult
    }
  }

  /**
   * Cancela apenas o checkout financeiro do agendamento (sem cancelar o agendamento)
   */
  async cancelCheckoutFinancials(
    id: string, 
    reason: string
  ): Promise<{
    appointment: AppointmentEntity
    cancelResult: any
  }> {
    // Verificar se o agendamento existe
    const existingAppointment = await this.appointmentRepository.findById(id)
    if (!existingAppointment) {
      throw new Error('Agendamento não encontrado')
    }

    // Verificar se o agendamento está COMPLETED (tem checkout)
    if (existingAppointment.status !== 'COMPLETED') {
      throw new Error('Apenas agendamentos concluídos podem ter o checkout cancelado')
    }

    // Cancelar lançamentos financeiros
    const cancelResult = await appointmentFinancialService.cancelCheckoutFinancials(id, reason)

    // Retornar agendamento para IN_PROGRESS (antes do checkout)
    const updatedAppointment = await this.appointmentRepository.update(id, {
      status: AppointmentStatus.IN_PROGRESS,
      checkOut: null
    })

    console.log(`🔄 Checkout cancelado para agendamento ${id}: ${cancelResult.cancelledEntries} lançamentos, R$ ${cancelResult.totalAmount}`)

    return {
      appointment: convertPrismaAppointment(updatedAppointment),
      cancelResult
    }
  }

  async undoCheckIn(id: string): Promise<AppointmentEntity> {
    // Check if appointment exists
    const existingAppointment = await this.appointmentRepository.findById(id)
    if (!existingAppointment) {
      throw new Error('Agendamento não encontrado')
    }

    // Only allow undo check-in for in-progress appointments that have check-in
    if (existingAppointment.status !== 'IN_PROGRESS') {
      throw new Error('Apenas agendamentos "EM ANDAMENTO" podem ter o check-in desfeito')
    }

    if (!existingAppointment.checkIn) {
      throw new Error('Este agendamento não possui check-in para desfazer')
    }

    // Update appointment back to SCHEDULED status and clear check-in
    const updatedAppointment = await this.appointmentRepository.update(id, {
      status: 'SCHEDULED',
      checkIn: null
    })

    return convertPrismaAppointment(updatedAppointment)
  }

  async undoCheckOut(id: string): Promise<AppointmentEntity> {
    // Check if appointment exists
    const existingAppointment = await this.appointmentRepository.findById(id)
    if (!existingAppointment) {
      throw new Error('Agendamento não encontrado')
    }

    // Only allow undo check-out for completed appointments that have check-out
    if (existingAppointment.status !== 'COMPLETED') {
      throw new Error('Apenas agendamentos "CONCLUÍDOS" podem ter o check-out desfeito')
    }

    if (!existingAppointment.checkOut) {
      throw new Error('Este agendamento não possui check-out para desfazer')
    }

    // Update appointment back to IN_PROGRESS status and clear check-out
    const updatedAppointment = await this.appointmentRepository.update(id, {
      status: 'IN_PROGRESS',
      checkOut: null
    })

    return convertPrismaAppointment(updatedAppointment)
  }

  async checkAvailability(data: AvailabilityCheckData & { isEncaixe?: boolean }): Promise<AvailabilityResult> {
    const conflicts: ConflictDetail[] = []
    
    // Mapeamento dos dias da semana em português
    const daysOfWeek = [
      'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 
      'quinta-feira', 'sexta-feira', 'sábado'
    ]

    // 🚀 ENCAIXE: Se for encaixe, pular verificação de conflitos de horário
    if (!data.isEncaixe) {
      // Find conflicting appointments
      const conflictingAppointments = await this.appointmentRepository.findConflicts(
        data.partnerId,
        data.roomId,
        data.date,
        data.startTime,
        data.endTime,
        data.excludeAppointmentId
      )

      // Check partner conflicts
      const partnerConflicts = conflictingAppointments.filter(apt => apt.partnerId === data.partnerId)
      if (partnerConflicts.length > 0) {
        for (const conflictApt of partnerConflicts) {
          conflicts.push({
            type: 'appointment',
            message: `Parceiro já possui agendamento das ${conflictApt.startTime} às ${conflictApt.endTime}`,
            appointment: conflictApt,
            timeSlot: {
              startTime: conflictApt.startTime,
              endTime: conflictApt.endTime
            }
          })
        }
      }

      // Check room conflicts (if room is specified)
      if (data.roomId) {
        const roomConflicts = conflictingAppointments.filter(apt => apt.roomId === data.roomId)
        if (roomConflicts.length > 0) {
          for (const conflictApt of roomConflicts) {
            conflicts.push({
              type: 'appointment',
              message: `Sala já ocupada das ${conflictApt.startTime} às ${conflictApt.endTime}`,
              appointment: conflictApt,
              timeSlot: {
                startTime: conflictApt.startTime,
                endTime: conflictApt.endTime
              }
            })
          }
        }
      }
    } else {
      // Log para debug quando for encaixe
      console.log(`📌 ENCAIXE permitido: ${data.partnerId} no horário ${data.startTime}-${data.endTime}`)
    }

    // Check partner availability (working hours and blocked dates)
    const partner = await this.partnerRepository.findById(data.partnerId)
    if (!partner) {
      conflicts.push({
        type: 'availability',
        message: 'Parceiro não encontrado no sistema'
      })
      return { available: false, conflicts }
    }

    // Check if partner works on this day of week
    const dayOfWeek = data.date.getDay()
    const dayName = daysOfWeek[dayOfWeek]
    const availability = partner.availability?.find(av => av.dayOfWeek === dayOfWeek && av.active)
    
    if (!availability) {
      // Mostrar quais dias o parceiro trabalha
      const workingDays = partner.availability
        ?.filter(av => av.active)
        .map(av => daysOfWeek[av.dayOfWeek])
        .join(', ') || 'nenhum dia configurado'
      
      conflicts.push({
        type: 'availability',
        message: `${partner.fullName} não trabalha ${dayName}. Dias disponíveis: ${workingDays}`
      })
    } else {
      // Check working hours
      if (data.startTime < availability.startTime || data.endTime > availability.endTime) {
        conflicts.push({
          type: 'availability',
          message: `Horário solicitado (${data.startTime} às ${data.endTime}) está fora do expediente de ${partner.fullName} (${availability.startTime} às ${availability.endTime})`,
          timeSlot: {
            startTime: availability.startTime,
            endTime: availability.endTime
          }
        })
      }

      // Check break time
      if (availability.breakStart && availability.breakEnd) {
        if (this.timeOverlaps(data.startTime, data.endTime, availability.breakStart, availability.breakEnd)) {
          conflicts.push({
            type: 'break',
            message: `Horário solicitado conflita com o intervalo de ${partner.fullName} (${availability.breakStart} às ${availability.breakEnd})`,
            timeSlot: {
              startTime: availability.breakStart,
              endTime: availability.breakEnd
            }
          })
        }
      }
    }

    // Check blocked dates
    const blockedDates = partner.blockedDates?.filter(bd => 
      bd.active && this.isSameDate(new Date(bd.blockedDate), data.date)
    ) || []

    for (const blocked of blockedDates) {
      if (!blocked.startTime || !blocked.endTime) {
        // Full day blocked
        conflicts.push({
          type: 'blocked',
          message: `${partner.fullName} não está disponível neste dia. Motivo: ${blocked.reason || 'Agenda bloqueada'}`
        })
      } else {
        // Partial day blocked
        if (this.timeOverlaps(data.startTime, data.endTime, blocked.startTime, blocked.endTime)) {
          conflicts.push({
            type: 'blocked',
            message: `${partner.fullName} não está disponível das ${blocked.startTime} às ${blocked.endTime}. Motivo: ${blocked.reason || 'Agenda bloqueada'}`,
            timeSlot: {
              startTime: blocked.startTime,
              endTime: blocked.endTime
            }
          })
        }
      }
    }

    const available = conflicts.length === 0
    const result: AvailabilityResult = { available, conflicts }

    // Generate suggested times if not available
    if (!available && availability) {
      result.suggestedTimes = this.generateSuggestedTimes(availability, blockedDates, data.date, data.partnerId, data.roomId)
    }

    return result
  }

  async getAppointmentsByDateRange(startDate: Date, endDate: Date, filters: Omit<AppointmentFilters, 'startDate' | 'endDate'> = {}): Promise<AppointmentEntity[]> {
    const appointments = await this.appointmentRepository.findByDateRange(startDate, endDate, filters)
    // Os appointments já vêm com as relações, mas precisamos converter os tipos Decimal para number
    return appointments.map(appointment => ({
      ...appointment,
      date: appointment.date instanceof Date ? appointment.date : new Date(appointment.date),
      createdAt: appointment.createdAt instanceof Date ? appointment.createdAt : new Date(appointment.createdAt),
      updatedAt: appointment.updatedAt instanceof Date ? appointment.updatedAt : new Date(appointment.updatedAt),
      // Converter productService se existir usando o conversor adequado
      productService: appointment.productService ? convertPrismaProductService(appointment.productService) : undefined,
    }))
  }

  // Helper methods
  private async validateAppointmentEntities(data: CreateAppointmentData): Promise<void> {
    // Check if patient exists and is active
    const patient = await this.patientRepository.findById(data.patientId)
    if (!patient) {
      throw new Error('Paciente não encontrado no sistema. Verifique se o paciente está cadastrado.')
    }
    if (!patient.active) {
      throw new Error(`Paciente ${patient.fullName} está inativo. Entre em contato com a administração.`)
    }

    // Check if partner exists and is active
    const partner = await this.partnerRepository.findById(data.partnerId)
    if (!partner) {
      throw new Error('Parceiro não encontrado no sistema. Verifique se o parceiro está cadastrado.')
    }
    if (!partner.active) {
      throw new Error(`Parceiro ${partner.fullName} está inativo. Entre em contato com a administração.`)
    }

    // Check if product/service exists and is active
    const productService = await this.productServiceRepository.findById(data.productServiceId)
    if (!productService) {
      throw new Error('Produto/Serviço não encontrado no sistema. Verifique se está cadastrado.')
    }
    if (!productService.active) {
      throw new Error(`${productService.name} está inativo. Selecione outro produto/serviço.`)
    }
    if (!productService.availableForBooking) {
      throw new Error(`${productService.name} não está disponível para agendamento.`)
    }

    // Check if room exists and is active (if specified)
    if (data.roomId) {
      const room = await this.roomRepository.findById(data.roomId)
      if (!room) {
        throw new Error('Sala não encontrada no sistema. Verifique se a sala está cadastrada.')
      }
      if (!room.active) {
        throw new Error(`Sala ${room.name} está inativa. Selecione outra sala.`)
      }
    }
  }

  private timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
    return start1 < end2 && end1 > start2
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString()
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMins = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
  }

  private generateSuggestedTimes(
    availability: any,
    blockedDates: any[],
    date: Date,
    partnerId: string,
    roomId?: string
  ): string[] {
    // This is a simplified implementation
    // In a real application, you might want more sophisticated logic
    const suggestions: string[] = []
    const workStart = availability.startTime
    const workEnd = availability.endTime
    
    // Generate 30-minute slots throughout the day
    let currentTime = workStart
    while (currentTime < workEnd) {
      const endTime = this.addMinutesToTime(currentTime, 30)
      if (endTime <= workEnd) {
        suggestions.push(`${currentTime} - ${endTime}`)
      }
      currentTime = this.addMinutesToTime(currentTime, 30)
    }

    return suggestions.slice(0, 5) // Return first 5 suggestions
  }

  /**
   * 🏥 Validar regras de negócio da clínica
   */
  private async validateBusinessRules(data: CreateAppointmentData): Promise<void> {
    console.log('🏥 Validando regras de negócio da clínica...')

    // 1. Validar horário de funcionamento
    const businessHoursValidation = await clinicSettingsService.validateBusinessHours(
      data.date, 
      data.startTime, 
      data.endTime
    )

    if (!businessHoursValidation.valid) {
      throw new Error(`Horário inválido: ${businessHoursValidation.reason}`)
    }

    // 2. Validar antecedência mínima/máxima (PULAR PARA ENCAIXES)
    if (!data.isEncaixe) {
      const advanceValidation = await clinicSettingsService.validateBookingAdvance(data.date)

      if (!advanceValidation.valid) {
        throw new Error(`Antecedência inválida: ${advanceValidation.reason}`)
      }
    } else {
      console.log('📌 ENCAIXE: Pulando validação de antecedência mínima')
    }

    console.log('✅ Regras de negócio validadas com sucesso')
  }

  /**
   * 🔄 Validar movimentação de agendamento
   */
  async validateAppointmentMovement(appointmentId: string, newData: Partial<CreateAppointmentData>): Promise<void> {
    console.log('🔄 Validando movimentação de agendamento...')

    // Buscar agendamento atual
    const appointment = await this.getAppointmentById(appointmentId)

    // Validar se o status permite movimentação
    const movementValidation = await clinicSettingsService.validateAppointmentMovement(appointment.status)

    if (!movementValidation.valid) {
      throw new Error(`Movimentação não permitida: ${movementValidation.reason}`)
    }

    // Se está mudando data/horário, validar regras de negócio
    if (newData.date || newData.startTime || newData.endTime) {
      const validationData = {
        ...appointment,
        ...newData,
        date: newData.date || appointment.date,
        startTime: newData.startTime || appointment.startTime,
        endTime: newData.endTime || appointment.endTime
      } as CreateAppointmentData

      await this.validateBusinessRules(validationData)
    }

    console.log('✅ Movimentação validada com sucesso')
  }
}
