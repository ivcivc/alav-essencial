# Frontend Types and Validation

This directory contains TypeScript interfaces and Zod validation schemas for the frontend application.

## Structure

- `shared.ts` - Shared types and enums (mirrors backend)
- `entities.ts` - Entity interfaces and API response types
- `schemas.ts` - Zod validation schemas for forms and user input
- `index.ts` - Main export file for all types
- `../utils/validation.ts` - Validation and formatting utilities

## Usage

### Form Validation with React Hook Form

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientFormSchema, PatientFormData } from '../types'

const form = useForm<PatientFormData>({
  resolver: zodResolver(patientFormSchema)
})
```

### Type-Safe API Calls

```typescript
import { Patient, ApiResponse } from '../types'

const response: ApiResponse<Patient> = await api.post('/patients', data)
```

### Input Formatting

```typescript
import { formatCPF, maskPhone } from '../utils/validation'

const formattedCPF = formatCPF('12345678901') // 123.456.789-01
const maskedPhone = maskPhone('11999999999') // (11) 99999-9999
```

## Form Schemas

All form validation schemas include:

- Required field validation
- Format validation (CPF, email, phone, time)
- Business rule validation
- Custom error messages in Portuguese
- Type inference for form data

## Validation Features

- Real-time input masking
- CPF/CNPJ validation
- Email format validation
- Phone number formatting
- Currency formatting
- Date/time formatting
- Custom validation rules

## API Types

- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated list responses
- `ApiError` - Error response structure
- Extended entity types with relations for complex data