import { PrismaClient, Appointment, Prisma } from '@prisma/client'
import { Appointment as AppointmentEntity, AppointmentWithRelations } from '../types/entities'
import { AppointmentStatus, AppointmentType } from '../types/shared'
import { convertPrismaAppointment } from '../utils/typeConverters'

export interface AppointmentFilters {
  patientId?: string
  partnerId?: string
  roomId?: string
  productServiceId?: string
  date?: Date
  startDate?: Date
  endDate?: Date
  status?: AppointmentStatus
  type?: AppointmentType
  active?: boolean
  page?: number
  limit?: number
}

export interface AppointmentRepository {
  findAll(filters?: AppointmentFilters): Promise<Appointment[]>
  findById(id: string): Promise<AppointmentWithRelations | null>
  findByPatientId(patientId: string, filters?: AppointmentFilters): Promise<Appointment[]>
  findByPartnerId(partnerId: string, filters?: AppointmentFilters): Promise<Appointment[]>
  findByRoomId(roomId: string, filters?: AppointmentFilters): Promise<Appointment[]>
  findByDateRange(startDate: Date, endDate: Date, filters?: Omit<AppointmentFilters, 'startDate' | 'endDate'>): Promise<AppointmentWithRelations[]>
  findConflicts(partnerId: string, roomId: string | undefined, date: Date, startTime: string, endTime: string, excludeId?: string): Promise<Appointment[]>
  create(data: Omit<AppointmentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>
  update(id: string, data: Partial<Omit<AppointmentEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Appointment>
  delete(id: string): Promise<void>
  cancel(id: string, reason: string): Promise<Appointment>
  checkIn(id: string): Promise<Appointment>
  checkOut(id: string): Promise<Appointment>
  count(filters?: AppointmentFilters): Promise<number>
}

export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private prisma: PrismaClient) {}

  private buildWhereClause(filters: AppointmentFilters = {}): Prisma.AppointmentWhereInput {
    const where: Prisma.AppointmentWhereInput = {}

    if (filters.patientId) {
      where.patientId = filters.patientId
    }

    if (filters.partnerId) {
      where.partnerId = filters.partnerId
    }

    if (filters.roomId) {
      where.roomId = filters.roomId
    }

    if (filters.productServiceId) {
      where.productServiceId = filters.productServiceId
    }

    if (filters.date) {
      where.date = filters.date
    }

    if (filters.startDate && filters.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate
      }
    } else if (filters.startDate) {
      where.date = {
        gte: filters.startDate
      }
    } else if (filters.endDate) {
      where.date = {
        lte: filters.endDate
      }
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.type) {
      where.type = filters.type
    }

    return where
  }

  async findAll(filters: AppointmentFilters = {}): Promise<Appointment[]> {
    const { page = 1, limit = 50 } = filters
    const skip = (page - 1) * limit

    return this.prisma.appointment.findMany({
      where: this.buildWhereClause(filters),
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      skip,
      take: limit
    })
  }

  async findById(id: string): Promise<AppointmentWithRelations | null> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        partner: {
          include: {
            availability: {
              where: { active: true },
              orderBy: { dayOfWeek: 'asc' }
            }
          }
        },
        productService: {
          include: {
            category: true
          }
        },
        room: true
      }
    })

    return appointment as AppointmentWithRelations | null
  }

  async findByPatientId(patientId: string, filters: AppointmentFilters = {}): Promise<Appointment[]> {
    return this.findAll({ ...filters, patientId })
  }

  async findByPartnerId(partnerId: string, filters: AppointmentFilters = {}): Promise<Appointment[]> {
    return this.findAll({ ...filters, partnerId })
  }

  async findByRoomId(roomId: string, filters: AppointmentFilters = {}): Promise<Appointment[]> {
    return this.findAll({ ...filters, roomId })
  }

  async findByDateRange(startDate: Date, endDate: Date, filters: Omit<AppointmentFilters, 'startDate' | 'endDate'> = {}): Promise<AppointmentWithRelations[]> {
    const { page = 1, limit = 200 } = filters
    const skip = (page - 1) * limit

    const appointments = await this.prisma.appointment.findMany({
      where: this.buildWhereClause({ ...filters, startDate, endDate }),
      include: {
        patient: true,
        partner: true,
        productService: {
          include: {
            category: true
          }
        },
        room: true
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      skip,
      take: limit
    })

    return appointments as AppointmentWithRelations[]
  }

  async findConflicts(
    partnerId: string,
    roomId: string | undefined,
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<Appointment[]> {
    const where: Prisma.AppointmentWhereInput = {
      date,
      status: {
        not: 'CANCELLED'
      },
      OR: [
        // Partner conflict
        { partnerId },
        // Room conflict (if room is specified)
        ...(roomId ? [{ roomId }] : [])
      ],
      // Time overlap conditions
      AND: [
        {
          OR: [
            // New appointment starts during existing appointment
            {
              startTime: { lte: startTime },
              endTime: { gt: startTime }
            },
            // New appointment ends during existing appointment
            {
              startTime: { lt: endTime },
              endTime: { gte: endTime }
            },
            // New appointment contains existing appointment
            {
              startTime: { gte: startTime },
              endTime: { lte: endTime }
            },
            // Existing appointment contains new appointment
            {
              startTime: { lte: startTime },
              endTime: { gte: endTime }
            }
          ]
        }
      ]
    }

    // Exclude specific appointment if updating
    if (excludeId) {
      where.id = { not: excludeId }
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        partner: true,
        productService: true,
        room: true
      }
    })
  }

  async create(data: Omit<AppointmentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    return this.prisma.appointment.create({
      data: {
        patientId: data.patientId,
        partnerId: data.partnerId,
        productServiceId: data.productServiceId,
        roomId: data.roomId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type,
        status: data.status || 'SCHEDULED',
        observations: data.observations
      }
    })
  }

  async update(id: string, data: Partial<Omit<AppointmentEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Appointment> {
    return this.prisma.appointment.update({
      where: { id },
      data
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.appointment.delete({
      where: { id }
    })
  }

  async cancel(id: string, reason: string): Promise<Appointment> {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason
      }
    })
  }

  async checkIn(id: string): Promise<Appointment> {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        checkIn: new Date()
      }
    })
  }

  async checkOut(id: string): Promise<Appointment> {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        checkOut: new Date()
      }
    })
  }

  async count(filters: AppointmentFilters = {}): Promise<number> {
    return this.prisma.appointment.count({
      where: this.buildWhereClause(filters)
    })
  }

  async findByPartnerAndPeriod(
    partnerId: string,
    startDate: Date,
    endDate: Date,
    filters?: {
      status?: string
      productServiceId?: string
    }
  ): Promise<AppointmentWithRelations[]> {
    const whereConditions: any = {
      partnerId,
      date: {
        gte: startDate,
        lte: endDate
      }
    }

    if (filters?.status) {
      whereConditions.status = filters.status
    }

    if (filters?.productServiceId) {
      whereConditions.productServiceId = filters.productServiceId
    }

    const appointments = await this.prisma.appointment.findMany({
      where: whereConditions,
      include: {
        patient: true,
        partner: true,
        productService: {
          include: {
            category: true
          }
        },
        room: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    return appointments.map(convertPrismaAppointment)
  }

  async getPartnerRevenue(
    partnerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalAppointments: number
    totalRevenue: number
    averagePerAppointment: number
  }> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        partnerId,
        date: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        productService: true
      }
    })

    const totalAppointments = appointments.length
    const totalRevenue = appointments.reduce((sum, apt) => {
      return sum + Number(apt.productService?.salePrice || 0)
    }, 0)

    const averagePerAppointment = totalAppointments > 0 ? totalRevenue / totalAppointments : 0

    return {
      totalAppointments,
      totalRevenue,
      averagePerAppointment
    }
  }
}
