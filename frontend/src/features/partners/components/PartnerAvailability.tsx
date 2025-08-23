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
import { usePartnerAvailability, useCreatePartnerAvailability } from '@/hooks/usePartners'
import { PartnerAvailability } from '@/types/entities'

// Validation Schema
const availabilitySchema = z.object({
 dayOfWeek: z.number().min(0).max(6),
 startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
 endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
 breakStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)').optional(),
 breakEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)').optional(),
}).refine((data) => {
 // Validate start time < end time
 if (data.startTime >= data.endTime) {
  return false
 }
 
 // Validate break times if both are provided
 if (data.breakStart && data.breakEnd) {
  if (data.breakStart >= data.breakEnd) {
   return false
  }
  // Break should be within working hours
  if (data.breakStart < data.startTime || data.breakEnd > data.endTime) {
   return false
  }
 }
 
 return true
}, {
 message: 'Horários inválidos',
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

 const { data: availability, isLoading } = usePartnerAvailability(partnerId)
 const createAvailability = useCreatePartnerAvailability()

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
  createAvailability.mutate(
   { partnerId, data },
   {
    onSuccess: () => {
     setIsDialogOpen(false)
     reset()
     setEditingAvailability(null)
    },
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
  setIsDialogOpen(true)
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
         <Select onValueChange={(value) => setValue('dayOfWeek', parseInt(value))}>
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
         </div>

         <div>
          <Label htmlFor="breakEnd">Pausa Fim (opcional)</Label>
          <Input
           id="breakEnd"
           type="time"
           {...register('breakEnd')}
          />
         </div>
        </div>

        <div className="text-xs text-muted-foreground">
         * Se informar pausa, ambos os horários são obrigatórios
        </div>

        <div className="flex justify-end space-x-2">
         <Button
          type="button"
          variant="outline"
          onClick={() => {
           setIsDialogOpen(false)
           reset()
           setEditingAvailability(null)
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
          ? 'bg-green-50 border-green-200'
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
           className="h-8 w-8 p-0 text-red-500 hover:"
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
   </CardContent>
  </Card>
 )
}
