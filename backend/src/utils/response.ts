import { FastifyReply } from 'fastify'
import { ApiResponse } from '../types/index'

export function successResponse<T>(data: T, message?: string, statusCode: number = 200): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

export function errorResponse(error: string, message?: string) {
  return {
    success: false,
    error,
    message,
  }
}

export function sendErrorResponse(reply: FastifyReply, error: string, statusCode: number = 500, message?: string): FastifyReply {
  return reply.code(statusCode).send({
    success: false,
    error,
    message,
  })
}