import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientsApi, PatientFilters, CreatePatientData, UpdatePatientData } from '@/services/patients'
import { Patient, PatientWithAppointments } from '@/types/entities'

// Query keys
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: PatientFilters) => [...patientKeys.lists(), filters] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
}

// Get patients list with pagination and search
export const usePatients = (filters: PatientFilters = {}) => {
  return useQuery({
    queryKey: patientKeys.list(filters),
    queryFn: () => patientsApi.getPatients(filters),
    staleTime: 0,        // 🔥 SEM CACHE LOCAL
    gcTime: 0,           // 🔥 SEM GARBAGE COLLECTION
    refetchOnMount: true, // 🚀 SEMPRE BUSCAR DADOS FRESCOS
  })
}

// Get single patient with appointment history
export const usePatient = (id: string) => {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientsApi.getPatient(id),
    enabled: !!id,
  })
}

// Create patient mutation
export const useCreatePatient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePatientData) => patientsApi.createPatient(data),
    onSuccess: () => {
      // 🔥 SOLUÇÃO RADICAL: LIMPAR TUDO E RECARREGAR PÁGINA
      queryClient.clear()
      
      // 🚀 RELOAD COMPLETO PARA GARANTIR DADOS FRESCOS
      setTimeout(() => {
        window.location.reload()
      }, 500)
    },
  })
}

// Update patient mutation
export const useUpdatePatient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientData }) =>
      patientsApi.updatePatient(id, data),
    onSuccess: (updatedPatient, { id }) => {
      // 🔥 SOLUÇÃO RADICAL: LIMPAR TUDO E RECARREGAR PÁGINA
      queryClient.clear()
      
      // 🚀 RELOAD COMPLETO PARA GARANTIR DADOS FRESCOS
      setTimeout(() => {
        window.location.reload()
      }, 500)
    },
  })
}

// Delete patient mutation
export const useDeletePatient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => patientsApi.deletePatient(id),
    onSuccess: () => {
      // Invalidate patients list to refresh
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}

// Search patients
export const useSearchPatients = (query: string, filters: Omit<PatientFilters, 'q'> = {}) => {
  return useQuery({
    queryKey: [...patientKeys.lists(), 'search', query, filters],
    queryFn: () => patientsApi.searchPatients(query, filters),
    enabled: !!query && query.length >= 2, // Only search when query has at least 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  })
}