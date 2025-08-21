import { apiClient as api } from './api'
import type { 
  BackupConfig, 
  BackupHistory, 
  BackupStats, 
  CreateBackupConfigData,
  SchedulerStatus
} from '../types/backup'

export const backupService = {
  // ===============================
  // CONFIGURAÇÕES DE BACKUP
  // ===============================
  
  async getConfigs(): Promise<BackupConfig[]> {
    const response = await api.get('/api/backup/configs')
    return response.data
  },

  async getConfigById(id: string): Promise<BackupConfig> {
    const response = await api.get(`/api/backup/configs/${id}`)
    return response.data
  },

  async createConfig(data: CreateBackupConfigData): Promise<BackupConfig> {
    const response = await api.post('/api/backup/configs', data)
    return response.data
  },

  async updateConfig(id: string, data: Partial<CreateBackupConfigData>): Promise<BackupConfig> {
    const response = await api.put(`/api/backup/configs/${id}`, data)
    return response.data
  },

  async deleteConfig(id: string): Promise<void> {
    await api.delete(`/api/backup/configs/${id}`)
  },

  // ===============================
  // EXECUÇÃO DE BACKUPS
  // ===============================

  async executeBackup(configId: string): Promise<BackupHistory> {
    const response = await api.post(`/api/backup/execute/${configId}`)
    return response.data
  },

  async checkScheduledBackups(): Promise<void> {
    await api.post('/api/backup/check-scheduled')
  },

  // ===============================
  // HISTÓRICO E ESTATÍSTICAS
  // ===============================

  async getHistory(configId?: string): Promise<BackupHistory[]> {
    const params = configId ? { configId } : {}
    const response = await api.get('/api/backup/history', { params })
    return response.data
  },

  async getStats(): Promise<BackupStats> {
    const response = await api.get('/api/backup/stats')
    return response.data
  },

  // ===============================
  // RESTAURAÇÃO
  // ===============================

  async restoreBackup(backupId: string): Promise<void> {
    await api.post(`/api/backup/restore/${backupId}`)
  },

  // ===============================
  // DOWNLOAD
  // ===============================

  async downloadBackup(backupId: string): Promise<void> {
    // Para download de arquivos, vamos usar fetch diretamente
    const response = await fetch(`/api/backup/download/${backupId}`)
    
    if (!response.ok) {
      throw new Error('Erro ao fazer download do backup')
    }
    
    const blob = await response.blob()
    
    // Criar link para download
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Extrair nome do arquivo do header Content-Disposition se disponível
    const contentDisposition = response.headers.get('content-disposition')
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : `backup-${backupId}.sql`
      
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }
}
