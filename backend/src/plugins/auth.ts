import fp from 'fastify-plugin'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcryptjs'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    authorize: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    hashPassword: (password: string) => Promise<string>
    verifyPassword: (password: string, hash: string) => Promise<boolean>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string
      email: string
      role: string
    }
    user: {
      id: string
      email: string
      role: string
    }
  }
}

async function authPlugin(fastify: FastifyInstance) {
  // Authentication middleware
  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' })
    }
  })

  // Authorization middleware factory
  fastify.decorate('authorize', function (roles: string[]) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify()
        
        if (!roles.includes(request.user.role)) {
          reply.code(403).send({ 
            error: 'Forbidden', 
            message: 'Insufficient permissions' 
          })
        }
      } catch (err) {
        reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' })
      }
    }
  })

  // Utility function to hash passwords
  fastify.decorate('hashPassword', async function (password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  })

  // Utility function to verify passwords
  fastify.decorate('verifyPassword', async function (password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  })
}

export default fp(authPlugin, {
  name: 'auth'
})