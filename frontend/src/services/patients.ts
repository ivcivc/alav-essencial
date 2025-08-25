import { apiClient } from './api'
import { Patient, PatientWithAppointments } from '../types/entities'

export interface CreatePatientData {
  fullName: string
  cpf: string
  birthDate: string // ISO string
  whatsapp?: string
  phone?: string
  email?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  observations?: string
}

export interface UpdatePatientData extends Partial<CreatePatientData> {
  active?: boolean
}

export interface PatientFilters {
  page?: number
  limit?: number
  q?: string // search query
  active?: boolean
}

export interface PatientListResponse {
  patients: Patient[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const patientsApi = {
  // Get all patients with pagination and search
  getPatients: async (filters: PatientFilters = {}): Promise<PatientListResponse> => {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.q) params.append('q', filters.q)
    if (filters.active !== undefined) params.append('active', filters.active.toString())
    
    // 🔥 TRIPLE CACHE BUST: timestamp + random + no-cache header
    params.append('_t', Date.now().toString())
    params.append('_r', Math.random().toString(36).substr(2, 9))
    params.append('_cb', 'force-no-cache')

    const response = await apiClient.get<PatientListResponse>(`/api/patients?${params.toString()}`)
    return response.data
  },

  // Get patient by ID with appointment history
  getPatient: async (id: string): Promise<PatientWithAppointments> => {
    const response = await apiClient.get<PatientWithAppointments>(`/api/patients/${id}`)
    return response.data
  },

  // Create new patient
  createPatient: async (data: CreatePatientData): Promise<Patient> => {
    const response = await apiClient.post<Patient>('/api/patients', data)
    return response.data
  },

  // Update patient
  updatePatient: async (id: string, data: UpdatePatientData): Promise<Patient> => {
    const response = await apiClient.put<Patient>(`/api/patients/${id}`, data)
    return response.data
  },

  // Delete patient
  deletePatient: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/patients/${id}`)
  },

  // Search patients
  searchPatients: async (query: string, filters: Omit<PatientFilters, 'q'> = {}): Promise<PatientListResponse> => {
    const params = new URLSearchParams()
    params.append('q', query)
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.active !== undefined) params.append('active', filters.active.toString())

    const response = await apiClient.get<PatientListResponse>(`/api/patients/search?${params.toString()}`)
    return response.data
  }
}