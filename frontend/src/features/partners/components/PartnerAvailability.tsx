import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Clock, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal'
import { usePartnerAvailability, useCreatePartnerAvailability, useUpdatePartnerAvailability, useDeletePartnerAvailability } from '@/hooks/usePartners'
import { PartnerAvailability } from '@/types/entities'

// Validation Schema
const availabilitySchema = z.object({
 dayOfWeek: z.number().min(0, 'Dia da semana é obrigatório').max(6, 'Dia da semana inválido'),
 startTime: z.string().min(1, 'Hora de início é obrigatória').regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
 endTime: z.string().min(1, 'Hora de fim é obrigatória').regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
 breakStart: z.string().optional().or(z.literal('')),
 breakEnd: z.string().optional().or(z.literal('')),
}).refine((data) => {
 // Validate start time < end time
 if (data.startTime >= data.endTime) {
  return false
 }
 return true
}, {
 message: 'Hora de início deve ser menor que hora de fim',
 path: ['startTime']
}).refine((data) => {
 // Validate break format if provided
 if (data.breakStart && data.breakStart.trim() !== '' && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.breakStart)) {
  return false
 }
 if (data.breakEnd && data.breakEnd.trim() !== '' && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.breakEnd)) {
  return false
 }
 return true
}, {
 message: 'Formato inválido para horário de pausa (HH:MM)',
 path: ['breakStart']
}).refine((data) => {
 // Both break times should be provided or none (but empty is OK)
 const hasBreakStart = data.breakStart && data.breakStart.trim() !== ''
 const hasBreakEnd = data.breakEnd && data.breakEnd.trim() !== ''
 
 if ((hasBreakStart && !hasBreakEnd) || (!hasBreakStart && hasBreakEnd)) {
  return false
 }
 return true
}, {
 message: 'Para definir pausa, informe tanto o início quanto o fim',
 path: ['breakStart']
}).refine((data) => {
 // Validate break times if both are provided
 const hasBreakStart = data.breakStart && data.breakStart.trim() !== ''
 const hasBreakEnd = data.breakEnd && data.breakEnd.trim() !== ''
 
 if (hasBreakStart && hasBreakEnd) {
  if (data.breakStart! >= data.breakEnd!) {
   return false
  }
 }
 return true
}, {
 message: 'Hora de início da pausa deve ser menor que hora de fim da pausa',
 path: ['breakStart']
}).refine((data) => {
 // Break should be within working hours
 const hasBreakStart = data.breakStart && data.breakStart.trim() !== ''
 const hasBreakEnd = data.breakEnd && data.breakEnd.trim() !== ''
 
 if (hasBreakStart && hasBreakEnd) {
  if (data.breakStart! < data.startTime || data.breakEnd! > data.endTime) {
   return false
  }
 }
 return true
}, {
 message: 'Pausa deve estar dentro do horário de trabalho',
 path: ['breakStart']
})

type AvailabilityFormData = z.infer<typeof availabilitySchema>

interface PartnerAvailabilityProps {
 partnerId: string
}

const DAYS_OF_WEEK = [
 { value: 1, label: 'Segunda-feira', short: 'Seg' },
 { value: 2, label: 'Terça-feira', short: 'Ter' },
 { value: 3, label: 'Quarta-feira', short: 'Qua' },
 { value: 4, label: 'Quinta-feira', short: 'Qui' },
 { value: 5, label: 'Sexta-feira', short: 'Sex' },
 { value: 6, label: 'Sábado', short: 'Sáb' },
 { value: 0, label: 'Domingo', short: 'Dom' },
]

export function PartnerAvailabilityComponent({ partnerId }: PartnerAvailabilityProps) {
 const [isDialogOpen, setIsDialogOpen] = useState(false)
 const [editingAvailability, setEditingAvailability] = useState<PartnerAvailability | null>(null)
 const [submitError, setSubmitError] = useState<string | null>(null)
 const [deleteModal, setDeleteModal] = useState<{
  open: boolean
  availability: PartnerAvailability | null
 }>({ open: false, availability: null })

 const { data: availability, isLoading } = usePartnerAvailability(partnerId)
 const createAvailability = useCreatePartnerAvailability()
 const updateAvailability = useUpdatePartnerAvailability()
 const deleteAvailability = useDeletePartnerAvailability()

 const {
  register,
  handleSubmit,
  setValue,
  reset,
  watch,
  formState: { errors },
 } = useForm<AvailabilityFormData>({
  resolver: zodResolver(availabilitySchema),
 })

 const selectedDayOfWeek = watch('dayOfWeek')

 const handleCreateAvailability = (data: AvailabilityFormData) => {
  setSubmitError(null) // Limpar erro anterior
  
  // Limpar campos vazios de pausa antes de enviar
  const cleanData = {
    ...data,
    breakStart: data.breakStart && data.breakStart.trim() !== '' ? data.breakStart : undefined,
    breakEnd: data.breakEnd && data.breakEnd.trim() !== '' ? data.breakEnd : undefined,
  }
  
  // 🎯 USAR CREATE OU UPDATE BASEADO NO ESTADO
  const isEditing = editingAvailability !== null
  const mutation = isEditing ? updateAvailability : createAvailability
  const mutationData = isEditing 
    ? { availabilityId: editingAvailability!.id, data: cleanData }
    : { partnerId, data: cleanData }
  
  mutation.mutate(
   mutationData as any,
   {
    onSuccess: () => {
     setIsDialogOpen(false)
     reset()
     setEditingAvailability(null)
     setSubmitError(null)
    },
    onError: (error: any) => {
     console.error('Erro ao salvar disponibilidade:', error)
     
     // Melhorar mensagens de erro baseadas no tipo
     let errorMessage = 'Erro inesperado ao salvar disponibilidade'
     
     if (error?.message) {
       const msg = error.message.toLowerCase()
       if (msg.includes('bad request') || msg.includes('validation') || msg.includes('invalid')) {
         errorMessage = 'Dados inválidos. Verifique os horários informados.'
       } else if (msg.includes('conflict') || msg.includes('already exists')) {
         errorMessage = 'Já existe disponibilidade cadastrada para este dia.'
       } else if (msg.includes('not found')) {
         errorMessage = 'Parceiro não encontrado. Tente recarregar a página.'
       } else if (msg.includes('unauthorized') || msg.includes('forbidden')) {
         errorMessage = 'Você não tem permissão para realizar esta ação.'
       } else if (msg.includes('network') || msg.includes('fetch')) {
         errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
       } else {
         errorMessage = error.message
       }
     }
     
     setSubmitError(errorMessage)
    }
   }
  )
 }

 const handleEditAvailability = (avail: PartnerAvailability) => {
  setEditingAvailability(avail)
  setValue('dayOfWeek', avail.dayOfWeek)
  setValue('startTime', avail.startTime)
  setValue('endTime', avail.endTime)
  setValue('breakStart', avail.breakStart || '')
  setValue('breakEnd', avail.breakEnd || '')
  setSubmitError(null) // Limpar erro ao abrir para editar
  setIsDialogOpen(true)
 }

 const handleDeleteAvailability = (avail: PartnerAvailability) => {
  setDeleteModal({ open: true, availability: avail })
 }

 const handleConfirmDelete = async () => {
  if (!deleteModal.availability) return

  console.log('🗑️ Tentando deletar disponibilidade:', {
    availabilityId: deleteModal.availability.id,
    partnerId,
    url: `/api/partners/availability/${deleteModal.availability.id}`
  })

  try {
   const result = await deleteAvailability.mutateAsync({ 
    availabilityId: deleteModal.availability.id, 
    partnerId 
   })
   console.log('✅ Delete bem-sucedido:', result)
   setDeleteModal({ open: false, availability: null })
  } catch (error) {
   console.error('❌ Erro ao deletar disponibilidade:', error)
   console.error('❌ Detalhes do erro:', {
     message: error?.message,
     status: error?.status,
     response: error?.response,
     stack: error?.stack
   })
  }
 }

 const getAvailabilityForDay = (dayOfWeek: number) => {
  return availability?.find((a) => a.dayOfWeek === dayOfWeek && a.active)
 }

 const getDayLabel = (dayOfWeek: number) => {
  return DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.short || 'N/A'
 }

 const formatTimeRange = (avail: PartnerAvailability) => {
  let timeRange = `${avail.startTime} - ${avail.endTime}`
  if (avail.breakStart && avail.breakEnd) {
   timeRange += ` (Pausa: ${avail.breakStart} - ${avail.breakEnd})`
  }
  return timeRange
 }

 if (isLoading) {
  return (
   <Card>
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <Clock className="h-5 w-5" />
      Disponibilidade Semanal
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="text-center py-8">Carregando disponibilidade...</div>
    </CardContent>
   </Card>
  )
 }

 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center justify-between">
     <div className="flex items-center gap-2">
      <Clock className="h-5 w-5" />
      Disponibilidade Semanal
     </div>
     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
       <Button size="sm" onClick={() => {
        reset()
        setEditingAvailability(null)
        setSubmitError(null)
       }}>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Horário
       </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
       <DialogHeader>
        <DialogTitle>
         {editingAvailability ? 'Editar' : 'Adicionar'} Disponibilidade
        </DialogTitle>
       </DialogHeader>
       
       <form onSubmit={handleSubmit(handleCreateAvailability)} className="space-y-4">
        <div>
         <Label htmlFor="dayOfWeek">Dia da Semana</Label>
         <Select 
           value={selectedDayOfWeek?.toString()} 
           onValueChange={(value) => setValue('dayOfWeek', parseInt(value))}
         >
          <SelectTrigger>
           <SelectValue placeholder="Selecione o dia" />
          </SelectTrigger>
          <SelectContent>
           {DAYS_OF_WEEK.map((day) => (
            <SelectItem key={day.value} value={day.value.toString()}>
             {day.label}
            </SelectItem>
           ))}
          </SelectContent>
         </Select>
         {errors.dayOfWeek && (
          <p className="text-sm  mt-1">{errors.dayOfWeek.message}</p>
         )}
        </div>

        <div className="grid grid-cols-2 gap-4">
         <div>
          <Label htmlFor="startTime">Hora Início</Label>
          <Input
           id="startTime"
           type="time"
           {...register('startTime')}
          />
          {errors.startTime && (
           <p className="text-sm  mt-1">{errors.startTime.message}</p>
          )}
         </div>

         <div>
          <Label htmlFor="endTime">Hora Fim</Label>
          <Input
           id="endTime"
           type="time"
           {...register('endTime')}
          />
          {errors.endTime && (
           <p className="text-sm  mt-1">{errors.endTime.message}</p>
          )}
         </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
         <div>
          <Label htmlFor="breakStart">Pausa Início (opcional)</Label>
          <Input
           id="breakStart"
           type="time"
           {...register('breakStart')}
          />
          {errors.breakStart && (
           <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.breakStart.message}</p>
          )}
         </div>

         <div>
          <Label htmlFor="breakEnd">Pausa Fim (opcional)</Label>
          <Input
           id="breakEnd"
           type="time"
           {...register('breakEnd')}
          />
          {errors.breakEnd && (
           <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.breakEnd.message}</p>
          )}
         </div>
        </div>

        <div className="text-xs text-muted-foreground">
         * Se informar pausa, ambos os horários são obrigatórios
        </div>

        {/* Exibir erro se houver */}
        {submitError && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
            <div className="flex items-start gap-2">
              <span className="text-red-600 dark:text-red-400 mt-0.5">⚠️</span>
              <div className="flex-1">
                <h4 className="font-medium text-red-800 dark:text-red-300 text-sm mb-1">
                  Erro ao salvar
                </h4>
                <p className="text-xs text-red-700 dark:text-red-400">
                  {submitError}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
         <Button
          type="button"
          variant="outline"
          onClick={() => {
           setIsDialogOpen(false)
           reset()
           setEditingAvailability(null)
           setSubmitError(null)
          }}
         >
          Cancelar
         </Button>
         <Button type="submit" disabled={createAvailability.isPending}>
          {createAvailability.isPending ? 'Salvando...' : editingAvailability ? 'Atualizar' : 'Adicionar'}
         </Button>
        </div>
       </form>
      </DialogContent>
     </Dialog>
    </CardTitle>
   </CardHeader>
   <CardContent>
    {/* Weekly Schedule Grid */}
    <div className="grid grid-cols-7 gap-2 mb-6">
     {DAYS_OF_WEEK.map((day) => {
      const dayAvailability = getAvailabilityForDay(day.value)
      
      return (
       <div
        key={day.value}
        className={`p-3 rounded-lg border text-center ${
         dayAvailability
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-card border-border'
        }`}
       >
        <div className="font-medium text-sm mb-1">{day.short}</div>
        {dayAvailability ? (
         <div className="space-y-1">
          <Badge variant="secondary" className="text-xs">
           {dayAvailability.startTime} - {dayAvailability.endTime}
          </Badge>
          {dayAvailability.breakStart && dayAvailability.breakEnd && (
           <Badge variant="outline" className="text-xs block">
            Pausa: {dayAvailability.breakStart} - {dayAvailability.breakEnd}
           </Badge>
          )}
          <div className="flex justify-center space-x-1 mt-2">
           <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditAvailability(dayAvailability)}
            className="h-6 w-6 p-0"
           >
            <Edit className="h-3 w-3" />
           </Button>
          </div>
         </div>
        ) : (
         <div className="text-xs text-muted-foreground">Indisponível</div>
        )}
       </div>
      )
     })}
    </div>

    {/* Detailed List */}
    {availability && availability.length > 0 ? (
     <div className="space-y-2">
      <h4 className="font-medium text-sm text-muted-foreground">Horários Configurados:</h4>
      {availability
       .filter((a) => a.active)
       .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
       .map((avail) => (
        <div
         key={avail.id}
         className="flex items-center justify-between p-3 bg-card rounded-lg"
        >
         <div className="flex items-center space-x-3">
          <Badge variant="outline">
           {DAYS_OF_WEEK.find((d) => d.value === avail.dayOfWeek)?.label}
          </Badge>
          <span className="text-sm font-mono">
           {formatTimeRange(avail)}
          </span>
         </div>
         <div className="flex space-x-1">
          <Button
           size="sm"
           variant="ghost"
           onClick={() => handleEditAvailability(avail)}
           className="h-8 w-8 p-0"
          >
           <Edit className="h-4 w-4" />
          </Button>
          <Button
           size="sm"
           variant="ghost"
           className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
           onClick={() => handleDeleteAvailability(avail)}
          >
           <Trash2 className="h-4 w-4" />
          </Button>
         </div>
        </div>
       ))}
     </div>
    ) : (
     <div className="text-center py-8 text-muted-foreground">
      <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <p>Nenhum horário de disponibilidade configurado</p>
      <p className="text-sm">Clique em "Adicionar Horário" para começar</p>
     </div>
    )}

    {/* Modal de Confirmação de Exclusão */}
    <ConfirmDeleteModal
     open={deleteModal.open}
     onOpenChange={(open) => setDeleteModal({ open, availability: deleteModal.availability })}
     onConfirm={handleConfirmDelete}
     itemName={deleteModal.availability ? `${DAYS_OF_WEEK.find((d) => d.value === deleteModal.availability!.dayOfWeek)?.label} - ${deleteModal.availability.startTime} às ${deleteModal.availability.endTime}` : ''}
     itemType="disponibilidade"
     isLoading={deleteAvailability.isPending}
     description={`Tem certeza que deseja remover esta disponibilidade?`}
     warnings={[
      'Esta ação remove permanentemente a disponibilidade do parceiro',
      'Agendamentos futuros neste horário podem ser afetados',
      'Esta ação não pode ser desfeita'
     ]}
    />
   </CardContent>
  </Card>
 )
}
