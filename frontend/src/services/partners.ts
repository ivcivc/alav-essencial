import { apiClient } from './api'
import { 
  Partner, 
  PartnerWithRelations, 
  PartnerAvailability, 
  PartnerBlockedDate,
  PartnerService,
  ProductService 
} from '../types/entities'

// API Response Types
export interface PartnerListResponse {
  partners: Partner[]
  total: number
  page: number
  limit: number
  totalPages: number
}

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
  partnershipType: 'SUBLEASE' | 'PERCENTAGE' | 'PERCENTAGE_WITH_PRODUCTS'
  subleaseAmount?: number
  subleasePaymentDay?: number
  percentageAmount?: number
  percentageRate?: number
}

export interface UpdatePartnerData extends Partial<CreatePartnerData> {
  active?: boolean
}

export interface CreateAvailabilityData {
  dayOfWeek: number
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
}

export interface CreateBlockedDateData {
  blockedDate: string
  startTime?: string
  endTime?: string
  reason?: string
}

export interface AvailabilityCheckData {
  date: string
  startTime: string
  endTime: string
}

export interface AvailabilityResult {
  available: boolean
  conflicts: string[]
  suggestedTimes?: string[]
}

export interface PartnerFilters {
  search?: string
  active?: boolean
  partnershipType?: string
  page?: number
  limit?: number
}

export const partnersService = {
  // Partners CRUD
  getPartners: async (filters: PartnerFilters = {}): Promise<PartnerListResponse> => {
    const params = new URLSearchParams()
    if (filters.search) params.append('q', filters.search)
    if (filters.active !== undefined) params.append('active', filters.active.toString())
    if (filters.partnershipType) params.append('partnershipType', filters.partnershipType)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    // 🔥 TRIPLE CACHE BUST: timestamp + random + no-cache header
    params.append('_t', Date.now().toString())
    params.append('_r', Math.random().toString(36).substr(2, 9))
    params.append('_cb', 'force-no-cache')

    const response = await apiClient.get<PartnerListResponse>(`/api/partners?${params.toString()}`)
    return response.data
  },

  getPartner: async (id: string): Promise<PartnerWithRelations> => {
    const response = await apiClient.get<PartnerWithRelations>(`/api/partners/${id}`)
    return response.data
  },

  createPartner: async (data: CreatePartnerData): Promise<Partner> => {
    const response = await apiClient.post<Partner>('/api/partners', data)
    return response.data
  },

  updatePartner: async (id: string, data: UpdatePartnerData): Promise<Partner> => {
    const response = await apiClient.put<Partner>(`/api/partners/${id}`, data)
    return response.data
  },

  deletePartner: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/partners/${id}`)
  },

  // Availability Management
  getPartnerAvailability: async (partnerId: string): Promise<PartnerAvailability[]> => {
    const response = await apiClient.get<PartnerAvailability[]>(`/api/partners/${partnerId}/availability`)
    return response.data
  },

  createPartnerAvailability: async (partnerId: string, data: CreateAvailabilityData): Promise<PartnerAvailability> => {
    const response = await apiClient.post<PartnerAvailability>(`/api/partners/${partnerId}/availability`, data)
    return response.data
  },

  updatePartnerAvailability: async (availabilityId: string, data: Partial<CreateAvailabilityData>): Promise<PartnerAvailability> => {
    const response = await apiClient.put<PartnerAvailability>(`/api/partners/availability/${availabilityId}`, data)
    return response.data
  },

  deletePartnerAvailability: async (availabilityId: string): Promise<void> => {
    await apiClient.delete(`/api/partners/availability/${availabilityId}`)
  },

  // Blocked Dates Management
  getPartnerBlockedDates: async (partnerId: string, startDate?: string, endDate?: string): Promise<PartnerBlockedDate[]> => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await apiClient.get<PartnerBlockedDate[]>(`/api/partners/${partnerId}/blocked-dates?${params.toString()}`)
    return response.data
  },

  createPartnerBlockedDate: async (partnerId: string, data: CreateBlockedDateData): Promise<PartnerBlockedDate> => {
    const response = await apiClient.post<PartnerBlockedDate>(`/api/partners/${partnerId}/blocked-dates`, data)
    return response.data
  },

  updatePartnerBlockedDate: async (blockedDateId: string, data: Partial<CreateBlockedDateData>): Promise<PartnerBlockedDate> => {
    const response = await apiClient.put<PartnerBlockedDate>(`/api/partners/blocked-dates/${blockedDateId}`, data)
    return response.data
  },

  deletePartnerBlockedDate: async (blockedDateId: string): Promise<void> => {
    await apiClient.delete(`/api/partners/blocked-dates/${blockedDateId}`)
  },

  // Availability Check
  checkPartnerAvailability: async (partnerId: string, data: AvailabilityCheckData): Promise<AvailabilityResult> => {
    const response = await apiClient.post<AvailabilityResult>(`/api/partners/${partnerId}/check-availability`, data)
    return response.data
  },

  // Services Association
  getPartnerServices: async (partnerId: string): Promise<PartnerService[]> => {
    const response = await apiClient.get<PartnerService[]>(`/api/partners/${partnerId}/services`)
    return response.data
  },

  updatePartnerServices: async (partnerId: string, serviceIds: string[]): Promise<void> => {
    await apiClient.put(`/api/partners/${partnerId}/services`, { productServiceIds: serviceIds })
  },

  // Search
  searchPartners: async (filters: PartnerFilters): Promise<PartnerListResponse> => {
    return partnersService.getPartners(filters)
  }
}
