import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestApp, teardownTestApp, cleanupTestData, createTestPatient, createTestPartner, createTestService, createAuthToken, TestContext } from './setup'

describe('Appointment-Financial Integration Tests', () => {
  let context: TestContext
  let authToken: string
  let testPatientId: string
  let testPartnerId: string
  let testServiceId: string
  let testBankAccountId: string

  beforeAll(async () => {
    context = await setupTestApp()
    authToken = await createAuthToken(context.app)
  })

  afterAll(async () => {
    await teardownTestApp(context)
  })

  beforeEach(async () => {
    await cleanupTestData(context.prisma)
    await setupTestData()
  })

  async function setupTestData() {
    // Criar dados base
    const patientResponse = await context.app.inject({
      method: 'POST',
      url: '/api/patients',
      headers: { authorization: `Bearer ${authToken}` },
      payload: createTestPatient()
    })
    testPatientId = JSON.parse(patientResponse.body).id

    const partnerResponse = await context.app.inject({
      method: 'POST',
      url: '/api/partners',
      headers: { authorization: `Bearer ${authToken}` },
      payload: createTestPartner()
    })
    testPartnerId = JSON.parse(partnerResponse.body).id

    const serviceResponse = await context.app.inject({
      method: 'POST',
      url: '/api/product-services',
      headers: { authorization: `Bearer ${authToken}` },
      payload: createTestService()
    })
    testServiceId = JSON.parse(serviceResponse.body).id

    // Criar conta bancária para testes financeiros
    const bankAccountResponse = await context.app.inject({
      method: 'POST',
      url: '/api/financial/bank-accounts',
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        name: 'Test Bank Account',
        balance: 1000.00
      }
    })
    testBankAccountId = JSON.parse(bankAccountResponse.body).id
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
      type: 'CONSULTATION'
    }
  }

  describe('Appointment Completion to Financial Entry', () => {
    it('should automatically create financial entry when appointment is completed', async () => {
      // Criar agendamento
      const appointmentData = createTestAppointment()
      const appointmentResponse = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData
      })

      const appointment = JSON.parse(appointmentResponse.body)

      // Completar agendamento com checkout
      const checkoutResponse = await context.app.inject({
        method: 'POST',
        url: `/api/appointments/${appointment.id}/checkout`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          bankAccountId: testBankAccountId,
          paymentMethod: 'CASH',
          totalAmount: 150.00
        }
      })

      expect(checkoutResponse.statusCode).toBe(200)

      // Verificar se lançamento financeiro foi criado
      const financialResponse = await context.app.inject({
        method: 'GET',
        url: '/api/financial/entries',
        headers: { authorization: `Bearer ${authToken}` }
      })

      const entries = JSON.parse(financialResponse.body)
      expect(entries.length).toBeGreaterThan(0)

      const appointmentEntry = entries.find((entry: any) => 
        entry.description.includes('agendamento') && 
        entry.relatedAppointmentId === appointment.id
      )

      expect(appointmentEntry).toBeTruthy()
      expect(appointmentEntry.type).toBe('INCOME')
      expect(appointmentEntry.amount).toBe(150.00)
      expect(appointmentEntry.status).toBe('PAID')
      expect(appointmentEntry.bankAccountId).toBe(testBankAccountId)
    })

    it('should create partner commission entry for percentage partnership', async () => {
      // Criar agendamento
      const appointmentData = createTestAppointment()
      const appointmentResponse = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData
      })

      const appointment = JSON.parse(appointmentResponse.body)

      // Fazer checkout
      await context.app.inject({
        method: 'POST',
        url: `/api/appointments/${appointment.id}/checkout`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          bankAccountId: testBankAccountId,
          paymentMethod: 'CASH',
          totalAmount: 150.00
        }
      })

      // Buscar lançamentos financeiros
      const financialResponse = await context.app.inject({
        method: 'GET',
        url: '/api/financial/entries',
        headers: { authorization: `Bearer ${authToken}` }
      })

      const entries = JSON.parse(financialResponse.body)

      // Deve ter lançamento de receita
      const incomeEntry = entries.find((entry: any) => entry.type === 'INCOME')
      expect(incomeEntry).toBeTruthy()
      expect(incomeEntry.amount).toBe(150.00)

      // Deve ter lançamento de comissão do parceiro (70% de 150 = 105)
      const commissionEntry = entries.find((entry: any) => 
        entry.type === 'EXPENSE' && 
        entry.description.includes('comissão')
      )
      expect(commissionEntry).toBeTruthy()
      expect(commissionEntry.amount).toBe(105.00) // 70% de 150
    })

    it('should update bank account balance correctly', async () => {
      // Verificar saldo inicial
      const initialBalanceResponse = await context.app.inject({
        method: 'GET',
        url: `/api/financial/bank-accounts/${testBankAccountId}`,
        headers: { authorization: `Bearer ${authToken}` }
      })

      const initialBalance = JSON.parse(initialBalanceResponse.body).balance

      // Criar e finalizar agendamento
      const appointmentData = createTestAppointment()
      const appointmentResponse = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData
      })

      const appointment = JSON.parse(appointmentResponse.body)

      await context.app.inject({
        method: 'POST',
        url: `/api/appointments/${appointment.id}/checkout`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          bankAccountId: testBankAccountId,
          paymentMethod: 'CASH',
          totalAmount: 150.00
        }
      })

      // Verificar saldo final
      const finalBalanceResponse = await context.app.inject({
        method: 'GET',
        url: `/api/financial/bank-accounts/${testBankAccountId}`,
        headers: { authorization: `Bearer ${authToken}` }
      })

      const finalBalance = JSON.parse(finalBalanceResponse.body).balance

      // Saldo deve aumentar em 45 (150 de receita - 105 de comissão)
      expect(finalBalance).toBe(initialBalance + 45.00)
    })
  })

  describe('Appointment Cancellation and Financial Impact', () => {
    it('should reverse financial entries when appointment is cancelled after checkout', async () => {
      // Criar e fazer checkout do agendamento
      const appointmentData = createTestAppointment()
      const appointmentResponse = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData
      })

      const appointment = JSON.parse(appointmentResponse.body)

      await context.app.inject({
        method: 'POST',
        url: `/api/appointments/${appointment.id}/checkout`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          bankAccountId: testBankAccountId,
          paymentMethod: 'CASH',
          totalAmount: 150.00
        }
      })

      // Cancelar pagamento
      const cancelResponse = await context.app.inject({
        method: 'POST',
        url: `/api/appointments/${appointment.id}/cancel-checkout`,
        headers: { authorization: `Bearer ${authToken}` }
      })

      expect(cancelResponse.statusCode).toBe(200)

      // Verificar se lançamentos foram cancelados
      const financialResponse = await context.app.inject({
        method: 'GET',
        url: '/api/financial/entries',
        headers: { authorization: `Bearer ${authToken}` }
      })

      const entries = JSON.parse(financialResponse.body)
      const cancelledEntries = entries.filter((entry: any) => entry.status === 'CANCELLED')
      
      expect(cancelledEntries.length).toBeGreaterThan(0)
    })
  })

  describe('Complex Integration Scenarios', () => {
    it('should handle multiple appointments with different payment methods', async () => {
      const appointmentData1 = createTestAppointment()
      const appointmentData2 = {
        ...createTestAppointment(),
        startTime: '14:00',
        endTime: '15:00'
      }

      // Criar dois agendamentos
      const apt1Response = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData1
      })

      const apt2Response = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData2
      })

      const apt1 = JSON.parse(apt1Response.body)
      const apt2 = JSON.parse(apt2Response.body)

      // Fazer checkout com métodos diferentes
      await context.app.inject({
        method: 'POST',
        url: `/api/appointments/${apt1.id}/checkout`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          bankAccountId: testBankAccountId,
          paymentMethod: 'CASH',
          totalAmount: 150.00
        }
      })

      await context.app.inject({
        method: 'POST',
        url: `/api/appointments/${apt2.id}/checkout`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          bankAccountId: testBankAccountId,
          paymentMethod: 'CREDIT_CARD',
          totalAmount: 150.00
        }
      })

      // Verificar lançamentos financeiros
      const financialResponse = await context.app.inject({
        method: 'GET',
        url: '/api/financial/entries',
        headers: { authorization: `Bearer ${authToken}` }
      })

      const entries = JSON.parse(financialResponse.body)
      
      const cashEntry = entries.find((entry: any) => 
        entry.paymentMethod === 'CASH' && entry.type === 'INCOME'
      )
      const cardEntry = entries.find((entry: any) => 
        entry.paymentMethod === 'CREDIT_CARD' && entry.type === 'INCOME'
      )

      expect(cashEntry).toBeTruthy()
      expect(cardEntry).toBeTruthy()
      expect(cashEntry.amount).toBe(150.00)
      expect(cardEntry.amount).toBe(150.00)
    })

    it('should maintain data consistency across modules', async () => {
      // Criar agendamento
      const appointmentData = createTestAppointment()
      const appointmentResponse = await context.app.inject({
        method: 'POST',
        url: '/api/appointments',
        headers: { authorization: `Bearer ${authToken}` },
        payload: appointmentData
      })

      const appointment = JSON.parse(appointmentResponse.body)

      // Fazer checkout
      await context.app.inject({
        method: 'POST',
        url: `/api/appointments/${appointment.id}/checkout`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          bankAccountId: testBankAccountId,
          paymentMethod: 'PIX',
          totalAmount: 150.00
        }
      })

      // Verificar consistência nos dados do agendamento
      const updatedAppointmentResponse = await context.app.inject({
        method: 'GET',
        url: `/api/appointments/${appointment.id}`,
        headers: { authorization: `Bearer ${authToken}` }
      })

      const updatedAppointment = JSON.parse(updatedAppointmentResponse.body)
      expect(updatedAppointment.status).toBe('COMPLETED')
      expect(updatedAppointment.checkOut).toBeTruthy()

      // Verificar referência cruzada nos lançamentos financeiros
      const financialResponse = await context.app.inject({
        method: 'GET',
        url: '/api/financial/entries',
        headers: { authorization: `Bearer ${authToken}` }
      })

      const entries = JSON.parse(financialResponse.body)
      const appointmentEntry = entries.find((entry: any) => 
        entry.relatedAppointmentId === appointment.id
      )

      expect(appointmentEntry).toBeTruthy()
      expect(appointmentEntry.relatedAppointmentId).toBe(appointment.id)
    })
  })
})
