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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() })
      toast({
        title: 'Sucesso',
        description: 'Parceiro criado com sucesso',
      })
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() })
      toast({
        title: 'Sucesso',
        description: 'Parceiro atualizado com sucesso',
      })
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
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar disponibilidade',
        variant: 'destructive',
      })
    },
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
