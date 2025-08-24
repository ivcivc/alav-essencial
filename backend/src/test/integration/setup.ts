import { FastifyInstance } from 'fastify'
import { build } from '../../app'
import { PrismaClient } from '@prisma/client'

export interface TestContext {
  app: FastifyInstance
  prisma: PrismaClient
}

// Configuração global para testes de integração
export async function setupTestApp(): Promise<TestContext> {
  // Criar instância do app
  const app = await build({
    logger: false, // Desabilitar logs durante testes
  })

  // Configurar banco de dados de teste
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
      }
    }
  })

  return { app, prisma }
}

export async function teardownTestApp(context: TestContext) {
  // Limpar dados de teste
  await cleanupTestData(context.prisma)
  
  // Fechar conexões
  await context.prisma.$disconnect()
  await context.app.close()
}

export async function cleanupTestData(prisma: PrismaClient) {
  // Limpar dados em ordem correta (devido às foreign keys)
  await prisma.appointment.deleteMany({
    where: {
      patient: {
        fullName: {
          contains: 'Test'
        }
      }
    }
  })
  
  await prisma.financialEntry.deleteMany({
    where: {
      description: {
        contains: 'Test'
      }
    }
  })
  
  await prisma.patient.deleteMany({
    where: {
      fullName: {
        contains: 'Test'
      }
    }
  })
  
  await prisma.partner.deleteMany({
    where: {
      fullName: {
        contains: 'Test'
      }
    }
  })
  
  await prisma.productService.deleteMany({
    where: {
      name: {
        contains: 'Test'
      }
    }
  })
}

export function createTestPatient() {
  return {
    fullName: 'Test Patient Integration',
    cpf: '12345678901',
    birthDate: '1990-01-01',
    email: 'test@integration.com',
    phone: '11999999999',
    whatsapp: '11999999999',
    street: 'Test Street',
    number: '123',
    city: 'Test City',
    state: 'SP',
    zipCode: '01000-000'
  }
}

export function createTestPartner() {
  return {
    fullName: 'Test Partner Integration',
    document: '98765432100',
    phone: '11888888888',
    email: 'partner@integration.com',
    partnershipType: 'PERCENTAGE',
    percentageRate: 70,
    bank: 'Test Bank',
    agency: '1234',
    account: '56789-0'
  }
}

export function createTestService() {
  return {
    name: 'Test Service Integration',
    type: 'SERVICE',
    salePrice: 150.00,
    durationMinutes: 60,
    availableForBooking: true,
    requiresSpecialPrep: false
  }
}

export async function createAuthToken(app: FastifyInstance): Promise<string> {
  // Criar token de autenticação para testes
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      email: 'admin@clinica.com',
      password: 'admin123'
    }
  })
  
  const { token } = JSON.parse(response.body)
  return token
}
