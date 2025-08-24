import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestApp, teardownTestApp, cleanupTestData, createTestPatient, createTestPartner, createTestService, createAuthToken, TestContext } from './setup'

describe('Appointments API Integration Tests', () => {
  let context: TestContext
  let authToken: string
  let testPatientId: string
  let testPartnerId: string
  let testServiceId: string

  beforeAll(async () => {
    context = await setupTestApp()
    authToken = await createAuthToken(context.app)
  })

  afterAll(async () => {
    await teardownTestApp(context)
  })

  beforeEach(async () => {
    await cleanupTestData(context.prisma)
    
    // Criar dados base para os testes
    await setupTestData()
  })

  async function setupTestData() {
    // Criar paciente de teste
    const patientResponse = await context.app.inject({
      method: 'POST',
      url: '/api/patients',
      headers: { authorization: `Bearer ${authToken}` },
      payload: createTestPatient()
    })
    testPatientId = JSON.parse(patientResponse.body).id

    // Criar parceiro de teste
    const partnerResponse = await context.app.inject({
      method: 'POST',
      url: '/api/partners',
      headers: { authorization: `Bearer ${authToken}` },
      payload: createTestPartner()
    })
    testPartnerId = JSON.parse(partnerResponse.body).id

    // Criar serviço de teste
    const serviceResponse = await context.app.inject({
      method: 'POST',
      url: '/api/product-services',
      headers: { authorization: `Bearer ${authToken}` },
      payload: createTestService()
    })
    testServiceId = JSON.parse(serviceResponse.body).id
  }

  function createTestAppointment() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return {
      patientId: testPatientId,
      partnerId: testPartnerId,
      productServiceId: testServiceId,
      date: tomorrow.toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      type: 'CONSULTATION',
      observations: 'Test appointment for integration'
    }
  }

  describe('POST /api/appointments', () => {
    it('should create a new appointment with valid data', async () => {
      const appointmentData = createTestAppointment()

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: appointmentData
      })

      expect(response.statusCode).toBe(201)
      
      const result = JSON.parse(response.body)
      expect(result).toHaveProperty('id')
      expect(result.patientId).toBe(appointmentData.patientId)
      expect(result.partnerId).toBe(appointmentData.partnerId)
      expect(result.productServiceId).toBe(appointmentData.productServiceId)
      expect(result.status).toBe('SCHEDULED')
    })

    it('should detect time conflicts', async () => {
      const appointmentData = createTestAppointment()

      // Criar primeiro agendamento
      await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData
      })

      // Tentar criar segundo agendamento no mesmo horário e profissional
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: appointmentData
      })

      expect(response.statusCode).toBe(409)
      
      const result = JSON.parse(response.body)
      expect(result.error).toContain('conflito')
    })

    it('should validate appointment time is in the future', async () => {
      const appointmentData = {
        ...createTestAppointment(),
        date: '2020-01-01' // Data no passado
      }

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: appointmentData
      })

      expect(response.statusCode).toBe(400)
      
      const result = JSON.parse(response.body)
      expect(result.error).toContain('futuro')
    })

    it('should validate business hours', async () => {
      const appointmentData = {
        ...createTestAppointment(),
        startTime: '06:00', // Muito cedo
        endTime: '07:00'
      }

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: appointmentData
      })

      expect(response.statusCode).toBe(400)
      
      const result = JSON.parse(response.body)
      expect(result.error).toContain('horário')
    })
  })

  describe('GET /api/appointments', () => {
    it('should return appointments for specific date range', async () => {
      const appointmentData = createTestAppointment()
      
      // Criar agendamento
      await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData
      })

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      // Buscar agendamentos
      const response = await context.app.inject({
        method: 'GET',
        url: `/api/appointments?startDate=${tomorrowStr}&endDate=${tomorrowStr}`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      })

      expect(response.statusCode).toBe(200)
      
      const result = JSON.parse(response.body)
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(1)
      expect(result[0].patientId).toBe(testPatientId)
    })

    it('should filter appointments by partner', async () => {
      const appointmentData = createTestAppointment()
      
      await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData
      })

      // Buscar por parceiro específico
      const response = await context.app.inject({
        method: 'GET',
        url: `/api/appointments?partnerId=${testPartnerId}`,
        headers: {
          authorization: `Bearer ${authToken}`
        }
      })

      expect(response.statusCode).toBe(200)
      
      const result = JSON.parse(response.body)
      expect(result).toHaveLength(1)
      expect(result[0].partnerId).toBe(testPartnerId)
    })
  })

  describe('PUT /api/appointments/:id/status', () => {
    it('should update appointment status to IN_PROGRESS (check-in)', async () => {
      // Criar agendamento
      const appointmentData = createTestAppointment()
      const createResponse = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData
      })

      const appointment = JSON.parse(createResponse.body)

      // Fazer check-in
      const response = await context.app.inject({
        method: 'PUT',
        url: `/api/appointments/${appointment.id}/status`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          status: 'IN_PROGRESS'
        }
      })

      expect(response.statusCode).toBe(200)
      
      const result = JSON.parse(response.body)
      expect(result.status).toBe('IN_PROGRESS')
      expect(result.checkIn).toBeTruthy()
    })

    it('should complete appointment and generate financial entry', async () => {
      // Criar agendamento
      const appointmentData = createTestAppointment()
      const createResponse = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData
      })

      const appointment = JSON.parse(createResponse.body)

      // Completar agendamento
      const response = await context.app.inject({
        method: 'PUT',
        url: `/api/appointments/${appointment.id}/status`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          status: 'COMPLETED'
        }
      })

      expect(response.statusCode).toBe(200)
      
      const result = JSON.parse(response.body)
      expect(result.status).toBe('COMPLETED')
      expect(result.checkOut).toBeTruthy()

      // Verificar se lançamento financeiro foi criado
      const financialResponse = await context.app.inject({
        method: 'GET',
        url: '/api/financial/entries',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      })

      const financialEntries = JSON.parse(financialResponse.body)
      expect(financialEntries.length).toBeGreaterThan(0)
      
      const appointmentEntry = financialEntries.find((entry: any) => 
        entry.description.includes('agendamento')
      )
      expect(appointmentEntry).toBeTruthy()
    })
  })

  describe('DELETE /api/appointments/:id', () => {
    it('should cancel appointment', async () => {
      // Criar agendamento
      const appointmentData = createTestAppointment()
      const createResponse = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData
      })

      const appointment = JSON.parse(createResponse.body)

      // Cancelar agendamento
      const response = await context.app.inject({
        method: 'DELETE',
        url: `/api/appointments/${appointment.id}`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          cancellationReason: 'Test cancellation'
        }
      })

      expect(response.statusCode).toBe(200)
      
      const result = JSON.parse(response.body)
      expect(result.status).toBe('CANCELLED')
      expect(result.cancellationReason).toBe('Test cancellation')
    })

    it('should not allow cancellation of completed appointments', async () => {
      // Criar e completar agendamento
      const appointmentData = createTestAppointment()
      const createResponse = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData
      })

      const appointment = JSON.parse(createResponse.body)

      // Completar primeiro
      await context.app.inject({
        method: 'PUT',
        url: `/api/appointments/${appointment.id}/status`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: { status: 'COMPLETED' }
      })

      // Tentar cancelar
      const response = await context.app.inject({
        method: 'DELETE',
        url: `/api/appointments/${appointment.id}`,
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {
          cancellationReason: 'Cannot cancel completed'
        }
      })

      expect(response.statusCode).toBe(400)
      
      const result = JSON.parse(response.body)
      expect(result.error).toContain('completado')
    })
  })

  describe('Business rules integration', () => {
    it('should validate partner availability', async () => {
      // Criar agendamento que ocupa todo o horário do parceiro
      const appointmentData = createTestAppointment()
      
      await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData
      })

      // Tentar criar agendamento sobreposto
      const overlappingAppointment = {
        ...appointmentData,
        patientId: testPatientId, // Diferente paciente, mesmo parceiro
        startTime: '10:30', // Sobrepõe com 10:00-11:00
        endTime: '11:30'
      }

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: overlappingAppointment
      })

      expect(response.statusCode).toBe(409)
    })

    it('should handle appointment duration validation', async () => {
      const appointmentData = {
        ...createTestAppointment(),
        startTime: '10:00',
        endTime: '10:15' // Muito curto
      }

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: appointmentData
      })

      expect(response.statusCode).toBe(400)
      
      const result = JSON.parse(response.body)
      expect(result.error).toContain('duração')
    })
  })
})
