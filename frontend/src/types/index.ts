// Export all types and schemas
export * from './shared'
export * from './entities'
export * from './schemas'
export * from './auth'

// Re-export commonly used types for convenience
export type {
  Patient,
  Partner,
  Appointment,
  ProductService,
  Room,
  Category,
  User,
  PartnerAvailability,
  PatientWithAppointments,
  PartnerWithRelations,
  ProductServiceWithRelations,
  AppointmentWithRelations,
  RoomWithRelations,
  CategoryWithRelations,
  ApiResponse,
  PaginatedResponse,
  ApiError
} from './entities'

export {
  UserRole,
  PartnershipType,
  ServiceType,
  AppointmentType,
  AppointmentStatus
} from './shared'

export {
  patientFormSchema,
  partnerFormSchema,
  appointmentFormSchema,
  productServiceFormSchema,
  roomFormSchema,
  categoryFormSchema,
  loginFormSchema,
  userFormSchema
} from './schemas'