import fp from 'fastify-plugin'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import rateLimit from '@fastify/rate-limit'
import compress from '@fastify/compress'
import { cacheService } from '../services/cacheService'
import { createSlowQueryLogger } from '../services/queryOptimizationService'

// Interface para configurações de performance
interface PerformanceConfig {
  enableRateLimit?: boolean
  enableCompression?: boolean
  enableQueryLogging?: boolean
  enableResponseCaching?: boolean
  rateLimit?: {
    max?: number
    timeWindow?: number
  }
}

// Plugin de otimizações de performance
async function performancePlugin(
  fastify: FastifyInstance,
  opts: PerformanceConfig = {}
) {
  const {
    enableRateLimit = true,
    enableCompression = true,
    enableQueryLogging = true,
    enableResponseCaching = true,
    rateLimit: rateLimitConfig = {}
  } = opts

  // 1. Rate Limiting
  if (enableRateLimit) {
    await fastify.register(rateLimit, {
      max: rateLimitConfig.max || 100, // 100 requests
      timeWindow: rateLimitConfig.timeWindow || 60000, // por minuto
      skipOnError: true, // não bloquear se houver erro no rate limit
      keyGenerator: (request: FastifyRequest) => {
        // Gerar chave baseada no IP e user ID (se autenticado)
        const ip = request.ip
        const userId = (request as any).user?.id
        return userId ? `user:${userId}` : `ip:${ip}`
      },
      errorResponseBuilder: () => ({
        success: false,
        error: 'Rate limit excedido',
        message: 'Muitas requisições. Tente novamente em alguns segundos.',
        code: 'RATE_LIMIT_EXCEEDED'
      })
    })
  }

  // 2. Compressão de respostas
  if (enableCompression) {
    await fastify.register(compress, {
      global: true,
      encodings: ['gzip', 'deflate', 'br'],
      threshold: 1024 // Comprimir apenas responses > 1KB
    })
  }

  // 3. Query logging para identificar queries lentas
  if (enableQueryLogging) {
    const slowQueryLogger = createSlowQueryLogger(1000) // 1 segundo threshold
    fastify.addHook('onRequest', async (request, reply) => {
      if (fastify.prisma) {
        fastify.prisma.$use(slowQueryLogger)
      }
    })
  }

  // 4. Cache de responses para endpoints específicos
  if (enableResponseCaching) {
    fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
      // Cachear apenas GET requests
      if (request.method !== 'GET') return

      // Cache key baseado na URL e query params
      const cacheKey = `response:${request.url}`
      
      // Verificar se já existe no cache
      const cachedResponse = await cacheService.get(cacheKey)
      if (cachedResponse) {
        reply.header('X-Cache', 'HIT')
        reply.send(cachedResponse)
        return reply
      }

      // Marcar para cachear a response
      ;(request as any).shouldCache = true
      ;(request as any).cacheKey = cacheKey
    })

    fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload) => {
      const shouldCache = (request as any).shouldCache
      const cacheKey = (request as any).cacheKey

      if (shouldCache && cacheKey && reply.statusCode === 200) {
        // Cachear response por 1 minuto para endpoints de listagem
        const ttl = request.url.includes('/api/') ? 60 : 300
        await cacheService.set(cacheKey, JSON.parse(payload as string), ttl)
        reply.header('X-Cache', 'MISS')
      }

      return payload
    })
  }

  // 5. Headers de performance
  fastify.addHook('onSend', async (request, reply, payload) => {
    // Headers de cache para recursos estáticos
    if (request.url.includes('/static/') || request.url.includes('/assets/')) {
      reply.header('Cache-Control', 'public, max-age=31536000') // 1 ano
      reply.header('Expires', new Date(Date.now() + 31536000000).toUTCString())
    }

    // Headers de segurança e performance
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('X-Frame-Options', 'DENY')
    reply.header('X-XSS-Protection', '1; mode=block')
    
    return payload
  })

  // 6. Middleware para logging de performance
  fastify.addHook('onRequest', async (request) => {
    ;(request as any).startTime = Date.now()
  })

  fastify.addHook('onResponse', async (request, reply) => {
    const startTime = (request as any).startTime
    if (startTime) {
      const duration = Date.now() - startTime
      
      // Log requests lentas
      if (duration > 2000) { // 2 segundos
        fastify.log.warn(`Slow request detected: ${request.method} ${request.url} - ${duration}ms`)
      }

      // Adicionar header de timing
      reply.header('X-Response-Time', `${duration}ms`)
    }
  })

  // 7. Health check endpoint otimizado
  fastify.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Health check',
      description: 'Check application health and performance metrics'
    }
  }, async (request, reply) => {
    const startTime = Date.now()
    
    try {
      // Verificar cache
      const cacheHealth = await cacheService.healthCheck()
      
      // Verificar banco de dados (se disponível)
      let dbHealth = 'not available'
      if (fastify.prisma) {
        try {
          await fastify.prisma.$queryRaw`SELECT 1`
          dbHealth = 'healthy'
        } catch (dbError) {
          dbHealth = 'error'
        }
      }
      
      const responseTime = Date.now() - startTime
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        responseTime: `${responseTime}ms`,
        cache: cacheHealth,
        database: dbHealth,
        version: process.env.npm_package_version || '1.0.0'
      }
    } catch (error) {
      reply.code(503)
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  })

  // 8. Endpoint para estatísticas de performance
  fastify.get('/performance/stats', {
    schema: {
      tags: ['Performance'],
      summary: 'Performance statistics',
      description: 'Get performance metrics and statistics'
    }
  }, async (request, reply) => {
    try {
      const memoryUsage = process.memoryUsage()
      const cacheHealth = await cacheService.healthCheck()
      
      return {
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
        },
        uptime: {
          seconds: process.uptime(),
          formatted: formatUptime(process.uptime())
        },
        cache: cacheHealth,
        node: {
          version: process.version,
          platform: process.platform,
          arch: process.arch
        }
      }
    } catch (error) {
      reply.code(500)
      return {
        error: 'Erro ao obter estatísticas',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  })
}

// Helper para formatar uptime
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  return `${days}d ${hours}h ${minutes}m ${secs}s`
}

// Exportar como plugin do Fastify
export default fp(performancePlugin, {
  name: 'performance-plugin'
  // Removendo dependência explícita pois será verificada internamente
})
