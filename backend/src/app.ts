import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { config } from './config'
import { prismaPlugin } from './plugins/prisma'
import authPlugin from './plugins/auth'
import authRoutes from './routes/auth'

const fastify = Fastify({
  logger: {
    level: config.NODE_ENV === 'production' ? 'warn' : 'info',
  },
})

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
  })

  // Database
  await fastify.register(prismaPlugin)

  // JWT
  await fastify.register(jwt, {
    secret: config.JWT_SECRET,
  })

  // Auth plugin (after JWT)
  await fastify.register(authPlugin)

  // Swagger documentation
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Clínica Essencial API',
        description: 'API for clinic management system',
        version: '1.0.0',
      },
      host: `localhost:${config.PORT}`,
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  })

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  })

  // Routes
  await fastify.register(authRoutes, { prefix: '/api/auth' })
  
  // Import patient routes
  const patientsRoutes = await import('./routes/patients')
  await fastify.register(patientsRoutes.default, { prefix: '/api/patients' })
  
  // Import room routes
  const roomsRoutes = await import('./routes/rooms')
  await fastify.register(roomsRoutes.default, { prefix: '/api/rooms' })
  
  // Import category routes
  const categoriesRoutes = await import('./routes/categories')
  await fastify.register(categoriesRoutes.default, { prefix: '/api/categories' })
  
  // Import product-services routes
  const productServicesRoutes = await import('./routes/product-services')
  await fastify.register(productServicesRoutes.default, { prefix: '/api/product-services' })
  
  // Import partners routes
  const partnersRoutes = await import('./routes/partners')
  await fastify.register(partnersRoutes.default, { prefix: '/api/partners' })
  
  // Import appointments routes
  const appointmentsRoutes = await import('./routes/appointments')
  await fastify.register(appointmentsRoutes.default, { prefix: '/api/appointments' })
  
  // Import notifications routes
  const notificationsRoutes = await import('./routes/notifications')
  await fastify.register(notificationsRoutes.default, { prefix: '/api/notifications' })
  
  // Import financial routes
  const financialRoutes = await import('./routes/financial')
  await fastify.register(financialRoutes.default, { prefix: '/api/financial' })

  // Import partner settlement routes
  const partnerSettlementRoutes = await import('./routes/partner-settlement')
  await fastify.register(partnerSettlementRoutes.default, { prefix: '/api/partner-settlement' })
  
  // Import backup routes
  const backupRoutes = await import('./routes/backup')
  await fastify.register(backupRoutes.default, { prefix: '/api/backup' })

  // Import clinic settings routes
  const clinicSettingsRoutes = await import('./routes/clinic-settings')
  await fastify.register(clinicSettingsRoutes.default, { prefix: '/api/clinic-settings' })

  // Import dashboard routes
  const dashboardRoutes = await import('./routes/dashboard')
  await fastify.register(dashboardRoutes.default, { prefix: '/api/dashboard' })

  // Import reports routes
  const reportsRoutes = await import('./routes/reports')
  await fastify.register(reportsRoutes.default, { prefix: '/api/reports' })

  // Import financial automation routes
  const financialAutomationRoutes = await import('./routes/financial/automation')
  await fastify.register(financialAutomationRoutes.default, { prefix: '/api/financial/automation' })
  
  await fastify.register(async function (fastify) {
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() }
    })
  })

  // 🔔 Inicializar agendador de notificações
  const { NotificationSchedulerSingleton } = await import('./services/notification-scheduler')
  NotificationSchedulerSingleton.start(fastify.prisma)
  
  // Initialize backup scheduler
  const { backupScheduler } = await import('./services/backup-scheduler')
  await backupScheduler.initialize()
}

// Start server
async function start() {
  try {
    await registerPlugins()
    
    await fastify.listen({
      port: config.PORT,
      host: '0.0.0.0',
    })
    
    console.log(`🚀 Server running on http://localhost:${config.PORT}`)
    console.log(`📚 API docs available at http://localhost:${config.PORT}/docs`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()