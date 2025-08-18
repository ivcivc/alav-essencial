import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from './alert'

interface ValidationError {
  field: string
  message: string
}

interface ValidationErrorsProps {
  errors: ValidationError[]
  className?: string
}

export function ValidationErrors({ errors, className = '' }: ValidationErrorsProps) {
  if (!errors || errors.length === 0) {
    return null
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1">
          <p className="font-medium">Por favor, corrija os seguintes erros:</p>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm">
                <span className="font-medium capitalize">{formatFieldName(error.field)}:</span> {error.message}
              </li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  )
}

function formatFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    fullName: 'Nome completo',
    cpf: 'CPF',
    birthDate: 'Data de nascimento',
    whatsapp: 'WhatsApp',
    phone: 'Telefone',
    email: 'Email',
    street: 'Rua',
    number: 'Número',
    complement: 'Complemento',
    neighborhood: 'Bairro',
    city: 'Cidade',
    state: 'Estado',
    zipCode: 'CEP',
    observations: 'Observações'
  }
  
  return fieldNames[field] || field
}
