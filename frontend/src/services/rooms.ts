import { apiClient } from './api'
import { Room, RoomWithRelations } from '../types/entities'

export interface CreateRoomData {
  name: string
  description?: string
  resources?: string[]
}

export interface UpdateRoomData extends Partial<CreateRoomData> {
  active?: boolean
}

export interface RoomFilters {
  page?: number
  limit?: number
  q?: string // search query
  active?: boolean
}

export interface RoomListResponse {
  rooms: Room[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface RoomAvailability {
  available: boolean
  occupiedSlots: string[]
}

export const roomsApi = {
  // Get all rooms with pagination and search
  getRooms: async (filters: RoomFilters = {}): Promise<RoomListResponse> => {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.q) params.append('q', filters.q)
    if (filters.active !== undefined) params.append('active', filters.active.toString())

    const response = await apiClient.get<RoomListResponse>(`/api/rooms?${params.toString()}`)
    return response.data
  },

  // Get room by ID with relations
  getRoom: async (id: string): Promise<RoomWithRelations> => {
    const response = await apiClient.get<RoomWithRelations>(`/api/rooms/${id}`)
    return response.data
  },

  // Get room availability for a specific date
  getRoomAvailability: async (id: string, date: string): Promise<RoomAvailability> => {
    const params = new URLSearchParams()
    params.append('date', date)

    const response = await apiClient.get<RoomAvailability>(`/api/rooms/${id}/availability?${params.toString()}`)
    return response.data
  },

  // Create new room
  createRoom: async (data: CreateRoomData): Promise<Room> => {
    const response = await apiClient.post<Room>('/api/rooms', data)
    return response.data
  },

  // Update room
  updateRoom: async (id: string, data: UpdateRoomData): Promise<Room> => {
    const response = await apiClient.put<Room>(`/api/rooms/${id}`, data)
    return response.data
  },

  // Delete room
  deleteRoom: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/rooms/${id}`)
  },

  // Search rooms
  searchRooms: async (query: string, filters: Omit<RoomFilters, 'q'> = {}): Promise<RoomListResponse> => {
    const params = new URLSearchParams()
    params.append('q', query)
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.active !== undefined) params.append('active', filters.active.toString())

    const response = await apiClient.get<RoomListResponse>(`/api/rooms/search?${params.toString()}`)
    return response.data
  },

  // Get active rooms only
  getActiveRooms: async (filters: Omit<RoomFilters, 'active'> = {}): Promise<RoomListResponse> => {
    return roomsApi.getRooms({ ...filters, active: true })
  }
}