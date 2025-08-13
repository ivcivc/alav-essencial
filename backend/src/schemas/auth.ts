import { z } from 'zod'
import { UserRole } from '@prisma/client'

export const loginSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address'
    },
    password: {
      type: 'string',
      minLength: 6,
      description: 'User password (minimum 6 characters)'
    }
  }
}

export const registerSchema = {
  type: 'object',
  required: ['email', 'password', 'name'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address'
    },
    password: {
      type: 'string',
      minLength: 6,
      description: 'User password (minimum 6 characters)'
    },
    name: {
      type: 'string',
      minLength: 2,
      description: 'User full name'
    },
    role: {
      type: 'string',
      enum: Object.values(UserRole),
      description: 'User role (ADMIN or USER)',
      default: 'USER'
    }
  }
}

// Zod schemas for runtime validation
export const loginZodSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const registerZodSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.USER)
})

export type LoginRequest = z.infer<typeof loginZodSchema>
export type RegisterRequest = z.infer<typeof registerZodSchema>