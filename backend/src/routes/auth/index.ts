import { FastifyInstance } from 'fastify'
import { loginSchema, registerSchema } from '../../schemas/auth'
import { UserRole } from '@prisma/client'

export default async function authRoutes(fastify: FastifyInstance) {
  // Login route
  fastify.post('/login', {
    schema: {
      body: loginSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string }

    try {
      // Find user by email
      const user = await fastify.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          password: true,
          active: true
        }
      })

      if (!user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Invalid email or password'
        })
      }

      if (!user.active) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Account is inactive'
        })
      }

      // Verify password
      const isValidPassword = await fastify.verifyPassword(password, user.password)
      if (!isValidPassword) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Invalid email or password'
        })
      }

      // Generate JWT token
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role
      })

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user

      return {
        token,
        user: userWithoutPassword
      }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred during login'
      })
    }
  })

  // Register route (admin only)
  fastify.post('/register', {
    preHandler: fastify.authorize(['ADMIN']),
    schema: {
      body: registerSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password, name, role } = request.body as {
      email: string
      password: string
      name: string
      role: UserRole
    }

    try {
      // Check if user already exists
      const existingUser = await fastify.prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'User with this email already exists'
        })
      }

      // Hash password
      const hashedPassword = await fastify.hashPassword(password)

      // Create user
      const user = await fastify.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || UserRole.USER
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          createdAt: true
        }
      })

      return reply.code(201).send({ user })
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred during registration'
      })
    }
  })

  // Get current user profile
  fastify.get('/me', {
    preHandler: fastify.authenticate,
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (!user) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'User not found'
        })
      }

      return { user }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while fetching user profile'
      })
    }
  })

  // Logout route (client-side token removal, but we can add token blacklisting later)
  fastify.post('/logout', {
    preHandler: fastify.authenticate,
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    // For now, logout is handled client-side by removing the token
    // In the future, we could implement token blacklisting here
    return { message: 'Logged out successfully' }
  })

  // Refresh token route
  fastify.post('/refresh', {
    preHandler: fastify.authenticate,
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Generate new token with current user data
      const token = fastify.jwt.sign({
        id: request.user.id,
        email: request.user.email,
        role: request.user.role
      })

      return { token }
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while refreshing token'
      })
    }
  })
}