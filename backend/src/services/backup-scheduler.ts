import cron from 'node-cron'
import { backupService } from './backup.service.js'

export class BackupScheduler {
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map()
  private isInitialized = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Agendar verificação de backups a cada hora
      this.scheduleBackupCheck()
      
      // Agendar limpeza de logs antigos diariamente às 2h
      this.scheduleCleanup()
      
      this.isInitialized = true
      console.log('📅 Agendador de backups inicializado')
      
      // Executar verificação inicial
      await this.checkScheduledBackups()
    } catch (error) {
      console.error('❌ Erro ao inicializar agendador de backups:', error)
    }
  }

  private scheduleBackupCheck(): void {
    // Executar a cada hora
    const task = cron.schedule('0 * * * *', async () => {
      console.log('⏰ Verificando backups agendados...')
      try {
        await backupService.checkScheduledBackups()
      } catch (error) {
        console.error('❌ Erro na verificação de backups agendados:', error)
      }
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    })

    this.scheduledTasks.set('backup-check', task)
    console.log('📅 Verificação de backups agendada para executar a cada hora')
  }

  private scheduleCleanup(): void {
    // Executar diariamente às 2h da manhã
    const task = cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Executando limpeza de logs antigos...')
      try {
        await this.cleanupOldLogs()
      } catch (error) {
        console.error('❌ Erro na limpeza de logs:', error)
      }
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    })

    this.scheduledTasks.set('cleanup', task)
    console.log('📅 Limpeza de logs agendada para executar diariamente às 2h')
  }

  private async cleanupOldLogs(): Promise<void> {
    // Implementar limpeza de logs antigos se necessário
    console.log('🧹 Limpeza de logs executada')
  }

  async checkScheduledBackups(): Promise<void> {
    try {
      await backupService.checkScheduledBackups()
    } catch (error) {
      console.error('❌ Erro ao verificar backups agendados:', error)
    }
  }

  // Métodos para controle manual
  async startScheduler(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    this.scheduledTasks.forEach(task => {
      if (!task.running) {
        task.start()
      }
    })

    console.log('▶️ Agendador de backups iniciado')
  }

  async stopScheduler(): Promise<void> {
    this.scheduledTasks.forEach(task => {
      if (task.running) {
        task.stop()
      }
    })

    console.log('⏸️ Agendador de backups pausado')
  }

  async destroyScheduler(): Promise<void> {
    this.scheduledTasks.forEach(task => {
      task.destroy()
    })

    this.scheduledTasks.clear()
    this.isInitialized = false
    
    console.log('🛑 Agendador de backups destruído')
  }

  getSchedulerStatus(): { 
    initialized: boolean
    activeTasks: number
    tasks: Array<{ name: string; running: boolean }>
  } {
    const tasks = Array.from(this.scheduledTasks.entries()).map(([name, task]) => ({
      name,
      running: task.running || false
    }))

    return {
      initialized: this.isInitialized,
      activeTasks: tasks.filter(t => t.running).length,
      tasks
    }
  }

  // Método para agendar backup específico
  async scheduleSpecificBackup(configId: string, cronExpression: string): Promise<void> {
    const taskName = `backup-${configId}`
    
    // Remover tarefa existente se houver
    if (this.scheduledTasks.has(taskName)) {
      const existingTask = this.scheduledTasks.get(taskName)!
      existingTask.destroy()
      this.scheduledTasks.delete(taskName)
    }

    // Criar nova tarefa
    const task = cron.schedule(cronExpression, async () => {
      console.log(`⏰ Executando backup agendado específico: ${configId}`)
      try {
        await backupService.executeBackup(configId)
      } catch (error) {
        console.error(`❌ Erro no backup agendado ${configId}:`, error)
      }
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    })

    this.scheduledTasks.set(taskName, task)
    console.log(`📅 Backup específico agendado: ${configId} - ${cronExpression}`)
  }

  // Método para remover agendamento específico
  async unscheduleSpecificBackup(configId: string): Promise<void> {
    const taskName = `backup-${configId}`
    
    if (this.scheduledTasks.has(taskName)) {
      const task = this.scheduledTasks.get(taskName)!
      task.destroy()
      this.scheduledTasks.delete(taskName)
      console.log(`📅 Agendamento removido: ${configId}`)
    }
  }
}

// Instância singleton
export const backupScheduler = new BackupScheduler()
