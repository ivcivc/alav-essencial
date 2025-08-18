import { PrismaClient } from '@prisma/client'
import {
  NotificationConfiguration,
  NotificationTemplate,
  NotificationSchedule,
  NotificationLog,
  NotificationTemplateWithSchedules,
  NotificationScheduleWithRelations,
  NotificationLogWithRelations
} from '../types/entities'
import {
  NotificationChannel,
  NotificationReminderType,
  NotificationStatus
} from '../types/shared'

// 🔔 INTERFACES DOS REPOSITÓRIOS

export interface NotificationConfigurationRepository {
  findFirst(): Promise<NotificationConfiguration | null>
  findById(id: string): Promise<NotificationConfiguration | null>
  create(data: Omit<NotificationConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationConfiguration>
  update(id: string, data: Partial<Omit<NotificationConfiguration, 'id' | 'createdAt' | 'updatedAt'>>): Promise<NotificationConfiguration>
}

export interface NotificationTemplateRepository {
  findAll(filters?: { channel?: NotificationChannel; type?: NotificationReminderType; active?: boolean }): Promise<NotificationTemplate[]>
  findById(id: string): Promise<NotificationTemplateWithSchedules | null>
  findByTypeAndChannel(type: NotificationReminderType, channel: NotificationChannel): Promise<NotificationTemplate | null>
  create(data: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate>
  update(id: string, data: Partial<Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<NotificationTemplate>
  delete(id: string): Promise<void>
}

export interface NotificationScheduleRepository {
  findAll(filters?: { status?: NotificationStatus; appointmentId?: string; scheduledBefore?: Date }): Promise<NotificationScheduleWithRelations[]>
  findById(id: string): Promise<NotificationScheduleWithRelations | null>
  findByAppointmentId(appointmentId: string): Promise<NotificationSchedule[]>
  findPendingSchedules(): Promise<NotificationScheduleWithRelations[]>
  create(data: Omit<NotificationSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationSchedule>
  update(id: string, data: Partial<Omit<NotificationSchedule, 'id' | 'createdAt' | 'updatedAt'>>): Promise<NotificationSchedule>
  updateStatus(id: string, status: NotificationStatus, errorMessage?: string): Promise<NotificationSchedule>
  delete(id: string): Promise<void>
  deleteByAppointmentId(appointmentId: string): Promise<void>
}

export interface NotificationLogRepository {
  findAll(filters?: { 
    appointmentId?: string; 
    channel?: NotificationChannel; 
    status?: NotificationStatus;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ logs: NotificationLogWithRelations[]; total: number }>
  findById(id: string): Promise<NotificationLogWithRelations | null>
  findByAppointmentId(appointmentId: string): Promise<NotificationLog[]>
  create(data: Omit<NotificationLog, 'id' | 'createdAt' | 'updatedAt' | 'sentAt'>): Promise<NotificationLog>
  updateStatus(id: string, status: NotificationStatus, deliveredAt?: Date, readAt?: Date): Promise<NotificationLog>
}

// 🔔 IMPLEMENTAÇÕES COM PRISMA

export class PrismaNotificationConfigurationRepository implements NotificationConfigurationRepository {
  constructor(private prisma: PrismaClient) {}

  async findFirst(): Promise<NotificationConfiguration | null> {
    const config = await this.prisma.notificationConfiguration.findFirst()
    return config as NotificationConfiguration | null
  }

  async findById(id: string): Promise<NotificationConfiguration | null> {
    const config = await this.prisma.notificationConfiguration.findUnique({
      where: { id }
    })
    return config as NotificationConfiguration | null
  }

  async create(data: Omit<NotificationConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationConfiguration> {
    const config = await this.prisma.notificationConfiguration.create({
      data
    })
    return config as NotificationConfiguration
  }

  async update(id: string, data: Partial<Omit<NotificationConfiguration, 'id' | 'createdAt' | 'updatedAt'>>): Promise<NotificationConfiguration> {
    const config = await this.prisma.notificationConfiguration.update({
      where: { id },
      data
    })
    return config as NotificationConfiguration
  }
}

export class PrismaNotificationTemplateRepository implements NotificationTemplateRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: { channel?: NotificationChannel; type?: NotificationReminderType; active?: boolean } = {}): Promise<NotificationTemplate[]> {
    const where: any = {}
    
    if (filters.channel) where.channel = filters.channel
    if (filters.type) where.type = filters.type
    if (filters.active !== undefined) where.active = filters.active

    const templates = await this.prisma.notificationTemplate.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { channel: 'asc' }
      ]
    })
    return templates as NotificationTemplate[]
  }

  async findById(id: string): Promise<NotificationTemplateWithSchedules | null> {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id },
      include: {
        notificationSchedules: true
      }
    })
    return template as NotificationTemplateWithSchedules | null
  }

  async findByTypeAndChannel(type: NotificationReminderType, channel: NotificationChannel): Promise<NotificationTemplate | null> {
    const template = await this.prisma.notificationTemplate.findFirst({
      where: {
        type,
        channel,
        active: true
      }
    })
    return template as NotificationTemplate | null
  }

  async create(data: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> {
    const template = await this.prisma.notificationTemplate.create({
      data
    })
    return template as NotificationTemplate
  }

  async update(id: string, data: Partial<Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<NotificationTemplate> {
    const template = await this.prisma.notificationTemplate.update({
      where: { id },
      data
    })
    return template as NotificationTemplate
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notificationTemplate.delete({
      where: { id }
    })
  }
}

export class PrismaNotificationScheduleRepository implements NotificationScheduleRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: { status?: NotificationStatus; appointmentId?: string; scheduledBefore?: Date } = {}): Promise<NotificationScheduleWithRelations[]> {
    const where: any = {}
    
    if (filters.status) where.status = filters.status
    if (filters.appointmentId) where.appointmentId = filters.appointmentId
    if (filters.scheduledBefore) where.scheduledFor = { lte: filters.scheduledBefore }

    const schedules = await this.prisma.notificationSchedule.findMany({
      where,
      include: {
        appointment: {
          include: {
            patient: true,
            partner: true,
            productService: true,
            room: true
          }
        },
        template: true
      },
      orderBy: { scheduledFor: 'asc' }
    })
    return schedules as NotificationScheduleWithRelations[]
  }

  async findById(id: string): Promise<NotificationScheduleWithRelations | null> {
    const schedule = await this.prisma.notificationSchedule.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            patient: true,
            partner: true,
            productService: true,
            room: true
          }
        },
        template: true
      }
    })
    return schedule as NotificationScheduleWithRelations | null
  }

  async findByAppointmentId(appointmentId: string): Promise<NotificationSchedule[]> {
    const schedules = await this.prisma.notificationSchedule.findMany({
      where: { appointmentId }
    })
    return schedules as NotificationSchedule[]
  }

  async findPendingSchedules(): Promise<NotificationScheduleWithRelations[]> {
    const now = new Date()
    const schedules = await this.prisma.notificationSchedule.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: now }
      },
      include: {
        appointment: {
          include: {
            patient: true,
            partner: true,
            productService: true,
            room: true
          }
        },
        template: true
      },
      orderBy: { scheduledFor: 'asc' }
    })
    return schedules as NotificationScheduleWithRelations[]
  }

  async create(data: Omit<NotificationSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationSchedule> {
    const schedule = await this.prisma.notificationSchedule.create({
      data
    })
    return schedule as NotificationSchedule
  }

  async update(id: string, data: Partial<Omit<NotificationSchedule, 'id' | 'createdAt' | 'updatedAt'>>): Promise<NotificationSchedule> {
    const schedule = await this.prisma.notificationSchedule.update({
      where: { id },
      data
    })
    return schedule as NotificationSchedule
  }

  async updateStatus(id: string, status: NotificationStatus, errorMessage?: string): Promise<NotificationSchedule> {
    const updateData: any = { 
      status,
      lastAttempt: new Date()
    }

    if (errorMessage) updateData.errorMessage = errorMessage
    if (status === 'FAILED') {
      // Incrementar retry count
      const current = await this.prisma.notificationSchedule.findUnique({
        where: { id },
        select: { retryCount: true }
      })
      if (current) {
        updateData.retryCount = current.retryCount + 1
      }
    }

    const schedule = await this.prisma.notificationSchedule.update({
      where: { id },
      data: updateData
    })
    return schedule as NotificationSchedule
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notificationSchedule.delete({
      where: { id }
    })
  }

  async deleteByAppointmentId(appointmentId: string): Promise<void> {
    await this.prisma.notificationSchedule.deleteMany({
      where: { appointmentId }
    })
  }
}

export class PrismaNotificationLogRepository implements NotificationLogRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: { 
    appointmentId?: string; 
    channel?: NotificationChannel; 
    status?: NotificationStatus;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  } = {}): Promise<{ logs: NotificationLogWithRelations[]; total: number }> {
    const { page = 1, limit = 50, ...otherFilters } = filters
    const skip = (page - 1) * limit

    const where: any = {}
    if (otherFilters.appointmentId) where.appointmentId = otherFilters.appointmentId
    if (otherFilters.channel) where.channel = otherFilters.channel
    if (otherFilters.status) where.status = otherFilters.status
    if (otherFilters.dateFrom || otherFilters.dateTo) {
      where.sentAt = {}
      if (otherFilters.dateFrom) where.sentAt.gte = otherFilters.dateFrom
      if (otherFilters.dateTo) where.sentAt.lte = otherFilters.dateTo
    }

    const [logs, total] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where,
        include: {
          appointment: {
            include: {
              patient: true,
              partner: true,
              productService: true,
              room: true
            }
          }
        },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.notificationLog.count({ where })
    ])

    return {
      logs: logs as NotificationLogWithRelations[],
      total
    }
  }

  async findById(id: string): Promise<NotificationLogWithRelations | null> {
    const log = await this.prisma.notificationLog.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            patient: true,
            partner: true,
            productService: true,
            room: true
          }
        }
      }
    })
    return log as NotificationLogWithRelations | null
  }

  async findByAppointmentId(appointmentId: string): Promise<NotificationLog[]> {
    const logs = await this.prisma.notificationLog.findMany({
      where: { appointmentId },
      orderBy: { sentAt: 'desc' }
    })
    return logs as NotificationLog[]
  }

  async create(data: Omit<NotificationLog, 'id' | 'createdAt' | 'updatedAt' | 'sentAt'>): Promise<NotificationLog> {
    const log = await this.prisma.notificationLog.create({
      data: {
        ...data,
        sentAt: new Date()
      }
    })
    return log as NotificationLog
  }

  async updateStatus(id: string, status: NotificationStatus, deliveredAt?: Date, readAt?: Date): Promise<NotificationLog> {
    const updateData: any = { status }
    if (deliveredAt) updateData.deliveredAt = deliveredAt
    if (readAt) updateData.readAt = readAt

    const log = await this.prisma.notificationLog.update({
      where: { id },
      data: updateData
    })
    return log as NotificationLog
  }
}
