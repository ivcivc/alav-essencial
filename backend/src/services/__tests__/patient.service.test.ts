import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PatientService, CreatePatientData, UpdatePatientData } from '../patient.service'
import { PatientRepository } from '../../repositories/patient.repository'

// Mock do repository
const mockPatientRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByCpf: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
} as jest.Mocked<PatientRepository>

describe('PatientService', () => {
  let patientService: PatientService

  beforeEach(() => {
    vi.clearAllMocks()
    patientService = new PatientService(mockPatientRepository)
  })

  describe('getAllPatients', () => {
    it('should return paginated list of patients', async () => {
      const mockPatients = [
        {
          id: '1',
          fullName: 'João Silva',
          cpf: '12345678901',
          birthDate: new Date('1990-01-01'),
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          fullName: 'Maria Santos',
          cpf: '98765432100',
          birthDate: new Date('1985-05-15'),
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPatientRepository.findAll.mockResolvedValue(mockPatients)
      mockPatientRepository.count.mockResolvedValue(2)

      const result = await patientService.getAllPatients({ page: 1, limit: 10 })

      expect(result).toEqual({
        patients: mockPatients,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      })

      expect(mockPatientRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 })
      expect(mockPatientRepository.count).toHaveBeenCalledWith({ page: 1, limit: 10 })
    })

    it('should handle search filters', async () => {
      const filters = { search: 'João', page: 1, limit: 5 }
      mockPatientRepository.findAll.mockResolvedValue([])
      mockPatientRepository.count.mockResolvedValue(0)

      await patientService.getAllPatients(filters)

      expect(mockPatientRepository.findAll).toHaveBeenCalledWith(filters)
      expect(mockPatientRepository.count).toHaveBeenCalledWith(filters)
    })
  })

  describe('getPatientById', () => {
    it('should return patient when found', async () => {
      const mockPatient = {
        id: '1',
        fullName: 'João Silva',
        cpf: '12345678901',
        birthDate: new Date('1990-01-01'),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPatientRepository.findById.mockResolvedValue(mockPatient)

      const result = await patientService.getPatientById('1')

      expect(result).toEqual(mockPatient)
      expect(mockPatientRepository.findById).toHaveBeenCalledWith('1')
    })

    it('should throw error when patient not found', async () => {
      mockPatientRepository.findById.mockResolvedValue(null)

      await expect(patientService.getPatientById('999')).rejects.toThrow('Paciente não encontrado')

      expect(mockPatientRepository.findById).toHaveBeenCalledWith('999')
    })
  })

  describe('createPatient', () => {
    it('should create a new patient', async () => {
      const patientData: CreatePatientData = {
        fullName: 'Novo Paciente',
        cpf: '11122233344',
        birthDate: new Date('1995-03-20'),
        email: 'novo@example.com',
        phone: '11999999999',
      }

      const createdPatient = {
        id: '3',
        ...patientData,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPatientRepository.create.mockResolvedValue(createdPatient)

      const result = await patientService.createPatient(patientData)

      expect(result).toEqual(createdPatient)
      expect(mockPatientRepository.create).toHaveBeenCalledWith(patientData)
    })

    it('should throw error if CPF already exists', async () => {
      const patientData: CreatePatientData = {
        fullName: 'Paciente Duplicado',
        cpf: '12345678901',
        birthDate: new Date('1990-01-01'),
      }

      mockPatientRepository.findByCpf.mockResolvedValue({
        id: '1',
        fullName: 'João Silva',
        cpf: '12345678901',
        birthDate: new Date('1990-01-01'),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await expect(patientService.createPatient(patientData)).rejects.toThrow(
        'Já existe um paciente cadastrado com este CPF'
      )

      expect(mockPatientRepository.findByCpf).toHaveBeenCalledWith('12345678901')
      expect(mockPatientRepository.create).not.toHaveBeenCalled()
    })
  })

  describe('updatePatient', () => {
    it('should update existing patient', async () => {
      const patientId = '1'
      const updateData: UpdatePatientData = {
        fullName: 'João Silva Atualizado',
        email: 'joao.novo@example.com',
      }

      const existingPatient = {
        id: patientId,
        fullName: 'João Silva',
        cpf: '12345678901',
        birthDate: new Date('1990-01-01'),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedPatient = {
        id: patientId,
        fullName: 'João Silva Atualizado',
        cpf: '12345678901',
        birthDate: new Date('1990-01-01'),
        email: 'joao.novo@example.com',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPatientRepository.findById.mockResolvedValue(existingPatient)
      mockPatientRepository.update.mockResolvedValue(updatedPatient)

      const result = await patientService.updatePatient(patientId, updateData)

      expect(result).toEqual(updatedPatient)
      expect(mockPatientRepository.findById).toHaveBeenCalledWith(patientId)
      expect(mockPatientRepository.update).toHaveBeenCalledWith(patientId, updateData)
    })
  })

  describe('deletePatient', () => {
    it('should soft delete patient by setting active to false', async () => {
      const patientId = '1'
      const existingPatient = {
        id: patientId,
        fullName: 'João Silva',
        cpf: '12345678901',
        birthDate: new Date('1990-01-01'),
        active: true,
        appointments: [{ id: 'appt1' }], // Has appointments, so will soft delete
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPatientRepository.findById.mockResolvedValue(existingPatient)
      mockPatientRepository.update.mockResolvedValue(existingPatient)

      await patientService.deletePatient(patientId)

      expect(mockPatientRepository.findById).toHaveBeenCalledWith(patientId)
      expect(mockPatientRepository.update).toHaveBeenCalledWith(patientId, { active: false })
    })
  })
})
