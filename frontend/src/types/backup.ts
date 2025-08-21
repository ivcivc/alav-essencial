export interface BackupConfig {
  id: string
  name: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  enabled: boolean
  retentionDays: number
  includeFiles: boolean
  includeDatabase: boolean
  notifyOnSuccess: boolean
  notifyOnFailure: boolean
  lastBackup?: string
  nextBackup?: string
  createdAt: string
  updatedAt: string
}

export interface BackupHistory {
  id: string
  configId: string
  filename: string
  filepath: string
  size: number
  type: 'DATABASE' | 'FILES' | 'FULL'
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS'
  startedAt: string
  completedAt?: string
  errorMessage?: string
  checksum?: string
}

export interface BackupStats {
  totalBackups: number
  successfulBackups: number
  failedBackups: number
  totalSize: number
  oldestBackup?: string
  newestBackup?: string
}

export interface CreateBackupConfigData {
  name: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  enabled?: boolean
  retentionDays: number
  includeFiles?: boolean
  includeDatabase?: boolean
  notifyOnSuccess?: boolean
  notifyOnFailure?: boolean
}

export interface SchedulerStatus {
  initialized: boolean
  activeTasks: number
  tasks: Array<{ name: string; running: boolean }>
}
