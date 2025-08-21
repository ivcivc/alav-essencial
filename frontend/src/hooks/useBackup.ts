import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { backupService } from '../services/backup'
import type { CreateBackupConfigData } from '../types/backup'
import { useToast } from './useToast'

// Query keys
export const backupKeys = {
  all: ['backup'] as const,
  configs: () => [...backupKeys.all, 'configs'] as const,
  config: (id: string) => [...backupKeys.configs(), id] as const,
  history: () => [...backupKeys.all, 'history'] as const,
  historyByConfig: (configId: string) => [...backupKeys.history(), configId] as const,
  stats: () => [...backupKeys.all, 'stats'] as const,
}

// ===============================
// HOOKS PARA CONFIGURAÇÕES
// ===============================

export function useBackupConfigs() {
  return useQuery({
    queryKey: backupKeys.configs(),
    queryFn: () => backupService.getConfigs(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export function useBackupConfig(id: string) {
  return useQuery({
    queryKey: backupKeys.config(id),
    queryFn: () => backupService.getConfigById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateBackupConfig() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateBackupConfigData) => backupService.createConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.configs() })
      toast({
        title: "Sucesso",
        description: "Configuração de backup criada com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao criar configuração de backup",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateBackupConfig() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBackupConfigData> }) =>
      backupService.updateConfig(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: backupKeys.configs() })
      queryClient.invalidateQueries({ queryKey: backupKeys.config(id) })
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao atualizar configuração",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteBackupConfig() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => backupService.deleteConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.configs() })
      toast({
        title: "Sucesso",
        description: "Configuração removida com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao remover configuração",
        variant: "destructive",
      })
    },
  })
}

// ===============================
// HOOKS PARA EXECUÇÃO
// ===============================

export function useExecuteBackup() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (configId: string) => backupService.executeBackup(configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.history() })
      queryClient.invalidateQueries({ queryKey: backupKeys.stats() })
      queryClient.invalidateQueries({ queryKey: backupKeys.configs() })
      toast({
        title: "Sucesso",
        description: "Backup executado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao executar backup",
        variant: "destructive",
      })
    },
  })
}

export function useCheckScheduledBackups() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => backupService.checkScheduledBackups(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.history() })
      queryClient.invalidateQueries({ queryKey: backupKeys.stats() })
      queryClient.invalidateQueries({ queryKey: backupKeys.configs() })
      toast({
        title: "Sucesso",
        description: "Verificação de backups agendados executada",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao verificar backups agendados",
        variant: "destructive",
      })
    },
  })
}

// ===============================
// HOOKS PARA HISTÓRICO
// ===============================

export function useBackupHistory(configId?: string) {
  return useQuery({
    queryKey: configId ? backupKeys.historyByConfig(configId) : backupKeys.history(),
    queryFn: () => backupService.getHistory(configId),
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export function useBackupStats() {
  return useQuery({
    queryKey: backupKeys.stats(),
    queryFn: () => backupService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// ===============================
// HOOKS PARA RESTAURAÇÃO
// ===============================

export function useRestoreBackup() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (backupId: string) => backupService.restoreBackup(backupId),
    onSuccess: () => {
      // Invalidar todas as queries pois os dados foram restaurados
      queryClient.invalidateQueries()
      toast({
        title: "Sucesso",
        description: "Backup restaurado com sucesso",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao restaurar backup",
        variant: "destructive",
      })
    },
  })
}

export function useDownloadBackup() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (backupId: string) => backupService.downloadBackup(backupId),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Download do backup iniciado",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao fazer download do backup",
        variant: "destructive",
      })
    },
  })
}
