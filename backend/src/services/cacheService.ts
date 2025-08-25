import Redis from 'ioredis'

interface CacheConfig {
  host?: string
  port?: number
  password?: string
  db?: number
  keyPrefix?: string
  enableOfflineQueue?: boolean
}

class CacheService {
  private redis: Redis | null = null
  private isEnabled = false
  private hasLoggedError = false // Flag para evitar logs repetitivos

  constructor(config?: CacheConfig) {
    try {
      // Configuração padrão do Redis
      const defaultConfig: CacheConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        keyPrefix: 'clinica:',
        enableOfflineQueue: false, // Não bloquear se Redis estiver offline
      }

      const finalConfig = { ...defaultConfig, ...config }

      this.redis = new Redis({
        ...finalConfig,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      })

      // Event handlers
      this.redis.on('connect', () => {
        console.log('📡 Redis conectado com sucesso')
        this.isEnabled = true
      })

      this.redis.on('error', (err) => {
        if (!this.hasLoggedError) {
          console.warn('⚠️ Redis error (cache desabilitado):', err.message)
          this.hasLoggedError = true
        }
        this.isEnabled = false
      })

      this.redis.on('close', () => {
        if (this.isEnabled) {
          console.log('📡 Redis desconectado')
        }
        this.isEnabled = false
      })

      // Tentar conectar
      this.redis.connect().catch(() => {
        if (!this.hasLoggedError) {
          console.warn('⚠️ Redis não disponível - cache desabilitado')
          this.hasLoggedError = true
        }
        this.isEnabled = false
      })

    } catch (error) {
      console.warn('⚠️ Erro ao inicializar Redis - cache desabilitado:', error)
      this.isEnabled = false
    }
  }

  /**
   * Get valor do cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.redis) return null

    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.warn('Cache get error:', error)
      return null
    }
  }

  /**
   * Set valor no cache
   */
  async set(key: string, value: any, ttlSeconds = 300): Promise<boolean> {
    if (!this.isEnabled || !this.redis) return false

    try {
      const serialized = JSON.stringify(value)
      await this.redis.setex(key, ttlSeconds, serialized)
      return true
    } catch (error) {
      console.warn('Cache set error:', error)
      return false
    }
  }

  /**
   * Deletar chave do cache
   */
  async del(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.redis) return false

    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      console.warn('Cache del error:', error)
      return false
    }
  }

  /**
   * Deletar múltiplas chaves por padrão
   */
  async delPattern(pattern: string): Promise<number> {
    if (!this.isEnabled || !this.redis) return 0

    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length === 0) return 0
      
      const result = await this.redis.del(...keys)
      return result
    } catch (error) {
      console.warn('Cache delPattern error:', error)
      return 0
    }
  }

  /**
   * 💥 FLUSH TOTAL - Limpar TUDO do Redis
   */
  async flush(): Promise<boolean> {
    if (!this.isEnabled || !this.redis) return false

    try {
      console.log('💥 FLUSH TOTAL: Limpando TUDO do Redis...')
      await this.redis.flushdb()
      console.log('✅ FLUSH TOTAL: Redis completamente limpo!')
      return true
    } catch (error) {
      console.warn('❌ Cache flush error:', error)
      return false
    }
  }

  /**
   * Verificar se chave existe
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.redis) return false

    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.warn('Cache exists error:', error)
      return false
    }
  }

  /**
   * Cache with fallback - tenta cache primeiro, senão executa função
   */
  async remember<T>(
    key: string, 
    fallback: () => Promise<T>, 
    ttlSeconds = 300
  ): Promise<T> {
    // Tentar cache primeiro
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Executar fallback e cachear resultado
    const result = await fallback()
    await this.set(key, result, ttlSeconds)
    return result
  }

  /**
   * Cache para listas com paginação
   */
  async rememberList<T>(
    baseKey: string,
    page: number,
    limit: number,
    fallback: () => Promise<{ data: T[], total: number }>,
    ttlSeconds = 180
  ): Promise<{ data: T[], total: number }> {
    const key = `${baseKey}:page:${page}:limit:${limit}`
    return this.remember(key, fallback, ttlSeconds)
  }

  /**
   * Invalidar cache de listas (all pages)
   */
  async invalidateList(baseKey: string): Promise<number> {
    return this.delPattern(`${baseKey}:page:*`)
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    if (!this.redis) {
      return { status: 'disabled', message: 'Redis not initialized' }
    }

    if (!this.isEnabled) {
      return { status: 'offline', message: 'Redis offline' }
    }

    try {
      await this.redis.ping()
      return { status: 'healthy', message: 'Redis connected' }
    } catch (error) {
      return { status: 'error', message: `Redis error: ${error}` }
    }
  }

  /**
   * Fechar conexão
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect()
      this.redis = null
      this.isEnabled = false
    }
  }
}

// Singleton instance
export const cacheService = new CacheService()

// Helper para gerar chaves de cache consistentes
export const cacheKeys = {
  patients: {
    list: (search?: string, page?: number, limit?: number) => 
      `patients:list${search ? `:search:${search}` : ''}${page ? `:page:${page}` : ''}${limit ? `:limit:${limit}` : ''}`,
    detail: (id: string) => `patients:detail:${id}`,
    stats: () => 'patients:stats'
  },
  appointments: {
    list: (date?: string, professionalId?: string, page?: number, limit?: number) => 
      `appointments:list${date ? `:date:${date}` : ''}${professionalId ? `:prof:${professionalId}` : ''}${page ? `:page:${page}` : ''}${limit ? `:limit:${limit}` : ''}`,
    detail: (id: string) => `appointments:detail:${id}`,
    calendar: (start: string, end: string) => `appointments:calendar:${start}:${end}`,
    stats: (date?: string) => `appointments:stats${date ? `:${date}` : ''}`
  },
  partners: {
    list: (page?: number, limit?: number, search?: string, active?: boolean, partnershipType?: string) => 
      `partners:list${page ? `:page:${page}` : ''}${limit ? `:limit:${limit}` : ''}${search ? `:search:${search}` : ''}${active !== undefined ? `:active:${active}` : ''}${partnershipType ? `:type:${partnershipType}` : ''}`,
    detail: (id: string) => `partners:detail:${id}`,
    stats: () => 'partners:stats'
  },
  financial: {
    transactions: (startDate?: string, endDate?: string, page?: number, limit?: number) => 
      `financial:transactions${startDate ? `:start:${startDate}` : ''}${endDate ? `:end:${endDate}` : ''}${page ? `:page:${page}` : ''}${limit ? `:limit:${limit}` : ''}`,
    balance: () => 'financial:balance',
    stats: (period?: string) => `financial:stats${period ? `:${period}` : ''}`
  },
  dashboard: {
    stats: () => 'dashboard:stats',
    appointments: (date: string) => `dashboard:appointments:${date}`,
    revenue: (period: string) => `dashboard:revenue:${period}`
  }
}

export default cacheService
