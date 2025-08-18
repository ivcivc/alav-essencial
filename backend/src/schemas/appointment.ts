import { z } from 'zod'

// Base appointment schema
export const appointmentSchema = z.object({
  id: z.string().cuid(),
  patientId: z.string().cuid(),
  partnerId: z.string().cuid(),
  productServiceId: z.string().cuid(),
  roomId: z.string().cuid().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data deve ser uma data válida"
  }).transform((val) => new Date(val)),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Horário de início deve estar no formato HH:MM"
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Horário de fim deve estar no formato HH:MM"
  }),
  type: z.enum(['CONSULTATION', 'EXAM', 'PROCEDURE', 'RETURN'], {
    errorMap: () => ({ message: "Tipo deve ser CONSULTATION, EXAM, PROCEDURE ou RETURN" })
  }),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'], {
    errorMap: () => ({ message: "Status deve ser SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED ou NO_SHOW" })
  }),
  observations: z.string().optional(),
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  cancellationReason: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// Create appointment schema
export const createAppointmentSchema = z.object({
  patientId: z.string().cuid("ID do paciente deve ser um CUID válido"),
  partnerId: z.string().cuid("ID do parceiro deve ser um CUID válido"),
  productServiceId: z.string().cuid("ID do produto/serviço deve ser um CUID válido"),
  roomId: z.string().cuid("ID da sala deve ser um CUID válido").optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data deve ser uma data válida"
  }).transform((val) => new Date(val)),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Horário de início deve estar no formato HH:MM"
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Horário de fim deve estar no formato HH:MM"
  }).optional(),
  type: z.enum(['CONSULTATION', 'EXAM', 'PROCEDURE', 'RETURN'], {
    errorMap: () => ({ message: "Tipo deve ser CONSULTATION, EXAM, PROCEDURE ou RETURN" })
  }),
  observations: z.string().optional()
}).refine((data) => {
  if (data.endTime && data.startTime >= data.endTime) {
    return false
  }
  return true
}, {
  message: "Horário de fim deve ser posterior ao horário de início",
  path: ["endTime"]
})

// Update appointment schema
export const updateAppointmentSchema = z.object({
  patientId: z.string().cuid("ID do paciente deve ser um CUID válido").optional(),
  partnerId: z.string().cuid("ID do parceiro deve ser um CUID válido").optional(),
  productServiceId: z.string().cuid("ID do produto/serviço deve ser um CUID válido").optional(),
  roomId: z.string().cuid("ID da sala deve ser um CUID válido").optional().nullable(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data deve ser uma data válida"
  }).transform((val) => new Date(val)).optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Horário de início deve estar no formato HH:MM"
  }).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Horário de fim deve estar no formato HH:MM"
  }).optional(),
  type: z.enum(['CONSULTATION', 'EXAM', 'PROCEDURE', 'RETURN'], {
    errorMap: () => ({ message: "Tipo deve ser CONSULTATION, EXAM, PROCEDURE ou RETURN" })
  }).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'], {
    errorMap: () => ({ message: "Status deve ser SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED ou NO_SHOW" })
  }).optional(),
  observations: z.string().optional(),
  cancellationReason: z.string().optional()
}).refine((data) => {
  if (data.endTime && data.startTime && data.startTime >= data.endTime) {
    return false
  }
  return true
}, {
  message: "Horário de fim deve ser posterior ao horário de início",
  path: ["endTime"]
})

// Cancel appointment schema
export const cancelAppointmentSchema = z.object({
  reason: z.string().min(1, "Motivo do cancelamento é obrigatório")
})

// Reschedule appointment schema
export const rescheduleAppointmentSchema = z.object({
  newDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Nova data deve ser uma data válida"
  }).transform((val) => new Date(val)),
  newStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Novo horário de início deve estar no formato HH:MM"
  }),
  newEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Novo horário de fim deve estar no formato HH:MM"
  }),
  newRoomId: z.string().cuid("ID da nova sala deve ser um CUID válido").optional().nullable(),
  reason: z.string().optional()
}).refine((data) => {
  if (data.newStartTime >= data.newEndTime) {
    return false
  }
  return true
}, {
  message: "Novo horário de fim deve ser posterior ao novo horário de início",
  path: ["newEndTime"]
})

// Check availability schema
export const checkAvailabilitySchema = z.object({
  partnerId: z.string().cuid("ID do parceiro deve ser um CUID válido"),
  roomId: z.string().cuid("ID da sala deve ser um CUID válido").optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data deve ser uma data válida"
  }).transform((val) => new Date(val)),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Horário de início deve estar no formato HH:MM"
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Horário de fim deve estar no formato HH:MM"
  }),
  excludeAppointmentId: z.string().cuid("ID do agendamento a excluir deve ser um CUID válido").optional()
}).refine((data) => {
  if (data.startTime >= data.endTime) {
    return false
  }
  return true
}, {
  message: "Horário de fim deve ser posterior ao horário de início",
  path: ["endTime"]
})

// Query filters schema
export const appointmentFiltersSchema = z.object({
  patientId: z.string().cuid().optional(),
  partnerId: z.string().cuid().optional(),
  roomId: z.string().cuid().optional(),
  productServiceId: z.string().cuid().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data deve ser uma data válida"
  }).transform((val) => new Date(val)).optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data de início deve ser uma data válida"
  }).transform((val) => new Date(val)).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data de fim deve ser uma data válida"
  }).transform((val) => new Date(val)).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  type: z.enum(['CONSULTATION', 'EXAM', 'PROCEDURE', 'RETURN']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
})
