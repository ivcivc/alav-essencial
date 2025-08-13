import { z } from 'zod'
import { FastifyRequest, FastifyReply } from 'fastify'

// Validation utility functions
export function validateCPF(cpf: string): boolean {
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '')
  
  // Check if has 11 digits
  if (cleanCPF.length !== 11) return false
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false
  
  // Validate check digits
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false
  
  return true
}

export function validateCNPJ(cnpj: string): boolean {
  // Remove non-numeric characters
  const cleanCNPJ = cnpj.replace(/\D/g, '')
  
  // Check if has 14 digits
  if (cleanCNPJ.length !== 14) return false
  
  // Check if all digits are the same
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false
  
  // Validate check digits
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i]
  }
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder
  if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false
  
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i]
  }
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder
  if (digit2 !== parseInt(cleanCNPJ.charAt(13))) return false
  
  return true
}

export function validateDocument(document: string): boolean {
  const cleanDocument = document.replace(/\D/g, '')
  
  if (cleanDocument.length === 11) {
    return validateCPF(cleanDocument)
  } else if (cleanDocument.length === 14) {
    return validateCNPJ(cleanDocument)
  }
  
  return false
}

export function validateTimeRange(startTime: string, endTime: string): boolean {
  const start = startTime.split(':').map(Number)
  const end = endTime.split(':').map(Number)
  const startMinutes = start[0] * 60 + start[1]
  const endMinutes = end[0] * 60 + end[1]
  return endMinutes > startMinutes
}

export function validateTimeFormat(time: string): boolean {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)
}

// Fastify validation helpers
export function createValidationHandler<T extends z.ZodType>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = schema.parse(request.body)
      request.body = result
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        })
      }
      throw error
    }
  }
}

export function createQueryValidationHandler<T extends z.ZodType>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = schema.parse(request.query)
      request.query = result
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        })
      }
      throw error
    }
  }
}

export function createParamsValidationHandler<T extends z.ZodType>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = schema.parse(request.params)
      request.params = result
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          message: 'Parâmetros de rota inválidos',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        })
      }
      throw error
    }
  }
}

// Common validation schemas for route parameters
export const idParamSchema = z.object({
  id: z.string().cuid('ID inválido')
})

export const paginationQuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1).max(100)).default('10')
})

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  active: z.string().transform((val) => val === 'true').optional()
})