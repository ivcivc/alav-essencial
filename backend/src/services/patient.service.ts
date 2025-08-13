import { Patient } from '@prisma/client'
import { PatientRepository, PatientFilters } from '../repositories/patient.repository'
import { Patient as PatientEntity, PatientWithAppointments } from '../types/entities'

export interface CreatePatientData {
  fullName: string
  cpf: string
  birthDate: Date
  whatsapp?: string
  phone?: string
  email?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  observations?: string
}

export interface UpdatePatientData extends Partial<CreatePatientData> {
  active?: boolean
}

export interface PatientListResponse {
  patients: Patient[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class PatientService {
  constructor(private patientRepository: PatientRepository) {}

  async getAllPatients(filters: PatientFilters = {}): Promise<PatientListResponse> {
    const { page = 1, limit = 10 } = filters
    
    const [patients, total] = await Promise.all([
      this.patientRepository.findAll(filters),
      this.patientRepository.count(filters)
    ])

    return {
      patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getPatientById(id: string): Promise<PatientWithAppointments> {
    const patient = await this.patientRepository.findById(id)
    
    if (!patient) {
      throw new Error('Paciente não encontrado')
    }

    return patient
  }

  async createPatient(data: CreatePatientData): Promise<Patient> {
    // Check if CPF already exists
    const existingPatient = await this.patientRepository.findByCpf(data.cpf)
    if (existingPatient) {
      throw new Error('Já existe um paciente cadastrado com este CPF')
    }

    // Validate CPF format (basic validation)
    if (!/^\d{11}$/.test(data.cpf)) {
      throw new Error('CPF deve conter exatamente 11 dígitos')
    }

    return this.patientRepository.create(data)
  }

  async updatePatient(id: string, data: UpdatePatientData): Promise<Patient> {
    // Check if patient exists
    const existingPatient = await this.patientRepository.findById(id)
    if (!existingPatient) {
      throw new Error('Paciente não encontrado')
    }

    // If updating CPF, check if it's not already in use by another patient
    if (data.cpf && data.cpf !== existingPatient.cpf) {
      const patientWithCpf = await this.patientRepository.findByCpf(data.cpf)
      if (patientWithCpf && patientWithCpf.id !== id) {
        throw new Error('Já existe um paciente cadastrado com este CPF')
      }

      // Validate CPF format
      if (!/^\d{11}$/.test(data.cpf)) {
        throw new Error('CPF deve conter exatamente 11 dígitos')
      }
    }

    return this.patientRepository.update(id, data)
  }

  async deletePatient(id: string): Promise<void> {
    // Check if patient exists
    const existingPatient = await this.patientRepository.findById(id)
    if (!existingPatient) {
      throw new Error('Paciente não encontrado')
    }

    // Check if patient has appointments
    if (existingPatient.appointments && existingPatient.appointments.length > 0) {
      // Only soft delete if there are appointments
      await this.patientRepository.update(id, { active: false })
    } else {
      // Hard delete if no appointments
      await this.patientRepository.delete(id)
    }
  }

  async searchPatients(query: string, filters: Omit<PatientFilters, 'search'> = {}): Promise<PatientListResponse> {
    return this.getAllPatients({ ...filters, search: query })
  }

  async getActivePatients(filters: Omit<PatientFilters, 'active'> = {}): Promise<PatientListResponse> {
    return this.getAllPatients({ ...filters, active: true })
  }
}