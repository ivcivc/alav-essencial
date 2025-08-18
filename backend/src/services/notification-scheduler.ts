import cron from 'node-cron'
import { PrismaClient } from '@prisma/client'
import { NotificationService } from './notification.service'

// 🔄 AGENDADOR AUTOMÁTICO DE NOTIFICAÇÕES

export class NotificationScheduler {
  private notificationService: NotificationService
  private isRunning: boolean = false
  private cronJob: cron.ScheduledTask | null = null

  constructor(prisma: PrismaClient) {
    this.notificationService = new NotificationService(prisma)
  }

  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Agendador de notificações já está em execução')
      return
    }

    // Executar a cada 5 minutos
    this.cronJob = cron.schedule('*/5 * * * *', async () => {
      await this.processNotifications()
    }, {
      scheduled: false
    })

    this.cronJob.start()
    this.isRunning = true

    console.log('🚀 Agendador de notificações iniciado (executa a cada 5 minutos)')
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop()
      this.cronJob = null
    }
    this.isRunning = false
    console.log('🛑 Agendador de notificações parado')
  }

  async processNotifications(): Promise<void> {
    try {
      const startTime = Date.now()
      console.log('🔄 Iniciando processamento de notificações agendadas...')

      await this.notificationService.processScheduledNotifications()

      const duration = Date.now() - startTime
      console.log(`✅ Processamento concluído em ${duration}ms`)

    } catch (error) {
      console.error('❌ Erro no processamento de notificações:', error)
    }
  }

  // Método para execução manual (útil para testes)
  async processNow(): Promise<void> {
    await this.processNotifications()
  }

  getStatus(): { isRunning: boolean; nextExecution?: Date } {
    return {
      isRunning: this.isRunning,
      nextExecution: this.cronJob ? new Date(Date.now() + 5 * 60 * 1000) : undefined // Próximos 5 minutos
    }
  }
}

// 🔧 SINGLETON PARA USO GLOBAL

export class NotificationSchedulerSingleton {
  private static instance: NotificationScheduler | null = null

  static getInstance(prisma: PrismaClient): NotificationScheduler {
    if (!this.instance) {
      this.instance = new NotificationScheduler(prisma)
    }
    return this.instance
  }

  static start(prisma: PrismaClient): void {
    const scheduler = this.getInstance(prisma)
    scheduler.start()
  }

  static stop(): void {
    if (this.instance) {
      this.instance.stop()
    }
  }

  static async processNow(prisma: PrismaClient): Promise<void> {
    const scheduler = this.getInstance(prisma)
    await scheduler.processNow()
  }
}
