import { Partner, PartnerAvailability, PartnerBlockedDate, PartnerService as PrismaPartnerService } from '@prisma/client'
import { PartnerRepository, PartnerFilters } from '../repositories/partner.repository'
import { Partner as PartnerEntity, PartnerWithRelations } from '../types/entities'
import { PartnershipType } from '../types/shared'
import { convertPrismaPartners, convertPrismaPartner } from '../utils/typeConverters'

export interface CreatePartnerData {
  fullName: string
  document: string
  phone: string
  email: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  bank?: string
  agency?: string
  account?: string
  pix?: string
  partnershipType: PartnershipType
  subleaseAmount?: number
  subleasePaymentDay?: number
  percentageAmount?: number
  percentageRate?: number
}

export interface UpdatePartnerData extends Partial<CreatePartnerData> {
  active?: boolean
}

export interface CreateAvailabilityData {
  partnerId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  breakStart?: string | null
  breakEnd?: string | null
}

export interface UpdateAvailabilityData extends Partial<Omit<CreateAvailabilityData, 'partnerId'>> {
  active?: boolean
}

export interface CreateBlockedDateData {
  partnerId: string
  blockedDate: Date
  startTime?: string
  endTime?: string
  reason?: string
}

export interface UpdateBlockedDateData extends Partial<Omit<CreateBlockedDateData, 'partnerId'>> {
  active?: boolean
}

export interface AvailabilityCheckData {
  partnerId: string
  date: Date
  startTime: string
  endTime: string
}

export interface AvailabilityResult {
  available: boolean
  conflicts: string[]
  suggestedTimes?: string[]
}

export interface PartnerListResponse {
  partners: Partner[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class PartnerService {
  constructor(private partnerRepository: PartnerRepository) {}

  async getAllPartners(filters: PartnerFilters = {}): Promise<PartnerListResponse> {
    const { page = 1, limit = 10 } = filters
    
    const [partners, total] = await Promise.all([
      this.partnerRepository.findAll(filters),
      this.partnerRepository.count(filters)
    ])

    return {
      partners: convertPrismaPartners(partners),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getPartnerById(id: string): Promise<PartnerWithRelations> {
    const partner = await this.partnerRepository.findById(id)
    
    if (!partner) {
      throw new Error('Parceiro não encontrado')
    }

    // Note: PartnerWithRelations includes nested objects, so we need a more complex conversion
    // For now, let's convert the main partner data and keep relations as-is
    const convertedPartner = convertPrismaPartner(partner)
    return {
      ...convertedPartner,
      availability: partner.availability,
      blockedDates: partner.blockedDates,
      partnerServices: partner.partnerServices,
      appointments: partner.appointments
    } as PartnerWithRelations
  }

  async createPartner(data: CreatePartnerData): Promise<Partner> {
    // Check if document already exists
    const existingPartnerByDocument = await this.partnerRepository.findByDocument(data.document)
    if (existingPartnerByDocument) {
      throw new Error('Já existe um parceiro cadastrado com este CPF/CNPJ')
    }

    // Check if email already exists
    const existingPartnerByEmail = await this.partnerRepository.findByEmail(data.email)
    if (existingPartnerByEmail) {
      throw new Error('Já existe um parceiro cadastrado com este email')
    }

    // Validate document format (basic validation for CPF or CNPJ)
    if (!/^\d{11}$|^\d{14}$/.test(data.document)) {
      throw new Error('Documento deve conter 11 dígitos (CPF) ou 14 dígitos (CNPJ)')
    }

    // Validate partnership type specific fields
    this.validatePartnershipTypeData(data)

    const createdPartner = await this.partnerRepository.create(data)
    return convertPrismaPartner(createdPartner)
  }

  async updatePartner(id: string, data: UpdatePartnerData): Promise<Partner> {
    // Check if partner exists
    const existingPartner = await this.partnerRepository.findById(id)
    if (!existingPartner) {
      throw new Error('Parceiro não encontrado')
    }

    // If updating document, check if it's not already in use by another partner
    if (data.document && data.document !== existingPartner.document) {
      const partnerWithDocument = await this.partnerRepository.findByDocument(data.document)
      if (partnerWithDocument && partnerWithDocument.id !== id) {
        throw new Error('Já existe um parceiro cadastrado com este CPF/CNPJ')
      }

      // Validate document format
      if (!/^\d{11}$|^\d{14}$/.test(data.document)) {
        throw new Error('Documento deve conter 11 dígitos (CPF) ou 14 dígitos (CNPJ)')
      }
    }

    // If updating email, check if it's not already in use by another partner
    if (data.email && data.email !== existingPartner.email) {
      const partnerWithEmail = await this.partnerRepository.findByEmail(data.email)
      if (partnerWithEmail && partnerWithEmail.id !== id) {
        throw new Error('Já existe um parceiro cadastrado com este email')
      }
    }

    // Validate partnership type specific fields if being updated
    if (data.partnershipType || data.subleaseAmount !== undefined || data.percentageAmount !== undefined || data.percentageRate !== undefined) {
      const updatedData = { ...existingPartner, ...data }
      this.validatePartnershipTypeData(updatedData)
    }

    const updatedPartner = await this.partnerRepository.update(id, data)
    return convertPrismaPartner(updatedPartner)
  }

  async deletePartner(id: string): Promise<void> {
    // Check if partner exists
    const existingPartner = await this.partnerRepository.findById(id)
    if (!existingPartner) {
      throw new Error('Parceiro não encontrado')
    }

    // Check if partner has appointments
    if (existingPartner.appointments && existingPartner.appointments.length > 0) {
      // Only soft delete if there are appointments
      await this.partnerRepository.update(id, { active: false })
    } else {
      // Hard delete if no appointments
      await this.partnerRepository.delete(id)
    }
  }

  async searchPartners(query: string, filters: Omit<PartnerFilters, 'search'> = {}): Promise<PartnerListResponse> {
    return this.getAllPartners({ ...filters, search: query })
  }

  async getActivePartners(filters: Omit<PartnerFilters, 'active'> = {}): Promise<PartnerListResponse> {
    return this.getAllPartners({ ...filters, active: true })
  }

  async getPartnersByPartnershipType(partnershipType: PartnershipType, filters: Omit<PartnerFilters, 'partnershipType'> = {}): Promise<PartnerListResponse> {
    return this.getAllPartners({ ...filters, partnershipType })
  }

  // Availability management
  async getPartnerAvailability(partnerId: string): Promise<PartnerAvailability[]> {
    // Check if partner exists
    const partner = await this.partnerRepository.findById(partnerId)
    if (!partner) {
      throw new Error('Parceiro não encontrado')
    }

    return this.partnerRepository.findAvailabilityByPartnerId(partnerId)
  }

  async createPartnerAvailability(data: CreateAvailabilityData): Promise<PartnerAvailability> {
    // Check if partner exists
    const partner = await this.partnerRepository.findById(data.partnerId)
    if (!partner) {
      throw new Error('Parceiro não encontrado')
    }

    // Validate day of week
    if (data.dayOfWeek < 0 || data.dayOfWeek > 6) {
      throw new Error('Dia da semana deve estar entre 0 (domingo) e 6 (sábado)')
    }

    // Validate time format and logic
    this.validateTimeFormat(data.startTime, 'Horário de início')
    this.validateTimeFormat(data.endTime, 'Horário de fim')

    if (data.breakStart) {
      this.validateTimeFormat(data.breakStart, 'Início do intervalo')
    }

    if (data.breakEnd) {
      this.validateTimeFormat(data.breakEnd, 'Fim do intervalo')
    }

    // Validate time logic
    if (data.startTime >= data.endTime) {
      throw new Error('Horário de início deve ser anterior ao horário de fim')
    }

    if (data.breakStart && data.breakEnd) {
      if (data.breakStart >= data.breakEnd) {
        throw new Error('Início do intervalo deve ser anterior ao fim do intervalo')
      }

      if (data.breakStart <= data.startTime || data.breakEnd >= data.endTime) {
        throw new Error('Intervalo deve estar dentro do horário de trabalho')
      }
    }

    // Convert undefined to null for Prisma compatibility
    const availabilityData = {
      ...data,
      breakStart: data.breakStart ?? null,
      breakEnd: data.breakEnd ?? null
    }
    
    return this.partnerRepository.createAvailability(availabilityData)
  }

  async updatePartnerAvailability(id: string, data: UpdateAvailabilityData): Promise<PartnerAvailability> {
    // Validate time formats if provided
    if (data.startTime) {
      this.validateTimeFormat(data.startTime, 'Horário de início')
    }

    if (data.endTime) {
      this.validateTimeFormat(data.endTime, 'Horário de fim')
    }

    if (data.breakStart) {
      this.validateTimeFormat(data.breakStart, 'Início do intervalo')
    }

    if (data.breakEnd) {
      this.validateTimeFormat(data.breakEnd, 'Fim do intervalo')
    }

    // Additional time logic validation would require fetching current data
    // This could be implemented if needed

    return this.partnerRepository.updateAvailability(id, data)
  }

  async deletePartnerAvailability(id: string): Promise<void> {
    await this.partnerRepository.deleteAvailability(id)
  }

  // Services association management
  async getPartnerServices(partnerId: string): Promise<PrismaPartnerService[]> {
    // Check if partner exists
    const partner = await this.partnerRepository.findById(partnerId)
    if (!partner) {
      throw new Error('Parceiro não encontrado')
    }

    return this.partnerRepository.findServicesByPartnerId(partnerId)
  }

  async associatePartnerService(partnerId: string, productServiceId: string): Promise<PrismaPartnerService> {
    // Check if partner exists
    const partner = await this.partnerRepository.findById(partnerId)
    if (!partner) {
      throw new Error('Parceiro não encontrado')
    }

    // Check if association already exists
    const existingServices = await this.partnerRepository.findServicesByPartnerId(partnerId)
    const alreadyAssociated = existingServices.some(ps => ps.productServiceId === productServiceId)
    
    if (alreadyAssociated) {
      throw new Error('Serviço já está associado a este parceiro')
    }

    return this.partnerRepository.associateService(partnerId, productServiceId)
  }

  async dissociatePartnerService(partnerId: string, productServiceId: string): Promise<void> {
    // Check if partner exists
    const partner = await this.partnerRepository.findById(partnerId)
    if (!partner) {
      throw new Error('Parceiro não encontrado')
    }

    await this.partnerRepository.dissociateService(partnerId, productServiceId)
  }

  async updatePartnerServices(partnerId: string, productServiceIds: string[]): Promise<void> {
    // Check if partner exists
    const partner = await this.partnerRepository.findById(partnerId)
    if (!partner) {
      throw new Error('Parceiro não encontrado')
    }

    // Remove all current associations
    await this.partnerRepository.dissociateAllServices(partnerId)

    // Add new associations
    for (const productServiceId of productServiceIds) {
      await this.partnerRepository.associateService(partnerId, productServiceId)
    }
  }

  // Blocked dates methods
  async getPartnerBlockedDates(partnerId: string, startDate?: Date, endDate?: Date): Promise<PartnerBlockedDate[]> {
    const partner = await this.partnerRepository.findById(partnerId)
    if (!partner) {
      throw new Error('Parceiro não encontrado')
    }

    return this.partnerRepository.findBlockedDatesByPartnerId(partnerId, startDate, endDate)
  }

  async createPartnerBlockedDate(data: CreateBlockedDateData): Promise<PartnerBlockedDate> {
    // Check if partner exists
    const partner = await this.partnerRepository.findById(data.partnerId)
    if (!partner) {
      throw new Error('Parceiro não encontrado')
    }

    // Validate time format if provided
    if (data.startTime) {
      this.validateTimeFormat(data.startTime, 'Horário de início')
    }
    if (data.endTime) {
      this.validateTimeFormat(data.endTime, 'Horário de fim')
    }

    // Validate time logic
    if (data.startTime && data.endTime) {
      if (data.startTime >= data.endTime) {
        throw new Error('Horário de início deve ser menor que o horário de fim')
      }
    }

    return this.partnerRepository.createBlockedDate(data)
  }

  async updatePartnerBlockedDate(id: string, data: UpdateBlockedDateData): Promise<PartnerBlockedDate> {
    // Validate time format if provided
    if (data.startTime) {
      this.validateTimeFormat(data.startTime, 'Horário de início')
    }
    if (data.endTime) {
      this.validateTimeFormat(data.endTime, 'Horário de fim')
    }

    // Validate time logic
    if (data.startTime && data.endTime) {
      if (data.startTime >= data.endTime) {
        throw new Error('Horário de início deve ser menor que o horário de fim')
      }
    }

    return this.partnerRepository.updateBlockedDate(id, data)
  }

  async deletePartnerBlockedDate(id: string): Promise<void> {
    await this.partnerRepository.deleteBlockedDate(id)
  }

  // Availability check methods
  async checkPartnerAvailability(data: AvailabilityCheckData): Promise<AvailabilityResult> {
    const partner = await this.partnerRepository.findById(data.partnerId)
    if (!partner) {
      throw new Error('Parceiro não encontrado')
    }

    const conflicts: string[] = []
    const dayOfWeek = data.date.getDay()

    // Check regular availability
    const regularAvailability = partner.availability?.find(av => av.dayOfWeek === dayOfWeek)
    if (!regularAvailability) {
      conflicts.push('Parceiro não trabalha neste dia da semana')
      return { available: false, conflicts }
    }

    // Check if requested time is within working hours
    if (data.startTime < regularAvailability.startTime || data.endTime > regularAvailability.endTime) {
      conflicts.push(`Horário fora do expediente (${regularAvailability.startTime} às ${regularAvailability.endTime})`)
    }

    // Check if requested time conflicts with break time
    if (regularAvailability.breakStart && regularAvailability.breakEnd) {
      if (this.timeOverlaps(data.startTime, data.endTime, regularAvailability.breakStart, regularAvailability.breakEnd)) {
        conflicts.push(`Conflito com horário de almoço (${regularAvailability.breakStart} às ${regularAvailability.breakEnd})`)
      }
    }

    // Check blocked dates
    const blockedDates = await this.partnerRepository.findBlockedDatesByPartnerId(
      data.partnerId, 
      data.date, 
      data.date
    )

    for (const blocked of blockedDates) {
      if (this.isSameDate(blocked.blockedDate, data.date)) {
        if (!blocked.startTime || !blocked.endTime) {
          // Full day blocked
          conflicts.push(`Dia completamente bloqueado: ${blocked.reason || 'Sem motivo especificado'}`)
        } else {
          // Partial day blocked
          if (this.timeOverlaps(data.startTime, data.endTime, blocked.startTime, blocked.endTime)) {
            conflicts.push(`Horário bloqueado (${blocked.startTime} às ${blocked.endTime}): ${blocked.reason || 'Sem motivo especificado'}`)
          }
        }
      }
    }

    // Check existing appointments (this would require appointment repository)
    // TODO: Implement appointment conflict check when appointment module is ready

    const available = conflicts.length === 0
    const result: AvailabilityResult = { available, conflicts }

    // Generate suggested times if not available
    if (!available && regularAvailability) {
      result.suggestedTimes = this.generateSuggestedTimes(regularAvailability, blockedDates, data.date)
    }

    return result
  }

  // Helper methods
  private validatePartnershipTypeData(data: CreatePartnerData | UpdatePartnerData): void {
    const partnershipType = data.partnershipType

    switch (partnershipType) {
      case PartnershipType.SUBLEASE:
        if (!data.subleaseAmount || data.subleaseAmount <= 0) {
          throw new Error('Valor da sublocação é obrigatório para parceria do tipo sublocação')
        }
        if (!data.subleasePaymentDay || data.subleasePaymentDay < 1 || data.subleasePaymentDay > 31) {
          throw new Error('Dia de vencimento deve estar entre 1 e 31')
        }
        break

      case PartnershipType.PERCENTAGE:
        if (!data.percentageAmount || data.percentageAmount <= 0) {
          throw new Error('Valor fixo por serviço é obrigatório para parceria do tipo porcentagem')
        }
        break

      case PartnershipType.PERCENTAGE_WITH_PRODUCTS:
        if (!data.percentageRate || data.percentageRate <= 0 || data.percentageRate > 100) {
          throw new Error('Taxa de porcentagem deve estar entre 0 e 100%')
        }
        break

      default:
        throw new Error('Tipo de parceria inválido')
    }
  }

  private validateTimeFormat(time: string, fieldName: string): void {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      throw new Error(`${fieldName} deve estar no formato HH:MM`)
    }
  }

  private timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
    return start1 < end2 && end1 > start2
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString()
  }

  private generateSuggestedTimes(availability: PartnerAvailability, blockedDates: PartnerBlockedDate[], date: Date): string[] {
    const suggestions: string[] = []
    const workStart = availability.startTime
    const workEnd = availability.endTime
    const breakStart = availability.breakStart
    const breakEnd = availability.breakEnd

    // Simple time slot generation (could be more sophisticated)
    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
    
    for (const slot of timeSlots) {
      if (slot >= workStart && slot < workEnd) {
        let isBlocked = false
        
        // Check break time
        if (breakStart && breakEnd && slot >= breakStart && slot < breakEnd) {
          isBlocked = true
        }
        
        // Check blocked dates
        for (const blocked of blockedDates) {
          if (this.isSameDate(blocked.blockedDate, date)) {
            if (!blocked.startTime || !blocked.endTime) {
              isBlocked = true // Full day blocked
              break
            } else if (slot >= blocked.startTime && slot < blocked.endTime) {
              isBlocked = true
              break
            }
          }
        }
        
        if (!isBlocked) {
          suggestions.push(slot)
        }
      }
    }

    return suggestions.slice(0, 3) // Return top 3 suggestions
  }
}
