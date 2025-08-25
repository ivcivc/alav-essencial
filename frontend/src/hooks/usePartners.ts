import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { partnersService, PartnerFilters, CreatePartnerData, UpdatePartnerData } from '../services/partners'
import { useToast } from './useToast'

// Query Keys
export const partnerKeys = {
  all: ['partners'] as const,
  lists: () => [...partnerKeys.all, 'list'] as const,
  list: (filters: PartnerFilters) => [...partnerKeys.lists(), filters] as const,
  details: () => [...partnerKeys.all, 'detail'] as const,
  detail: (id: string) => [...partnerKeys.details(), id] as const,
  availability: (id: string) => [...partnerKeys.detail(id), 'availability'] as const,
  blockedDates: (id: string) => [...partnerKeys.detail(id), 'blocked-dates'] as const,
  services: (id: string) => [...partnerKeys.detail(id), 'services'] as const,
}

// Partners List Hook
export function usePartners(filters: PartnerFilters = {}) {
  return useQuery({
    queryKey: partnerKeys.list(filters),
    queryFn: () => partnersService.getPartners(filters),
    staleTime: 0,        // 🔥 SEM CACHE LOCAL
    gcTime: 0,           // 🔥 SEM GARBAGE COLLECTION
    refetchOnMount: true, // 🚀 SEMPRE BUSCAR DADOS FRESCOS
  })
}

// Single Partner Hook
export function usePartner(id: string) {
  return useQuery({
    queryKey: partnerKeys.detail(id),
    queryFn: () => partnersService.getPartner(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Partner Availability Hook
export function usePartnerAvailability(partnerId: string) {
  return useQuery({
    queryKey: partnerKeys.availability(partnerId),
    queryFn: () => partnersService.getPartnerAvailability(partnerId),
    enabled: !!partnerId,
    staleTime: 5 * 60 * 1000,
  })
}

// Partner Blocked Dates Hook
export function usePartnerBlockedDates(partnerId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...partnerKeys.blockedDates(partnerId), { startDate, endDate }],
    queryFn: () => partnersService.getPartnerBlockedDates(partnerId, startDate, endDate),
    enabled: !!partnerId,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for availability)
  })
}

// Partner Services Hook
export function usePartnerServices(partnerId: string) {
  return useQuery({
    queryKey: partnerKeys.services(partnerId),
    queryFn: () => partnersService.getPartnerServices(partnerId),
    enabled: !!partnerId,
    staleTime: 5 * 60 * 1000,
  })
}

// Mutations
export function useCreatePartner() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreatePartnerData) => partnersService.createPartner(data),
    onSuccess: () => {
      // 🔥 SOLUÇÃO RADICAL: LIMPAR TUDO E RECARREGAR PÁGINA
      queryClient.clear()
      
      // 🚀 RELOAD COMPLETO PARA GARANTIR DADOS FRESCOS
      setTimeout(() => {
        window.location.reload()
      }, 500)
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar parceiro',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdatePartner() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerData }) =>
      partnersService.updatePartner(id, data),
    onSuccess: (updatedPartner, variables) => {
      // 🔥 SOLUÇÃO RADICAL: LIMPAR TUDO E RECARREGAR PÁGINA
      queryClient.clear()
      
      // 🚀 RELOAD COMPLETO PARA GARANTIR DADOS FRESCOS
      setTimeout(() => {
        window.location.reload()
      }, 500)
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar parceiro',
        variant: 'destructive',
      })
    },
  })
}

export function useDeletePartner() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => partnersService.deletePartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() })
      toast({
        title: 'Sucesso',
        description: 'Parceiro removido com sucesso',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover parceiro',
        variant: 'destructive',
      })
    },
  })
}

// Availability Mutations
export function useCreatePartnerAvailability() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ partnerId, data }: { partnerId: string; data: any }) =>
      partnersService.createPartnerAvailability(partnerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.availability(variables.partnerId) })
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(variables.partnerId) })
      toast({
        title: 'Sucesso',
        description: 'Disponibilidade criada com sucesso',
      })
    },
    // Remover onError para permitir tratamento customizado no componente
  })
}

export function useUpdatePartnerAvailability() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ availabilityId, data }: { availabilityId: string; data: any }) =>
      partnersService.updatePartnerAvailability(availabilityId, data),
    onSuccess: (updatedAvailability) => {
      // Invalidar cache da disponibilidade do parceiro
      const partnerId = updatedAvailability.partnerId
      queryClient.invalidateQueries({ queryKey: partnerKeys.availability(partnerId) })
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(partnerId) })
      toast({
        title: 'Sucesso',
        description: 'Disponibilidade atualizada com sucesso',
      })
    },
    // Remover onError para permitir tratamento customizado no componente
  })
}

export function useDeletePartnerAvailability() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ availabilityId, partnerId }: { availabilityId: string; partnerId: string }) =>
      partnersService.deletePartnerAvailability(availabilityId),
    onSuccess: (_, variables) => {
      // Invalidar cache da disponibilidade do parceiro
      queryClient.invalidateQueries({ queryKey: partnerKeys.availability(variables.partnerId) })
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(variables.partnerId) })
      toast({
        title: 'Sucesso',
        description: 'Disponibilidade removida com sucesso',
      })
    },
    // onError removido temporariamente para debug - o erro será tratado no componente
  })
}

// Blocked Dates Mutations
export function useCreatePartnerBlockedDate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ partnerId, data }: { partnerId: string; data: any }) =>
      partnersService.createPartnerBlockedDate(partnerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.blockedDates(variables.partnerId) })
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(variables.partnerId) })
      toast({
        title: 'Sucesso',
        description: 'Data bloqueada com sucesso',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao bloquear data',
        variant: 'destructive',
      })
    },
  })
}

// Services Association Mutations
export function useUpdatePartnerServices() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ partnerId, serviceIds }: { partnerId: string; serviceIds: string[] }) =>
      partnersService.updatePartnerServices(partnerId, serviceIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.services(variables.partnerId) })
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(variables.partnerId) })
      toast({
        title: 'Sucesso',
        description: 'Serviços do parceiro atualizados com sucesso',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar serviços',
        variant: 'destructive',
      })
    },
  })
}
