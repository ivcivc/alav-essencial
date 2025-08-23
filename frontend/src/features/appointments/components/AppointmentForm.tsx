import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addMinutes, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Textarea } from '../../../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { usePatients } from '../../../hooks/usePatients'
import { usePartners } from '../../../hooks/usePartners'
import { useProducts } from '../../../hooks/useProducts'
import { useRooms } from '../../../hooks/useRooms'
import { useCreateAppointment, useUpdateAppointment, useCheckAvailability } from '../../../hooks/useAppointments'
import { useToast } from '../../../hooks/useToast'
import { CreateAppointmentData, Appointment, AppointmentType } from '../../../types/entities'
import { ConflictDetail } from '../../../services/appointments'
import { Calendar, Clock, User, MapPin, Briefcase, AlertCircle, CheckCircle, Plus } from 'lucide-react'

// Schema de validação
const appointmentSchema = z.object({
 patientId: z.string().min(1, 'Selecione um paciente'),
 partnerId: z.string().min(1, 'Selecione um profissional'),
 productServiceId: z.string().min(1, 'Selecione um serviço'),
 roomId: z.string().min(1, 'Selecione uma sala'),
 date: z.string().min(1, 'Selecione uma data'),
 startTime: z.string().min(1, 'Selecione um horário'),
 endTime: z.string().min(1, 'Horário de fim é obrigatório'),
 type: z.enum(['CONSULTATION', 'EXAM', 'PROCEDURE', 'RETURN']),
 isEncaixe: z.boolean().default(false),
 observations: z.string().optional(),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

interface AppointmentFormProps {
 appointment?: Appointment
 initialData?: Partial<CreateAppointmentData>
 initialDate?: Date
 initialPartnerId?: string
 initialTime?: string
 open?: boolean
 onOpenChange?: (open: boolean) => void
 onSuccess?: (appointment: Appointment) => void
 trigger?: React.ReactNode
}

const TYPE_OPTIONS = [
 { value: 'CONSULTATION', label: 'Consulta', icon: User },
 { value: 'EXAM', label: 'Exame', icon: Briefcase },
 { value: 'PROCEDURE', label: 'Procedimento', icon: MapPin },
 { value: 'RETURN', label: 'Retorno', icon: Calendar },
]

const TIME_SLOTS = Array.from({ length: 26 }, (_, i) => {
 const hour = Math.floor(i / 2) + 7 // Começar às 7:00
 const minute = (i % 2) * 30 // 00 ou 30 minutos
 return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
})

export function AppointmentForm({
 appointment,
 initialData = {},
 initialDate,
 initialPartnerId,
 initialTime,
 open,
 onOpenChange,
 onSuccess,
 trigger
}: AppointmentFormProps) {
 // Remove estado interno para usar diretamente a prop open
 const [availabilityCheck, setAvailabilityCheck] = useState<{
  checking: boolean
  available: boolean | null
  conflicts: ConflictDetail[]
 }>({
  checking: false,
  available: null,
  conflicts: []
 })

 const isEditing = Boolean(appointment)

 // Hooks
 const { toast } = useToast()
 const { data: patientsData } = usePatients({ active: true })
 const { data: partnersData } = usePartners({ active: true })
 const { data: servicesData } = useProducts({ type: 'SERVICE', active: true })
 const { data: roomsData } = useRooms({ active: true })
 
 const createAppointment = useCreateAppointment()
 const updateAppointment = useUpdateAppointment()
 const checkAvailability = useCheckAvailability()

 const patients = patientsData?.patients || []
 const partners = partnersData?.partners || []
 const services = servicesData?.productServices || []
 const rooms = roomsData?.rooms || []

 // Form setup
 const form = useForm<AppointmentFormData>({
  resolver: zodResolver(appointmentSchema),
  defaultValues: {
   patientId: appointment?.patientId || initialData.patientId || '',
   partnerId: appointment?.partnerId || initialData.partnerId || initialPartnerId || '',
   productServiceId: appointment?.productServiceId || initialData.productServiceId || '',
   roomId: appointment?.roomId || initialData.roomId || '',
   date: appointment?.date ? format(new Date(appointment.date), 'yyyy-MM-dd') : 
      initialDate ? format(initialDate, 'yyyy-MM-dd') : 
      initialData.date || '',
   startTime: appointment?.startTime || initialData.startTime || initialTime || '',
   endTime: appointment?.endTime || initialData.endTime || '',
   type: appointment?.type || initialData.type || 'CONSULTATION',
   observations: appointment?.observations || initialData.observations || '',
  }
 })

 // Watch specific fields to avoid unnecessary re-renders
 const watchedProductServiceId = form.watch('productServiceId')
 const watchedStartTime = form.watch('startTime')
 const watchedPartnerId = form.watch('partnerId')
 const watchedDate = form.watch('date')
 const watchedEndTime = form.watch('endTime')

 // Auto calcular endTime baseado no serviço selecionado
 useEffect(() => {
  if (watchedProductServiceId && watchedStartTime) {
   const selectedService = services.find(s => s.id === watchedProductServiceId)
   if (selectedService?.durationMinutes) {
    const [hours, minutes] = watchedStartTime.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    const endDate = addMinutes(startDate, selectedService.durationMinutes)
    const endTime = format(endDate, 'HH:mm')
    
    // Only update if endTime has changed to prevent loops
    const currentEndTime = form.getValues('endTime')
    if (currentEndTime !== endTime) {
     form.setValue('endTime', endTime)
    }
   }
  }
 }, [watchedProductServiceId, watchedStartTime, services, form])

 // Manual availability check function
 const handleCheckAvailability = () => {
  if (watchedPartnerId && watchedDate && watchedStartTime && watchedEndTime) {
   setAvailabilityCheck(prev => ({ ...prev, checking: true }))
   
   checkAvailability.mutate(
    {
     partnerId: watchedPartnerId,
     date: watchedDate,
     startTime: watchedStartTime,
     endTime: watchedEndTime,
     excludeAppointmentId: appointment?.id
    },
    {
     onSuccess: (data) => {
      setAvailabilityCheck({
       checking: false,
       available: data.available,
       conflicts: data.conflicts || []
      })
     },
     onError: () => {
      setAvailabilityCheck({
       checking: false,
       available: null,
       conflicts: []
      })
     }
    }
   )
  }
 }

 const handleSubmit = form.handleSubmit(async (data) => {
  try {
   if (isEditing && appointment) {
    const result = await updateAppointment.mutateAsync({
     id: appointment.id,
     data
    })
    toast({
     title: "Agendamento atualizado",
     description: "As alterações foram salvas com sucesso.",
     variant: "default",
    })
    onSuccess?.(result)
   } else {
    const result = await createAppointment.mutateAsync(data)
    toast({
     title: "Agendamento criado",
     description: "O agendamento foi criado com sucesso.",
     variant: "default",
    })
    onSuccess?.(result)
   }
   
   form.reset()
   setIsOpen(false)
   onOpenChange?.(false)
  } catch (error: any) {
   console.error('Erro ao salvar agendamento:', error)
   toast({
    title: isEditing ? "Erro ao atualizar agendamento" : "Erro ao criar agendamento",
    description: error?.message || 'Ocorreu um erro inesperado. Tente novamente.',
    variant: "destructive",
   })
  }
 })

 const handleOpenChange = (newOpen: boolean) => {
  onOpenChange?.(newOpen)
  if (!newOpen) {
   form.reset()
   setAvailabilityCheck({
    checking: false,
    available: null,
    conflicts: []
   })
  }
 }

 const getSelectedPatient = () => patients.find(p => p.id === form.watch('patientId'))
 const getSelectedPartner = () => partners.find(p => p.id === watchedPartnerId)
 const getSelectedService = () => services.find(s => s.id === watchedProductServiceId)
 const getSelectedRoom = () => rooms.find(r => r.id === form.watch('roomId'))

 return (
  <Dialog open={open || false} onOpenChange={handleOpenChange}>
   {trigger && (
    <DialogTrigger asChild>
     {trigger}
    </DialogTrigger>
   )}
   
   <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
     <DialogTitle className="flex items-center gap-2">
      <Calendar className="w-5 h-5" />
      {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
     </DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-6">
     {/* Seção de Seleção */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Paciente */}
      <div className="space-y-2">
       <Label htmlFor="patientId" className="flex items-center gap-1">
        <User className="w-4 h-4" />
        Paciente *
       </Label>
       <Select
        value={form.watch('patientId')}
        onValueChange={(value) => form.setValue('patientId', value)}
       >
        <SelectTrigger>
         <SelectValue placeholder="Selecione um paciente" />
        </SelectTrigger>
        <SelectContent>
         {patients.map(patient => (
          <SelectItem key={patient.id} value={patient.id}>
           <div>
            <div className="font-medium">{patient.fullName}</div>
            <div className="text-sm text-muted-foreground">{patient.cpf}</div>
           </div>
          </SelectItem>
         ))}
        </SelectContent>
       </Select>
       {form.formState.errors.patientId && (
        <p className="text-sm ">{form.formState.errors.patientId.message}</p>
       )}
      </div>

      {/* Profissional */}
      <div className="space-y-2">
       <Label htmlFor="partnerId" className="flex items-center gap-1">
        <User className="w-4 h-4" />
        Profissional *
       </Label>
       <Select
        value={form.watch('partnerId')}
        onValueChange={(value) => form.setValue('partnerId', value)}
       >
        <SelectTrigger>
         <SelectValue placeholder="Selecione um profissional" />
        </SelectTrigger>
        <SelectContent>
         {partners.map(partner => (
          <SelectItem key={partner.id} value={partner.id}>
           <div>
            <div className="font-medium">{partner.fullName}</div>
            <div className="text-sm text-muted-foreground">
             {partner.partnershipType === 'SUBLEASE' ? 'Sublocação' : 
              partner.partnershipType === 'PERCENTAGE' ? 'Porcentagem' : 
              'Porcentagem + Produtos'}
            </div>
           </div>
          </SelectItem>
         ))}
        </SelectContent>
       </Select>
       {form.formState.errors.partnerId && (
        <p className="text-sm ">{form.formState.errors.partnerId.message}</p>
       )}
      </div>

      {/* Serviço */}
      <div className="space-y-2">
       <Label htmlFor="productServiceId" className="flex items-center gap-1">
        <Briefcase className="w-4 h-4" />
        Serviço *
       </Label>
       <Select
        value={form.watch('productServiceId')}
        onValueChange={(value) => form.setValue('productServiceId', value)}
       >
        <SelectTrigger>
         <SelectValue placeholder="Selecione um serviço" />
        </SelectTrigger>
        <SelectContent>
         {services.map(service => (
          <SelectItem key={service.id} value={service.id}>
           <div>
            <div className="font-medium">{service.name}</div>
            <div className="text-sm text-muted-foreground">
             {service.durationMinutes} min • R$ {service.salePrice?.toFixed(2)}
            </div>
           </div>
          </SelectItem>
         ))}
        </SelectContent>
       </Select>
       {form.formState.errors.productServiceId && (
        <p className="text-sm ">{form.formState.errors.productServiceId.message}</p>
       )}
      </div>

      {/* Sala */}
      <div className="space-y-2">
       <Label htmlFor="roomId" className="flex items-center gap-1">
        <MapPin className="w-4 h-4" />
        Sala *
       </Label>
       <Select
        value={form.watch('roomId')}
        onValueChange={(value) => form.setValue('roomId', value)}
       >
        <SelectTrigger>
         <SelectValue placeholder="Selecione uma sala" />
        </SelectTrigger>
        <SelectContent>
         {rooms.map(room => (
          <SelectItem key={room.id} value={room.id}>
           <div>
            <div className="font-medium">{room.name}</div>
            {room.description && (
             <div className="text-sm text-muted-foreground">{room.description}</div>
            )}
           </div>
          </SelectItem>
         ))}
        </SelectContent>
       </Select>
       {form.formState.errors.roomId && (
        <p className="text-sm ">{form.formState.errors.roomId.message}</p>
       )}
      </div>
     </div>

     {/* Data e Horário */}
     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="space-y-2">
       <Label htmlFor="date" className="flex items-center gap-1">
        <Calendar className="w-4 h-4" />
        Data *
       </Label>
       <Input
        type="date"
        {...form.register('date')}
        min={format(new Date(), 'yyyy-MM-dd')}
       />
       {form.formState.errors.date && (
        <p className="text-sm ">{form.formState.errors.date.message}</p>
       )}
      </div>

      <div className="space-y-2">
       <Label htmlFor="startTime" className="flex items-center gap-1">
        <Clock className="w-4 h-4" />
        Hora Início *
       </Label>
       <Select
        value={form.watch('startTime')}
        onValueChange={(value) => form.setValue('startTime', value)}
       >
        <SelectTrigger>
         <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
         {TIME_SLOTS.map(time => (
          <SelectItem key={time} value={time}>
           {time}
          </SelectItem>
         ))}
        </SelectContent>
       </Select>
       {form.formState.errors.startTime && (
        <p className="text-sm ">{form.formState.errors.startTime.message}</p>
       )}
      </div>

      <div className="space-y-2">
       <Label htmlFor="endTime" className="flex items-center gap-1">
        <Clock className="w-4 h-4" />
        Hora Fim *
       </Label>
       <Input
        type="time"
        {...form.register('endTime')}
        readOnly
        className="bg-card"
       />
       {form.formState.errors.endTime && (
        <p className="text-sm ">{form.formState.errors.endTime.message}</p>
       )}
      </div>

      <div className="space-y-2">
       <Label htmlFor="type" className="flex items-center gap-1">
        <Briefcase className="w-4 h-4" />
        Tipo *
       </Label>
       <Select
        value={form.watch('type')}
        onValueChange={(value) => form.setValue('type', value as AppointmentType)}
       >
        <SelectTrigger>
         <SelectValue />
        </SelectTrigger>
        <SelectContent>
         {TYPE_OPTIONS.map(type => {
          const Icon = type.icon
          return (
           <SelectItem key={type.value} value={type.value}>
            <div className="flex items-center gap-2">
             <Icon className="w-4 h-4" />
             {type.label}
            </div>
           </SelectItem>
          )
         })}
        </SelectContent>
       </Select>
       {form.formState.errors.type && (
        <p className="text-sm ">{form.formState.errors.type.message}</p>
       )}
      </div>
     </div>

     {/* Verificação de Disponibilidade */}
     {(watchedPartnerId && watchedDate && watchedStartTime) && (
      <Card>
       <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
         <div className="flex items-center gap-2">
          {availabilityCheck.checking ? (
           <div className="animate-spin w-4 h-4 border-2  border-t-transparent rounded-full" />
          ) : availabilityCheck.available === true ? (
           <CheckCircle className="w-4 h-4 " />
          ) : availabilityCheck.available === false ? (
           <AlertCircle className="w-4 h-4 " />
          ) : (
           <Clock className="w-4 h-4 text-muted-foreground" />
          )}
          Verificação de Disponibilidade
         </div>
         <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCheckAvailability}
          disabled={availabilityCheck.checking || !watchedEndTime}
         >
          {availabilityCheck.checking ? 'Verificando...' : 'Verificar'}
         </Button>
        </CardTitle>
       </CardHeader>
       <CardContent className="pt-0">
        {availabilityCheck.checking ? (
         <p className="text-sm text-muted-foreground">Verificando disponibilidade...</p>
        ) : availabilityCheck.available === true ? (
         <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 ">
           Horário Disponível
          </Badge>
          <span className="text-sm text-muted-foreground">
           O profissional está livre neste horário
          </span>
         </div>
        ) : availabilityCheck.available === false ? (
         <div className="space-y-2">
          <Badge variant="outline" className={
           form.watch('isEncaixe') 
            ? "bg-orange-50 text-orange-700 border-orange-200"
            : "bg-red-50 text-red-700 border-red-200"
          }>
           {form.watch('isEncaixe') ? '📌 Encaixe Permitido' : 'Conflito de Horário'}
          </Badge>
          {availabilityCheck.conflicts.length > 0 && (
           <div className="text-sm text-muted-foreground">
            <p className="font-medium">Conflitos detectados:</p>
            <ul className="mt-1 space-y-2">
             {availabilityCheck.conflicts.map((conflict, index) => (
              <li key={index} className="border-l-4  pl-3 py-1">
               <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 ">
                 {conflict.type === 'appointment' ? 'Agendamento' : 
                  conflict.type === 'availability' ? 'Expediente' :
                  conflict.type === 'blocked' ? 'Bloqueado' : 
                  'Intervalo'}
                </Badge>
                {conflict.timeSlot && (
                 <span className="text-xs text-muted-foreground">
                  {conflict.timeSlot.startTime} - {conflict.timeSlot.endTime}
                 </span>
                )}
               </div>
               <p className="text-xs text-muted-foreground">{conflict.message}</p>
               {conflict.appointment && (
                <div className="text-xs text-muted-foreground mt-1">
                 <span className="font-medium">Paciente:</span> {conflict.appointment.patient?.fullName || 'Não informado'}
                </div>
               )}
              </li>
             ))}
            </ul>
            {form.watch('isEncaixe') && (
             <div className="mt-2 p-2 bg-orange-50 rounded border ">
              <p className="text-xs ">
               💡 <strong>Encaixe permitido:</strong> Como esta opção está marcada, 
               os conflitos de horário são ignorados e o agendamento pode ser criado.
              </p>
             </div>
            )}
           </div>
          )}
         </div>
        ) : null}
       </CardContent>
      </Card>
     )}

     {/* Encaixe */}
     <div className="space-y-2">
      <div className="flex items-center space-x-2">
       <input
        type="checkbox"
        id="isEncaixe"
        {...form.register('isEncaixe')}
        className="h-4 w-4 text-primary focus:ring-blue-500 border-border rounded"
       />
       <Label htmlFor="isEncaixe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        📌 Encaixe
       </Label>
      </div>
      <p className="text-xs text-muted-foreground ml-6">
       Marque esta opção para permitir agendamento mesmo em horários já ocupados. 
       Útil para casos urgentes ou encaixes rápidos entre consultas.
      </p>
     </div>

     {/* Observações */}
     <div className="space-y-2">
      <Label htmlFor="observations">Observações</Label>
      <Textarea
       {...form.register('observations')}
       placeholder="Observações adicionais sobre o agendamento..."
       rows={3}
      />
     </div>

     {/* Resumo */}
     {(getSelectedPatient() || getSelectedPartner() || getSelectedService() || getSelectedRoom()) && (
      <Card>
       <CardHeader>
        <CardTitle className="text-sm">Resumo do Agendamento</CardTitle>
       </CardHeader>
       <CardContent className="space-y-2">
        {getSelectedPatient() && (
         <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Paciente:</span>
          <span>{getSelectedPatient()?.fullName}</span>
         </div>
        )}
        {getSelectedPartner() && (
         <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Profissional:</span>
          <span>{getSelectedPartner()?.fullName}</span>
         </div>
        )}
        {getSelectedService() && (
         <div className="flex items-center gap-2 text-sm">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Serviço:</span>
          <span>{getSelectedService()?.name}</span>
          <Badge variant="outline">
           {getSelectedService()?.durationMinutes} min
          </Badge>
         </div>
        )}
        {getSelectedRoom() && (
         <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Sala:</span>
          <span>{getSelectedRoom()?.name}</span>
         </div>
        )}
        {watchedDate && watchedStartTime && (
         <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Data/Hora:</span>
          <span>
           {format(new Date(watchedDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
           {' às '}
           {watchedStartTime}
           {watchedEndTime && ` - ${watchedEndTime}`}
          </span>
         </div>
        )}
       </CardContent>
      </Card>
     )}

     {/* Botões */}
     <div className="flex items-center justify-end gap-3">
      <Button
       type="button"
       variant="outline"
       onClick={() => handleOpenChange(false)}
      >
       Cancelar
      </Button>
      <Button
       type="submit"
       disabled={
        form.formState.isSubmitting || 
        availabilityCheck.checking ||
        (availabilityCheck.available === false && !form.watch('isEncaixe')) ||
        createAppointment.isPending ||
        updateAppointment.isPending
       }
      >
       {form.formState.isSubmitting ? (
        <div className="flex items-center gap-2">
         <div className="animate-spin w-4 h-4 border-2 border-border border-t-transparent rounded-full" />
         {isEditing ? 'Atualizando...' : 'Criando...'}
        </div>
       ) : (
        <>
         {isEditing ? 'Atualizar' : 'Criar'} Agendamento
        </>
       )}
      </Button>
     </div>
    </form>
   </DialogContent>
  </Dialog>
 )
}
