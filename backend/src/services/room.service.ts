import { Room } from '@prisma/client'
import { RoomRepository, RoomFilters } from '../repositories/room.repository'
import { Room as RoomEntity, RoomWithRelations } from '../types/entities'

export interface CreateRoomData {
  name: string
  description?: string
  resources?: string[]
}

export interface UpdateRoomData extends Partial<CreateRoomData> {
  active?: boolean
}

export interface RoomListResponse {
  rooms: Room[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class RoomService {
  constructor(private roomRepository: RoomRepository) {}

  async getAllRooms(filters: RoomFilters = {}): Promise<RoomListResponse> {
    const { page = 1, limit = 10 } = filters
    
    const [rooms, total] = await Promise.all([
      this.roomRepository.findAll(filters),
      this.roomRepository.count(filters)
    ])

    return {
      rooms,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getRoomById(id: string): Promise<RoomWithRelations> {
    const room = await this.roomRepository.findById(id)
    
    if (!room) {
      throw new Error('Sala não encontrada')
    }

    return room
  }

  async createRoom(data: CreateRoomData): Promise<Room> {
    // Check if room name already exists
    const existingRoom = await this.roomRepository.findByName(data.name)
    if (existingRoom) {
      throw new Error('Já existe uma sala cadastrada com este nome')
    }

    // Validate room name
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome da sala é obrigatório')
    }

    return this.roomRepository.create({
      name: data.name.trim(),
      description: data.description?.trim(),
      resources: data.resources || []
    })
  }

  async updateRoom(id: string, data: UpdateRoomData): Promise<Room> {
    // Check if room exists
    const existingRoom = await this.roomRepository.findById(id)
    if (!existingRoom) {
      throw new Error('Sala não encontrada')
    }

    // If updating name, check if it's not already in use by another room
    if (data.name && data.name !== existingRoom.name) {
      const roomWithName = await this.roomRepository.findByName(data.name)
      if (roomWithName && roomWithName.id !== id) {
        throw new Error('Já existe uma sala cadastrada com este nome')
      }

      // Validate room name
      if (data.name.trim().length === 0) {
        throw new Error('Nome da sala é obrigatório')
      }
    }

    const updateData: Partial<RoomEntity> = {}
    
    if (data.name !== undefined) {
      updateData.name = data.name.trim()
    }
    
    if (data.description !== undefined) {
      updateData.description = data.description?.trim()
    }
    
    if (data.resources !== undefined) {
      updateData.resources = data.resources
    }
    
    if (data.active !== undefined) {
      updateData.active = data.active
    }

    return this.roomRepository.update(id, updateData)
  }

  async deleteRoom(id: string): Promise<void> {
    // Check if room exists
    const existingRoom = await this.roomRepository.findById(id)
    if (!existingRoom) {
      throw new Error('Sala não encontrada')
    }

    // Always do soft delete to maintain referential integrity
    // Hard delete can be done manually by administrators if needed
    await this.roomRepository.update(id, { active: false })
  }

  async searchRooms(query: string, filters: Omit<RoomFilters, 'search'> = {}): Promise<RoomListResponse> {
    return this.getAllRooms({ ...filters, search: query })
  }

  async getActiveRooms(filters: Omit<RoomFilters, 'active'> = {}): Promise<RoomListResponse> {
    return this.getAllRooms({ ...filters, active: true })
  }

  async getRoomAvailability(roomId: string, date: Date): Promise<{ available: boolean; occupiedSlots: string[] }> {
    const room = await this.roomRepository.findById(roomId)
    
    if (!room) {
      throw new Error('Sala não encontrada')
    }

    if (!room.active) {
      return { available: false, occupiedSlots: [] }
    }

    // Get appointments for the specific date
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    console.log('🔍 ROOM AVAILABILITY DEBUG:', {
      roomId,
      requestedDate: date.toISOString(),
      dayStart: dayStart.toISOString(),
      dayEnd: dayEnd.toISOString(),
      totalAppointments: room.appointments?.length || 0
    })

    const occupiedSlots = room.appointments
      ?.filter(appointment => {
        const appointmentDate = new Date(appointment.date)
        const isInDateRange = appointmentDate >= dayStart && appointmentDate <= dayEnd
        const isNotCancelled = appointment.status !== 'CANCELLED'
        const shouldInclude = isInDateRange && isNotCancelled
        
        console.log('🔍 APPOINTMENT CHECK:', {
          appointmentId: appointment.id,
          appointmentDate: appointmentDate.toISOString(),
          appointmentDateOnly: appointmentDate.toISOString().split('T')[0],
          requestedDateOnly: date.toISOString().split('T')[0],
          status: appointment.status,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          isInDateRange,
          isNotCancelled,
          shouldInclude
        })
        
        return shouldInclude
      })
      .map(appointment => `${appointment.startTime}-${appointment.endTime}`) || []

    console.log('✅ OCCUPIED SLOTS RESULT:', {
      roomId,
      requestedDate: date.toISOString().split('T')[0],
      occupiedSlots
    })

    return {
      available: true,
      occupiedSlots
    }
  }
}