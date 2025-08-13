import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roomsApi, RoomFilters, CreateRoomData, UpdateRoomData } from '@/services/rooms'
import { Room, RoomWithRelations } from '@/types/entities'

// Query keys
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (filters: RoomFilters) => [...roomKeys.lists(), filters] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: string) => [...roomKeys.details(), id] as const,
  availability: (id: string, date: string) => [...roomKeys.all, 'availability', id, date] as const,
}

// Get rooms list with pagination and search
export const useRooms = (filters: RoomFilters = {}) => {
  return useQuery({
    queryKey: roomKeys.list(filters),
    queryFn: () => roomsApi.getRooms(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single room with relations
export const useRoom = (id: string) => {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => roomsApi.getRoom(id),
    enabled: !!id,
  })
}

// Get room availability for a specific date
export const useRoomAvailability = (id: string, date: string) => {
  return useQuery({
    queryKey: roomKeys.availability(id, date),
    queryFn: () => roomsApi.getRoomAvailability(id, date),
    enabled: !!id && !!date,
    staleTime: 1 * 60 * 1000, // 1 minute for availability data
  })
}

// Get active rooms only
export const useActiveRooms = (filters: Omit<RoomFilters, 'active'> = {}) => {
  return useQuery({
    queryKey: roomKeys.list({ ...filters, active: true }),
    queryFn: () => roomsApi.getActiveRooms(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create room mutation
export const useCreateRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRoomData) => roomsApi.createRoom(data),
    onSuccess: () => {
      // Invalidate and refetch rooms list
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
    },
  })
}

// Update room mutation
export const useUpdateRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoomData }) =>
      roomsApi.updateRoom(id, data),
    onSuccess: (updatedRoom, { id }) => {
      // Update the room in the cache
      queryClient.setQueryData(roomKeys.detail(id), updatedRoom)
      // Invalidate rooms list to refresh
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
    },
  })
}

// Delete room mutation
export const useDeleteRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roomsApi.deleteRoom(id),
    onSuccess: () => {
      // Invalidate rooms list to refresh
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
    },
  })
}

// Search rooms
export const useSearchRooms = (query: string, filters: Omit<RoomFilters, 'q'> = {}) => {
  return useQuery({
    queryKey: [...roomKeys.lists(), 'search', query, filters],
    queryFn: () => roomsApi.searchRooms(query, filters),
    enabled: !!query && query.length >= 2, // Only search when query has at least 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  })
}