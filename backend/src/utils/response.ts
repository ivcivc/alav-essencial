import { FastifyReply } from 'fastify'
import { ApiResponse } from '../types/index'

export function successResponse<T>(data: T, message?: string, statusCode: number = 200): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

export function errorResponse(reply: FastifyReply, error: string, statusCode: number = 500, message?: string): FastifyReply {
  return reply.status(statusCode).send({
    success: false,
    error,
    message,
  })
}