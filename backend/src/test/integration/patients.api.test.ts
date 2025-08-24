import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestApp, teardownTestApp, cleanupTestData, createTestPatient, createAuthToken, TestContext } from './setup'

describe('Patients API Integration Tests', () => {
  let context: TestContext
  let authToken: string

  beforeAll(async () => {
    context = await setupTestApp()
    authToken = await createAuthToken(context.app)
  })

  afterAll(async () => {
    await teardownTestApp(context)
  })

  beforeEach(async () => {
    await cleanupTestData(context.prisma)
  })

  describe('POST /api/patients', () => {
    it('should create a new patient with valid data', async () => {
      const patientData = createTestPatient()

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: patientData
      })

      expect(response.statusCode).toBe(201)
      
      const result = JSON.parse(response.body)
      expect(result).toHaveProperty('id')
      expect(result.fullName).toBe(patientData.fullName)
      expect(result.cpf).toBe(patientData.cpf)
      expect(result.email).toBe(patientData.email)
      expect(result.active).toBe(true)
    })

    it('should return 400 for invalid CPF', async () => {
      const patientData = {
        ...createTestPatient(),
        cpf: 'invalid-cpf'
      }

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: patientData
      })

      expect(response.statusCode).toBe(400)
      
      const result = JSON.parse(response.body)
      expect(result).toHaveProperty('error')
    })

    it('should return 409 for duplicate CPF', async () => {
      const patientData = createTestPatient()

      // Criar primeiro paciente
      await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: patientData
      })

      // Tentar criar segundo paciente com mesmo CPF
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: patientData
      })

      expect(response.statusCode).toBe(409)
      
      const result = JSON.parse(response.body)
      expect(result.error).toContain('CPF')
    })

    it('should return 401 without authentication', async () => {
      const patientData = createTestPatient()

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        payload: patientData
      })

      expect(response.statusCode).toBe(401)
    })
  })

  describe('GET /api/patients', () => {
    it('should return paginated list of patients', async () => {
      // Criar alguns pacientes de teste
      const patient1 = createTestPatient()
      const patient2 = { ...createTestPatient(), fullName: 'Test Patient 2', cpf: '98765432100' }

      await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: patient1
      })

      await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: patient2
      })

      // Buscar pacientes
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/patients?page=1&limit=10',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      })

      expect(response.statusCode).toBe(200)
      
      const result = JSON.parse(response.body)
      expect(result).toHaveProperty('patients')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('page')
      expect(result).toHaveProperty('limit')
      expect(result.patients).toHaveLength(2)
    })

    it('should filter patients by search term', async () => {
      const patient1 = createTestPatient()
      const patient2 = { ...createTestPatient(), fullName: 'Another Test Patient', cpf: '98765432100' }

      await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: patient1
      })

      await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: patient2
      })

      // Buscar com filtro
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/patients?search=Another',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      })

      expect(response.statusCode).toBe(200)
      
      const result = JSON.parse(response.body)
      expect(result.patients).toHaveLength(1)
      expect(result.patients[0].fullName).toContain('Another')
    })
  })

  describe('GET /api/patients/:id', () => {
    it('should return specific patient by ID', async () => {
      // Criar paciente
      const patientData = createTestPatient()
      const createResponse = await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: patientData
      })

      const createdPatient = JSON.parse(createResponse.body)

      // Buscar por ID
      const response = await context.app.inject({
        method: 'GET',
        url: `/api/patients/${createdPatient.id}`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      })

      expect(response.statusCode).toBe(200)
      
      const result = JSON.parse(response.body)
      expect(result.id).toBe(createdPatient.id)
      expect(result.fullName).toBe(patientData.fullName)
    })

    it('should return 404 for non-existent patient', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/patients/non-existent-id',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      })

      expect(response.statusCode).toBe(404)
    })
  })

  describe('PUT /api/patients/:id', () => {
    it('should update existing patient', async () => {
      // Criar paciente
      const patientData = createTestPatient()
      const createResponse = await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: patientData
      })

      const createdPatient = JSON.parse(createResponse.body)

      // Atualizar paciente
      const updateData = {
        fullName: 'Updated Test Patient',
        email: 'updated@integration.com'
      }

      const response = await context.app.inject({
        method: 'PUT',
        url: `/api/patients/${createdPatient.id}`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: updateData
      })

      expect(response.statusCode).toBe(200)
      
      const result = JSON.parse(response.body)
      expect(result.fullName).toBe(updateData.fullName)
      expect(result.email).toBe(updateData.email)
      expect(result.cpf).toBe(patientData.cpf) // CPF não deve mudar
    })
  })

  describe('DELETE /api/patients/:id', () => {
    it('should soft delete patient', async () => {
      // Criar paciente
      const patientData = createTestPatient()
      const createResponse = await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: { authorization: `Bearer ${authToken}` },
        payload: patientData
      })

      const createdPatient = JSON.parse(createResponse.body)

      // Deletar paciente
      const response = await context.app.inject({
        method: 'DELETE',
        url: `/api/patients/${createdPatient.id}`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      })

      expect(response.statusCode).toBe(204)

      // Verificar que paciente foi marcado como inativo
      const checkResponse = await context.app.inject({
        method: 'GET',
        url: `/api/patients/${createdPatient.id}`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      })

      const result = JSON.parse(checkResponse.body)
      expect(result.active).toBe(false)
    })
  })

  describe('Data validation and business rules', () => {
    it('should validate required fields', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          email: 'incomplete@test.com'
          // Missing required fields
        }
      })

      expect(response.statusCode).toBe(400)
      
      const result = JSON.parse(response.body)
      expect(result).toHaveProperty('error')
    })

    it('should validate email format', async () => {
      const patientData = {
        ...createTestPatient(),
        email: 'invalid-email'
      }

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: patientData
      })

      expect(response.statusCode).toBe(400)
    })

    it('should validate phone format', async () => {
      const patientData = {
        ...createTestPatient(),
        phone: '123' // Too short
      }

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/patients',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: patientData
      })

      expect(response.statusCode).toBe(400)
    })
  })
})
