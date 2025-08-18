import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ValidationErrors } from '@/components/ui/validation-errors'
import { useToast } from '@/hooks/useToast'
import { Patient } from '@/types/entities'
import { CreatePatientData, UpdatePatientData } from '@/services/patients'

// Validation schema
const patientSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter exatamente 11 dígitos'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  observations: z.string().optional(),
})

type PatientFormData = z.infer<typeof patientSchema>

interface PatientFormProps {
  patient?: Patient
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  isQuickForm?: boolean
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel,
  isLoading = false,
  isQuickForm = false
}) => {
  const { toast } = useToast()
  const [apiErrors, setApiErrors] = useState<Array<{field: string, message: string}>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient ? {
      fullName: patient.fullName,
      cpf: patient.cpf,
      birthDate: patient.birthDate instanceof Date 
        ? patient.birthDate.toISOString().split('T')[0] 
        : patient.birthDate,
      whatsapp: patient.whatsapp || '',
      phone: patient.phone || '',
      email: patient.email || '',
      street: patient.street || '',
      number: patient.number || '',
      complement: patient.complement || '',
      neighborhood: patient.neighborhood || '',
      city: patient.city || '',
      state: patient.state || '',
      zipCode: patient.zipCode || '',
      observations: patient.observations || '',
    } : {
      fullName: '',
      cpf: '',
      birthDate: '',
      whatsapp: '',
      phone: '',
      email: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      observations: '',
    }
  })

  const onFormSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true)
    setApiErrors([]) // Limpar erros anteriores
    
    try {
      await onSubmit(data)
      toast({
        title: "Sucesso!",
        description: patient ? "Paciente atualizado com sucesso." : "Paciente cadastrado com sucesso.",
        variant: "success",
      })
    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error)
      
      // Se o erro tem detalhes de validação do backend
      if (error.validationErrors && error.validationErrors.length > 0) {
        setApiErrors(error.validationErrors)
        toast({
          title: "Dados inválidos",
          description: "Por favor, corrija os erros indicados abaixo.",
          variant: "destructive",
        })
      } else {
        // Erro genérico
        toast({
          title: "Erro",
          description: error.message || "Ocorreu um erro inesperado.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    reset()
    onCancel?.()
  }

  const requiredFields = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo *</Label>
        <Input
          id="fullName"
          {...register('fullName')}
          placeholder="Digite o nome completo"
        />
        {errors.fullName && (
          <p className="text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF *</Label>
        <Input
          id="cpf"
          {...register('cpf')}
          placeholder="00000000000"
          maxLength={11}
        />
        {errors.cpf && (
          <p className="text-sm text-red-600">{errors.cpf.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate">Data de Nascimento *</Label>
        <Input
          id="birthDate"
          type="date"
          {...register('birthDate')}
        />
        {errors.birthDate && (
          <p className="text-sm text-red-600">{errors.birthDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input
          id="whatsapp"
          {...register('whatsapp')}
          placeholder="(00) 00000-0000"
        />
      </div>
    </div>
  )

  const contactFields = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="(00) 0000-0000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="email@exemplo.com"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
    </div>
  )

  const addressFields = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="street">Rua</Label>
          <Input
            id="street"
            {...register('street')}
            placeholder="Nome da rua"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">Número</Label>
          <Input
            id="number"
            {...register('number')}
            placeholder="123"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            {...register('complement')}
            placeholder="Apto, bloco, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            {...register('neighborhood')}
            placeholder="Nome do bairro"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="Nome da cidade"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            {...register('state')}
            placeholder="UF"
            maxLength={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">CEP</Label>
          <Input
            id="zipCode"
            {...register('zipCode')}
            placeholder="00000-000"
          />
        </div>
      </div>
    </div>
  )

  const observationsField = (
    <div className="space-y-2">
      <Label htmlFor="observations">Observações</Label>
      <Textarea
        id="observations"
        {...register('observations')}
        placeholder="Observações adicionais sobre o paciente"
        rows={3}
      />
    </div>
  )

  if (isQuickForm) {
    return (
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Erros de validação da API */}
        <ValidationErrors errors={apiErrors} />
        
        {requiredFields}
        {contactFields}
        {observationsField}
        
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading || isSubmitting}>
            {(isLoading || isSubmitting) ? 'Salvando...' : patient ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Erros de validação da API */}
      <ValidationErrors errors={apiErrors} />
      
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredFields}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contactFields}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent>
          {addressFields}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          {observationsField}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading || isSubmitting}>
          {(isLoading || isSubmitting) ? 'Salvando...' : patient ? 'Atualizar Paciente' : 'Cadastrar Paciente'}
        </Button>
      </div>
    </form>
  )
}