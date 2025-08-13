# Types and Validation

This directory contains TypeScript interfaces and Zod validation schemas for the Clínica Essencial application.

## Structure

- `shared.ts` - Shared types and enums used by both frontend and backend
- `entities.ts` - Entity interfaces that match the database models
- `../schemas/validation.ts` - Zod validation schemas for API requests
- `../utils/validation.ts` - Validation utility functions
- `../utils/typeConverters.ts` - Converters between Prisma and API types

## Usage

### Backend API Validation

```typescript
import { createPatientSchema } from '../schemas/validation'
import { createValidationHandler } from '../utils/validation'

// Use in Fastify routes
fastify.post('/patients', {
  preHandler: createValidationHandler(createPatientSchema)
}, async (request, reply) => {
  // request.body is now validated and typed
})
```

### Type Conversion

```typescript
import { convertPrismaPatient } from '../utils/typeConverters'

const prismaPatient = await prisma.patient.findUnique({ where: { id } })
const apiPatient = convertPrismaPatient(prismaPatient)
```

## Validation Features

- CPF/CNPJ validation
- Email format validation
- Time format validation (HH:MM)
- Required field validation
- Custom business rule validation
- Automatic type conversion (strings to dates, etc.)

## Shared Types

All enums and base interfaces are defined in `shared.ts` to ensure consistency between frontend and backend:

- `UserRole`
- `PartnershipType`
- `ServiceType`
- `AppointmentType`
- `AppointmentStatus`
- `BaseEntity`
- `Address`
- `Contacts`
- `BankingDetails`