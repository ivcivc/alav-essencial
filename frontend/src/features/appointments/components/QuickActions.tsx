import React from 'react'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { useCheckInAppointment, useCheckOutAppointment, useCancelAppointment } from '../../../hooks/useAppointments'
import { Appointment, AppointmentStatus } from '../../../types/entities'
import { LogIn, LogOut, X, Edit, Eye, Clock, User, MapPin } from 'lucide-react'

interface QuickActionsProps {
 appointment: Appointment
 onEdit?: (appointment: Appointment) => void
 onDetails?: (appointment: Appointment) => void
 compact?: boolean
}

const STATUS_COLORS = {
 SCHEDULED: 'bg-blue-100 text-primary border-blue-200',
 CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
 IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
 COMPLETED: 'bg-card text-muted-foreground border-border',
 CANCELLED: 'bg-red-100 text-red-800 border-red-200',
 NO_SHOW: 'bg-orange-100 text-orange-800 border-orange-200',
}

const STATUS_LABELS = {
 SCHEDULED: 'Agendado',
 CONFIRMED: 'Confirmado',
 IN_PROGRESS: 'Em andamento',
 COMPLETED: 'Concluído',
 CANCELLED: 'Cancelado',
 NO_SHOW: 'Não compareceu',
}

export function QuickActions({ 
 appointment, 
 onEdit, 
 onDetails, 
 compact = false 
}: QuickActionsProps) {
 const checkInAppointment = useCheckInAppointment()
 const checkOutAppointment = useCheckOutAppointment()
 const cancelAppointment = useCancelAppointment()

 const handleCheckIn = async (e: React.MouseEvent) => {
  e.stopPropagation()
  try {
   await checkInAppointment.mutateAsync(appointment.id)
  } catch (error) {
   console.error('Erro no check-in:', error)
  }
 }

 const handleCheckOut = async (e: React.MouseEvent) => {
  e.stopPropagation()
  try {
   await checkOutAppointment.mutateAsync(appointment.id)
  } catch (error) {
   console.error('Erro no check-out:', error)
  }
 }

 const handleQuickCancel = async (e: React.MouseEvent) => {
  e.stopPropagation()
  const reason = prompt('Motivo do cancelamento:')
  if (reason) {
   try {
    await cancelAppointment.mutateAsync({
     id: appointment.id,
     reason
    })
   } catch (error) {
    console.error('Erro ao cancelar:', error)
   }
  }
 }

 const handleEdit = (e: React.MouseEvent) => {
  e.stopPropagation()
  onEdit?.(appointment)
 }

 const handleDetails = (e: React.MouseEvent) => {
  e.stopPropagation()
  onDetails?.(appointment)
 }

 const canCheckIn = appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED'
 const canCheckOut = appointment.status === 'IN_PROGRESS'
 const canCancel = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status)
 const canEdit = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status)

 if (compact) {
  return (
   <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
    {canCheckIn && (
     <Button
      variant="outline"
      size="sm"
      onClick={handleCheckIn}
      disabled={checkInAppointment.isPending}
      className="h-7 px-2 text-green-600 border-green-200 hover:"
      title="Check-in"
     >
      <LogIn className="w-3 h-3" />
     </Button>
    )}
    
    {canCheckOut && (
     <Button
      variant="outline"
      size="sm"
      onClick={handleCheckOut}
      disabled={checkOutAppointment.isPending}
      className="h-7 px-2 text-primary border-blue-200 hover:"
      title="Check-out"
     >
      <LogOut className="w-3 h-3" />
     </Button>
    )}

    {onDetails && (
     <Button
      variant="outline"
      size="sm"
      onClick={handleDetails}
      className="h-7 px-2"
      title="Ver detalhes"
     >
      <Eye className="w-3 h-3" />
     </Button>
    )}

    {canEdit && onEdit && (
     <Button
      variant="outline"
      size="sm"
      onClick={handleEdit}
      className="h-7 px-2"
      title="Editar"
     >
      <Edit className="w-3 h-3" />
     </Button>
    )}

    {canCancel && (
     <Button
      variant="outline"
      size="sm"
      onClick={handleQuickCancel}
      disabled={cancelAppointment.isPending}
      className="h-7 px-2 text-red-600 border-red-200 hover:"
      title="Cancelar"
     >
      <X className="w-3 h-3" />
     </Button>
    )}
   </div>
  )
 }

 return (
  <Card className="w-full">
   <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
     <CardTitle className="text-sm">
      {appointment.patient?.fullName}
     </CardTitle>
     <Badge className={`${STATUS_COLORS[appointment.status]} border text-xs`}>
      {STATUS_LABELS[appointment.status]}
     </Badge>
    </div>
   </CardHeader>
   
   <CardContent className="space-y-3">
    {/* Informações principais */}
    <div className="space-y-1 text-xs text-muted-foreground">
     <div className="flex items-center gap-1">
      <Clock className="w-3 h-3" />
      <span>{appointment.startTime} - {appointment.endTime}</span>
     </div>
     <div className="flex items-center gap-1">
      <User className="w-3 h-3" />
      <span>{appointment.partner?.fullName}</span>
     </div>
     <div className="flex items-center gap-1">
      <MapPin className="w-3 h-3" />
      <span>{appointment.room?.name}</span>
     </div>
    </div>

    {/* Ações */}
    <div className="flex flex-wrap gap-1">
     {canCheckIn && (
      <Button
       variant="outline"
       size="sm"
       onClick={handleCheckIn}
       disabled={checkInAppointment.isPending}
       className="h-7 px-2 text-xs text-green-600 border-green-200 hover:"
      >
       <LogIn className="w-3 h-3 mr-1" />
       {checkInAppointment.isPending ? 'Fazendo...' : 'Check-in'}
      </Button>
     )}
     
     {canCheckOut && (
      <Button
       variant="outline"
       size="sm"
       onClick={handleCheckOut}
       disabled={checkOutAppointment.isPending}
       className="h-7 px-2 text-xs text-primary border-blue-200 hover:"
      >
       <LogOut className="w-3 h-3 mr-1" />
       {checkOutAppointment.isPending ? 'Fazendo...' : 'Check-out'}
      </Button>
     )}

     {onDetails && (
      <Button
       variant="outline"
       size="sm"
       onClick={handleDetails}
       className="h-7 px-2 text-xs"
      >
       <Eye className="w-3 h-3 mr-1" />
       Detalhes
      </Button>
     )}

     {canEdit && onEdit && (
      <Button
       variant="outline"
       size="sm"
       onClick={handleEdit}
       className="h-7 px-2 text-xs"
      >
       <Edit className="w-3 h-3 mr-1" />
       Editar
      </Button>
     )}

     {canCancel && (
      <Button
       variant="outline"
       size="sm"
       onClick={handleQuickCancel}
       disabled={cancelAppointment.isPending}
       className="h-7 px-2 text-xs text-red-600 border-red-200 hover:"
      >
       <X className="w-3 h-3 mr-1" />
       {cancelAppointment.isPending ? 'Cancelando...' : 'Cancelar'}
      </Button>
     )}
    </div>
   </CardContent>
  </Card>
 )
}
