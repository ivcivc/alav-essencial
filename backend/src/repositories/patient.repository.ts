import { PrismaClient, Patient, Prisma } from '@prisma/client'
import { Patient as PatientEntity, PatientWithAppointments } from '../types/entities'

export interface PatientFilters {
  search?: string
  active?: boolean
  page?: number
  limit?: number
}

export interface PatientRepository {
  findAll(filters?: PatientFilters): Promise<Patient[]>
  findById(id: string): Promise<PatientWithAppointments | null>
  findByCpf(cpf: string): Promise<Patient | null>
  create(data: Omit<PatientEntity, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<Patient>
  update(id: string, data: Partial<Omit<PatientEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Patient>
  delete(id: string): Promise<void>
  count(filters?: Omit<PatientFilters, 'page' | 'limit'>): Promise<number>
}

export class PrismaPatientRepository implements PatientRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: PatientFilters = {}): Promise<Patient[]> {
    const { search, active, page = 1, limit = 10 } = filters
    
    const where: Prisma.PatientWhereInput = {}
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { whatsapp: { contains: search } },
        { phone: { contains: search } }
      ]
    }
    
    if (active !== undefined) {
      where.active = active
    }

    return this.prisma.patient.findMany({
      where,
      orderBy: { fullName: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    })
  }

  async findById(id: string): Promise<PatientWithAppointments | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            partner: true,
            productService: true,
            room: true
          },
          orderBy: { date: 'desc' }
        }
      }
    })

    return patient as PatientWithAppointments | null
  }

  async findByCpf(cpf: string): Promise<Patient | null> {
    return this.prisma.patient.findUnique({
      where: { cpf }
    })
  }

  async create(data: Omit<PatientEntity, 'id' | 'createdAt' | 'updatedAt' | 'active'>): Promise<Patient> {
    return this.prisma.patient.create({
      data: {
        ...data,
        active: true
      }
    })
  }

  async update(id: string, data: Partial<Omit<PatientEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Patient> {
    return this.prisma.patient.update({
      where: { id },
      data
    })
  }

  async delete(id: string): Promise<void> {
    // Soft delete - set active to false
    await this.prisma.patient.update({
      where: { id },
      data: { active: false }
    })
  }

  async count(filters: Omit<PatientFilters, 'page' | 'limit'> = {}): Promise<number> {
    const { search, active } = filters
    
    const where: Prisma.PatientWhereInput = {}
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { whatsapp: { contains: search } },
        { phone: { contains: search } }
      ]
    }
    
    if (active !== undefined) {
      where.active = active
    }

    return this.prisma.patient.count({ where })
  }
}