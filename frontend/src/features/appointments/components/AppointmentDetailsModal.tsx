import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { AppointmentForm } from './AppointmentForm'
import { useAppointment, useCancelAppointment, useCheckInAppointment, useCheckOutAppointment, useCheckOutAppointmentWithPayment, useUpdateAppointment, useUndoCheckInAppointment, useUndoCheckOutAppointment, useCancelCheckout } from '../../../hooks/useAppointments'
import { useToast } from '../../../hooks/useToast'
import { Appointment, AppointmentStatus } from '../../../types/entities'
import { 
 Calendar, 
 Clock, 
 User, 
 MapPin, 
 Briefcase, 
 Phone, 
 Mail, 
 Edit, 
 X, 
 CheckCircle2, 
 LogIn, 
 LogOut,
 FileText,
 AlertCircle,
 DollarSign,
 Undo2,
 CreditCard
} from 'lucide-react'
import { CheckoutPaymentModal } from './CheckoutPaymentModal'

interface AppointmentDetailsModalProps {
 appointmentId?: string
 appointment?: Appointment
 open: boolean
 onOpenChange: (open: boolean) => void
}

const STATUS_CONFIG = {
 SCHEDULED: { label: 'Agendado', color: 'bg-blue-100 text-primary border-blue-200', icon: Calendar },
 CONFIRMED: { label: 'Confirmado', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
 IN_PROGRESS: { label: 'Em andamento', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
 COMPLETED: { label: 'Concluído', color: 'bg-card text-muted-foreground border-border', icon: CheckCircle2 },
 CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200', icon: X },
 NO_SHOW: { label: 'Não compareceu', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle },
}

const TYPE_LABELS = {
 CONSULTATION: 'Consulta',
 EXAM: 'Exame',
 PROCEDURE: 'Procedimento',
 RETURN: 'Retorno',
}

export function AppointmentDetailsModal({
 appointmentId,
 appointment: propAppointment,
 open,
 onOpenChange
}: AppointmentDetailsModalProps) {
 const [showEditForm, setShowEditForm] = useState(false)
 const [showCancelForm, setShowCancelForm] = useState(false)
 const [cancellationReason, setCancellationReason] = useState('')
 const [observationsEdit, setObservationsEdit] = useState('')
 const [isEditingObservations, setIsEditingObservations] = useState(false)
 const [showCheckInConfirmation, setShowCheckInConfirmation] = useState(false)
 const [showCheckOutConfirmation, setShowCheckOutConfirmation] = useState(false)
 const [showCheckOutPayment, setShowCheckOutPayment] = useState(false)
 const [showUndoCheckInConfirmation, setShowUndoCheckInConfirmation] = useState(false)
 const [showUndoCheckOutConfirmation, setShowUndoCheckOutConfirmation] = useState(false)
 const [showCancelCheckout, setShowCancelCheckout] = useState(false)
 const [cancelCheckoutReason, setCancelCheckoutReason] = useState('')

 // Sempre buscar dados atualizados se tivermos um ID
 const effectiveAppointmentId = appointmentId || propAppointment?.id
 const { data: fetchedAppointment, isLoading } = useAppointment(
  effectiveAppointmentId || '', 
  { enabled: Boolean(effectiveAppointmentId) }
 )

 // Sempre usar dados mais atualizados (fetchedAppointment tem prioridade)
 const appointment = fetchedAppointment || propAppointment

 const { toast } = useToast()
 const cancelAppointment = useCancelAppointment()
 const checkInAppointment = useCheckInAppointment()
 const checkOutAppointment = useCheckOutAppointment()
 const checkOutAppointmentWithPayment = useCheckOutAppointmentWithPayment()
 const undoCheckInAppointment = useUndoCheckInAppointment()
 const undoCheckOutAppointment = useUndoCheckOutAppointment()
 const updateAppointment = useUpdateAppointment()
 const cancelCheckout = useCancelCheckout()

 if (!appointment && isLoading) {
  return (
   <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
     <div className="flex items-center justify-center h-32">
      <div className="animate-spin w-6 h-6 border-2  border-t-transparent rounded-full" />
     </div>
    </DialogContent>
   </Dialog>
  )
 }

 if (!appointment) {
  return (
   <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
     <div className="text-center py-8">
      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">Agendamento não encontrado</p>
     </div>
    </DialogContent>
   </Dialog>
  )
 }

 const statusConfig = STATUS_CONFIG[appointment.status]
 const StatusIcon = statusConfig.icon

 const handleCancel = async () => {
  if (!cancellationReason.trim()) return
  
  try {
   await cancelAppointment.mutateAsync({
    id: appointment.id,
    reason: cancellationReason
   })
   setShowCancelForm(false)
   setCancellationReason('')
   toast({
    title: "Agendamento cancelado",
    description: "O agendamento foi cancelado com sucesso. Lançamentos financeiros relacionados foram automaticamente cancelados.",
    variant: "default",
   })
  } catch (error: any) {
   console.error('Erro ao cancelar agendamento:', error)
   toast({
    title: "Erro ao cancelar agendamento",
    description: error?.message || 'Ocorreu um erro inesperado. Tente novamente.',
    variant: "destructive",
   })
  }
 }

 const handleCheckInClick = () => {
  setShowCheckInConfirmation(true)
 }

 const handleCheckOutClick = () => {
  setShowCheckOutConfirmation(true)
 }

 const confirmCheckIn = async () => {
  try {
   await checkInAppointment.mutateAsync(appointment.id)
   setShowCheckInConfirmation(false)
   setTimeout(() => {
    onOpenChange(false)
   }, 1500) // Fechar modal após 1.5s para permitir ver o toast
  } catch (error: any) {
   console.error('Erro no check-in:', error)
   setShowCheckInConfirmation(false)
  }
 }

 const confirmCheckOut = async () => {
  try {
   await checkOutAppointment.mutateAsync(appointment.id)
   setShowCheckOutConfirmation(false)
   setTimeout(() => {
    onOpenChange(false)
   }, 1500) // Fechar modal após 1.5s para permitir ver o toast
  } catch (error: any) {
   console.error('Erro no check-out:', error)
   setShowCheckOutConfirmation(false)
  }
 }

 const handleCheckOutWithPayment = async (paymentData: any) => {
  try {
   await checkOutAppointmentWithPayment.mutateAsync({
    id: appointment.id,
    paymentData
   })
   setShowCheckOutPayment(false)
   setTimeout(() => {
    onOpenChange(false)
   }, 1500) // Fechar modal após 1.5s para permitir ver o toast
  } catch (error: any) {
   console.error('Erro no checkout financeiro:', error)
   throw error // Re-throw para que o modal possa tratar o erro
  }
 }

 const handleUpdateObservations = async () => {
  try {
   await updateAppointment.mutateAsync({
    id: appointment.id,
    data: { observations: observationsEdit }
   })
   setIsEditingObservations(false)
   toast({
    title: "Observações atualizadas",
    description: "As observações foram atualizadas com sucesso.",
    variant: "default",
   })
  } catch (error: any) {
   console.error('Erro ao atualizar observações:', error)
   toast({
    title: "Erro ao atualizar observações",
    description: error?.message || 'Ocorreu um erro inesperado. Tente novamente.',
    variant: "destructive",
   })
  }
 }

 const handleUndoCheckInClick = () => {
  setShowUndoCheckInConfirmation(true)
 }

 const handleUndoCheckOutClick = () => {
  setShowUndoCheckOutConfirmation(true)
 }

 const confirmUndoCheckIn = async () => {
  try {
   await undoCheckInAppointment.mutateAsync(appointment.id)
   setShowUndoCheckInConfirmation(false)
   setTimeout(() => {
    onOpenChange(false)
   }, 1500) // Fechar modal após 1.5s para permitir ver o toast
  } catch (error: any) {
   console.error('Erro ao desfazer check-in:', error)
   setShowUndoCheckInConfirmation(false)
  }
 }

 const confirmUndoCheckOut = async () => {
  try {
   await undoCheckOutAppointment.mutateAsync(appointment.id)
   setShowUndoCheckOutConfirmation(false)
   setTimeout(() => {
    onOpenChange(false)
   }, 1500) // Fechar modal após 1.5s para permitir ver o toast
  } catch (error: any) {
   console.error('Erro ao desfazer check-out:', error)
   setShowUndoCheckOutConfirmation(false)
  }
 }

 const handleCancelCheckout = async () => {
  if (!cancelCheckoutReason.trim()) return
  
  try {
   await cancelCheckout.mutateAsync({
    id: appointment.id,
    reason: cancelCheckoutReason
   })
   setShowCancelCheckout(false)
   setCancelCheckoutReason('')
  } catch (error: any) {
   console.error('Erro ao cancelar checkout:', error)
  }
 }

 const canCheckIn = appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED'
 const canCheckOut = appointment.status === 'IN_PROGRESS'
 const canUndoCheckIn = appointment.status === 'IN_PROGRESS' && appointment.checkIn
 const canUndoCheckOut = appointment.status === 'COMPLETED' && appointment.checkOut
 const canCancelCheckout = appointment.status === 'COMPLETED' && appointment.checkOut // Pode cancelar checkout se foi finalizado
 const canCancel = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status)
 const canEdit = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status)

 return (
  <>
   <Dialog open={open && !showEditForm} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
     <DialogHeader>
      <DialogTitle className="flex items-center justify-between">
       <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Detalhes do Agendamento
       </div>
       <Badge className={`${statusConfig.color} border`}>
        <StatusIcon className="w-4 h-4 mr-1" />
        {statusConfig.label}
       </Badge>
      </DialogTitle>
     </DialogHeader>

     <div className="space-y-6">
      {/* Informações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {/* Paciente */}
       <Card>
        <CardHeader className="pb-3">
         <CardTitle className="text-sm flex items-center gap-2">
          <User className="w-4 h-4" />
          Paciente
         </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
         <div className="font-medium">{appointment.patient?.fullName}</div>
         <div className="text-sm text-muted-foreground">CPF: {appointment.patient?.cpf}</div>
         {appointment.patient?.phone && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
           <Phone className="w-3 h-3" />
           {appointment.patient.phone}
          </div>
         )}
         {appointment.patient?.email && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
           <Mail className="w-3 h-3" />
           {appointment.patient.email}
          </div>
         )}
        </CardContent>
       </Card>

       {/* Profissional */}
       <Card>
        <CardHeader className="pb-3">
         <CardTitle className="text-sm flex items-center gap-2">
          <User className="w-4 h-4" />
          Profissional
         </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
         <div className="font-medium">{appointment.partner?.fullName || 'Profissional não informado'}</div>
         {appointment.partner?.partnershipType && (
          <div className="text-sm text-muted-foreground">
           Tipo: {appointment.partner.partnershipType === 'SUBLEASE' ? 'Sublocação' : 
               appointment.partner.partnershipType === 'PERCENTAGE' ? 'Porcentagem' : 
               'Porcentagem + Produtos'}
          </div>
         )}
         {appointment.partner?.phone && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
           <Phone className="w-3 h-3" />
           {appointment.partner.phone}
          </div>
         )}
         {appointment.partner?.email && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
           <Mail className="w-3 h-3" />
           {appointment.partner.email}
          </div>
         )}
         {appointment.partner?.document && (
          <div className="text-sm text-muted-foreground">
           Doc: {appointment.partner.document}
          </div>
         )}
        </CardContent>
       </Card>

       {/* Serviço */}
       <Card>
        <CardHeader className="pb-3">
         <CardTitle className="text-sm flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Serviço
         </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
         <div className="font-medium">{appointment.productService?.name}</div>
         <div className="text-sm text-muted-foreground">
          {TYPE_LABELS[appointment.type]}
         </div>
         <div className="flex items-center gap-2">
          <Badge variant="outline">
           {appointment.productService?.durationMinutes} min
          </Badge>
          {appointment.productService?.salePrice && (
           <Badge variant="outline">
            R$ {typeof appointment.productService.salePrice === 'number' 
             ? appointment.productService.salePrice.toFixed(2) 
             : appointment.productService.salePrice}
           </Badge>
          )}
         </div>
        </CardContent>
       </Card>

       {/* Local e Horário */}
       <Card>
        <CardHeader className="pb-3">
         <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Local e Horário
         </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
         <div className="font-medium">{appointment.room?.name}</div>
         {appointment.room?.description && (
          <div className="text-sm text-muted-foreground">{appointment.room.description}</div>
         )}
         <div className="flex items-center gap-1 text-sm">
          <Calendar className="w-3 h-3" />
          {format(new Date(appointment.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
         </div>
         <div className="flex items-center gap-1 text-sm">
          <Clock className="w-3 h-3" />
          {appointment.startTime} - {appointment.endTime}
         </div>
        </CardContent>
       </Card>
      </div>

      {/* Timestamps de Check-in/Check-out */}
      {(appointment.checkIn || appointment.checkOut) && (
       <Card>
        <CardHeader>
         <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Controle de Presença
         </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
         {appointment.checkIn && (
          <div className="flex items-center gap-2 text-sm">
           <LogIn className="w-4 h-4 " />
           <span className="font-medium">Check-in:</span>
           <span>{format(new Date(appointment.checkIn), "d/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
          </div>
         )}
         {appointment.checkOut && (
          <div className="flex items-center gap-2 text-sm">
           <LogOut className="w-4 h-4 text-primary" />
           <span className="font-medium">Check-out:</span>
           <span>{format(new Date(appointment.checkOut), "d/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
          </div>
         )}
        </CardContent>
       </Card>
      )}

      {/* Observações */}
      <Card>
       <CardHeader>
        <div className="flex items-center justify-between">
         <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Observações do Atendimento
         </CardTitle>
         {!isEditingObservations && canEdit && (
          <Button
           variant="outline"
           size="sm"
           onClick={() => {
            setObservationsEdit(appointment.observations || '')
            setIsEditingObservations(true)
           }}
          >
           <Edit className="w-3 h-3 mr-1" />
           Editar
          </Button>
         )}
        </div>
       </CardHeader>
       <CardContent>
        {isEditingObservations ? (
         <div className="space-y-3">
          <Textarea
           value={observationsEdit}
           onChange={(e) => setObservationsEdit(e.target.value)}
           placeholder="Adicione observações sobre o atendimento..."
           rows={4}
          />
          <div className="flex items-center gap-2">
           <Button
            size="sm"
            onClick={handleUpdateObservations}
            disabled={updateAppointment.isPending}
           >
            {updateAppointment.isPending ? 'Salvando...' : 'Salvar'}
           </Button>
           <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingObservations(false)}
           >
            Cancelar
           </Button>
          </div>
         </div>
        ) : (
         <div className="text-sm text-muted-foreground">
          {appointment.observations || 'Nenhuma observação registrada.'}
         </div>
        )}
       </CardContent>
      </Card>

      {/* Motivo do Cancelamento */}
      {appointment.status === 'CANCELLED' && appointment.cancellationReason && (
       <Card>
        <CardHeader>
         <CardTitle className="text-sm flex items-center gap-2">
          <X className="w-4 h-4 " />
          Motivo do Cancelamento
         </CardTitle>
        </CardHeader>
        <CardContent>
         <div className="text-sm text-muted-foreground">
          {appointment.cancellationReason}
         </div>
        </CardContent>
       </Card>
      )}

      {/* Formulário de Cancelamento */}
      {showCancelForm && (
       <Card>
        <CardHeader>
         <CardTitle className="text-sm flex items-center gap-2">
          <X className="w-4 h-4 " />
          Cancelar Agendamento
         </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
         <div>
          <Label htmlFor="cancellation-reason">Motivo do cancelamento *</Label>
          <Textarea
           id="cancellation-reason"
           value={cancellationReason}
           onChange={(e) => setCancellationReason(e.target.value)}
           placeholder="Informe o motivo do cancelamento..."
           rows={3}
          />
         </div>
         <div className="flex items-center gap-2">
          <Button
           variant="destructive"
           size="sm"
           onClick={handleCancel}
           disabled={!cancellationReason.trim() || cancelAppointment.isPending}
          >
           {cancelAppointment.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </Button>
          <Button
           variant="outline"
           size="sm"
           onClick={() => {
            setShowCancelForm(false)
            setCancellationReason('')
           }}
          >
           Voltar
          </Button>
         </div>
        </CardContent>
       </Card>
      )}

      {/* Ações */}
      <div className="flex items-center justify-between border-t pt-4">
       <div className="flex items-center gap-2">
        {canCheckIn && (
         <Button
          variant="outline"
          size="sm"
          onClick={handleCheckInClick}
          disabled={checkInAppointment.isPending}
         >
          <LogIn className="w-4 h-4 mr-1" />
          {checkInAppointment.isPending ? 'Fazendo Check-in...' : 'Check-in'}
         </Button>
        )}
        
        {canCheckOut && (
         <>
          <Button
           variant="outline"
           size="sm"
           onClick={handleCheckOutClick}
           disabled={checkOutAppointment.isPending}
           className="text-primary bg-blue-50 border-blue-300 hover:bg-blue-100 dark:text-primary dark:bg-blue-900/30 dark:border-blue-600 dark:hover:/50 font-semibold"
          >
           <LogOut className="w-4 h-4 mr-1" />
           {checkOutAppointment.isPending ? 'Fazendo Check-out...' : 'Check-out'}
          </Button>
          
          <Button
           variant="default"
           size="sm"
           onClick={() => setShowCheckOutPayment(true)}
           disabled={checkOutAppointmentWithPayment.isPending}
           className="bg-green-600 hover: text-primary-foreground"
          >
           <CreditCard className="w-4 h-4 mr-1" />
           {checkOutAppointmentWithPayment.isPending ? 'Processando...' : 'Check-out + Financeiro'}
          </Button>
         </>
        )}

        {canUndoCheckIn && (
         <Button
          variant="outline"
          size="sm"
          onClick={handleUndoCheckInClick}
          disabled={undoCheckInAppointment.isPending}
          className="text-orange-700 bg-orange-50 border-orange-300 hover:bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-600 dark:hover:/50 font-semibold"
         >
          <Undo2 className="w-4 h-4 mr-1" />
          {undoCheckInAppointment.isPending ? 'Desfazendo...' : 'Desfazer Check-in'}
         </Button>
        )}

        {canUndoCheckOut && (
         <Button
          variant="outline"
          size="sm"
          onClick={handleUndoCheckOutClick}
          disabled={undoCheckOutAppointment.isPending}
          className="text-purple-700 bg-purple-50 border-purple-300 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-600 dark:hover:/50 font-semibold"
         >
          <Undo2 className="w-4 h-4 mr-1" />
          {undoCheckOutAppointment.isPending ? 'Desfazendo...' : 'Desfazer Check-out'}
         </Button>
        )}

        {canCancelCheckout && (
         <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCancelCheckout(true)}
          className="text-orange-700 bg-orange-50 border-orange-300 hover:bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-600 dark:hover:/50 font-semibold"
         >
          <DollarSign className="w-4 h-4 mr-1" />
          Cancelar Pagamento
         </Button>
        )}
       </div>

       <div className="flex items-center gap-2">
        {canCancel && !showCancelForm && (
         <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCancelForm(true)}
         >
          <X className="w-4 h-4 mr-1" />
          Cancelar
         </Button>
        )}
        
        {canEdit && (
         <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEditForm(true)}
         >
          <Edit className="w-4 h-4 mr-1" />
          Editar
         </Button>
        )}
        
        <Button
         variant="outline"
         onClick={() => onOpenChange(false)}
        >
         Fechar
        </Button>
       </div>
      </div>
     </div>
    </DialogContent>
   </Dialog>

   {/* Modal de Edição */}
   {showEditForm && (
    <AppointmentForm
     appointment={appointment}
     open={showEditForm}
     onOpenChange={setShowEditForm}
     onSuccess={() => {
      setShowEditForm(false)
     }}
    />
   )}

   {/* Modal de Confirmação Check-in */}
   <Dialog open={showCheckInConfirmation} onOpenChange={setShowCheckInConfirmation}>
    <DialogContent className="sm:max-w-md">
     <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
       <LogIn className="w-5 h-5 " />
       Confirmar Check-in
      </DialogTitle>
     </DialogHeader>
     <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
       Confirma o check-in do paciente <strong>{appointment?.patient?.fullName}</strong> para o horário de <strong>{appointment?.startTime}</strong>?
      </p>
      <p className="text-xs text-muted-foreground">
       O status do agendamento será alterado para "Em andamento" e a janela será fechada automaticamente.
      </p>
      <div className="flex justify-end gap-2">
       <Button
        variant="outline"
        onClick={() => setShowCheckInConfirmation(false)}
        disabled={checkInAppointment.isPending}
        className="text-muted-foreground bg-card border-border hover:bg-card dark:text-muted-foreground   dark:hover:bg-card font-semibold"
       >
        Cancelar
       </Button>
       <Button
        onClick={confirmCheckIn}
        disabled={checkInAppointment.isPending}
        className="bg-green-600 hover:"
       >
        {checkInAppointment.isPending ? 'Fazendo Check-in...' : 'Confirmar Check-in'}
       </Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>

   {/* Modal de Confirmação Check-out */}
   <Dialog open={showCheckOutConfirmation} onOpenChange={setShowCheckOutConfirmation}>
    <DialogContent className="sm:max-w-md">
     <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
       <LogOut className="w-5 h-5 text-primary" />
       Confirmar Check-out
      </DialogTitle>
     </DialogHeader>
     <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
       Confirma o check-out do paciente <strong>{appointment?.patient?.fullName}</strong>?
      </p>
      <p className="text-xs text-muted-foreground">
       O status do agendamento será alterado para "Concluído" e a janela será fechada automaticamente.
      </p>
      <div className="flex justify-end gap-2">
       <Button
        variant="outline"
        onClick={() => setShowCheckOutConfirmation(false)}
        disabled={checkOutAppointment.isPending}
        className="text-muted-foreground bg-card border-border hover:bg-card dark:text-muted-foreground   dark:hover:bg-card font-semibold"
       >
        Cancelar
       </Button>
       <Button
        onClick={confirmCheckOut}
        disabled={checkOutAppointment.isPending}
        className="bg-blue-600 hover:"
       >
        {checkOutAppointment.isPending ? 'Fazendo Check-out...' : 'Confirmar Check-out'}
       </Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>

   {/* Modal de Confirmação Desfazer Check-in */}
   <Dialog open={showUndoCheckInConfirmation} onOpenChange={setShowUndoCheckInConfirmation}>
    <DialogContent className="sm:max-w-md">
     <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
       <Undo2 className="w-5 h-5 " />
       Desfazer Check-in
      </DialogTitle>
     </DialogHeader>
     <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
       Confirma que deseja desfazer o check-in do paciente <strong>{appointment?.patient?.fullName}</strong>?
      </p>
      <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border ">
       ⚠️ <strong>Atenção:</strong> O status do agendamento voltará para "Agendado" e o horário de check-in será removido.
      </p>
      <p className="text-xs text-muted-foreground">
       A janela será fechada automaticamente após a confirmação.
      </p>
      <div className="flex justify-end gap-2">
       <Button
        variant="outline"
        onClick={() => setShowUndoCheckInConfirmation(false)}
        disabled={undoCheckInAppointment.isPending}
       >
        Cancelar
       </Button>
       <Button
        onClick={confirmUndoCheckIn}
        disabled={undoCheckInAppointment.isPending}
        className="bg-orange-600 hover:"
       >
        {undoCheckInAppointment.isPending ? 'Desfazendo...' : 'Confirmar Desfazer'}
       </Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>

   {/* Modal de Confirmação Desfazer Check-out */}
   <Dialog open={showUndoCheckOutConfirmation} onOpenChange={setShowUndoCheckOutConfirmation}>
    <DialogContent className="sm:max-w-md">
     <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
       <Undo2 className="w-5 h-5 " />
       Desfazer Check-out
      </DialogTitle>
     </DialogHeader>
     <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
       Confirma que deseja desfazer o check-out do paciente <strong>{appointment?.patient?.fullName}</strong>?
      </p>
      <div className="text-xs text-purple-600 bg-purple-50 p-3 rounded-lg border ">
       <p className="font-semibold mb-1">⚠️ Atenção:</p>
       <ul className="list-disc list-inside space-y-1">
        <li>O status do agendamento voltará para "Em andamento"</li>
        <li>O horário de check-out será removido</li>
       </ul>
      </div>
      <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border ">
       <p className="font-semibold mb-1">💰 Importante sobre lançamentos financeiros:</p>
       <ul className="list-disc list-inside space-y-1">
        <li><strong>Os lançamentos financeiros NÃO serão cancelados</strong></li>
        <li>Se precisar cancelar pagamentos, use "Cancelar Pagamento" em vez disso</li>
        <li>Esta ação apenas desfaz o status do agendamento</li>
       </ul>
      </div>
      <p className="text-xs text-muted-foreground">
       A janela será fechada automaticamente após a confirmação.
      </p>
      <div className="flex justify-end gap-2">
       <Button
        variant="outline"
        onClick={() => setShowUndoCheckOutConfirmation(false)}
        disabled={undoCheckOutAppointment.isPending}
       >
        Cancelar
       </Button>
       <Button
        onClick={confirmUndoCheckOut}
        disabled={undoCheckOutAppointment.isPending}
        className="bg-purple-600 hover:"
       >
        {undoCheckOutAppointment.isPending ? 'Desfazendo...' : 'Confirmar Desfazer'}
       </Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>

   {/* Modal de Checkout com Pagamento */}
   {/* Modal de Cancelar Checkout */}
   <Dialog open={showCancelCheckout} onOpenChange={setShowCancelCheckout}>
    <DialogContent className="sm:max-w-md">
     <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
       <DollarSign className="w-5 h-5 " />
       Cancelar Pagamento
      </DialogTitle>
     </DialogHeader>
     <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
       Confirma que deseja cancelar o pagamento financeiro do agendamento de <strong>{appointment?.patient?.fullName}</strong>?
      </p>
      <div className="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg border ">
       <p className="font-semibold mb-1">⚠️ Atenção:</p>
       <ul className="list-disc list-inside space-y-1">
        <li>Todos os lançamentos financeiros relacionados serão cancelados</li>
        <li>Os saldos das contas bancárias serão ajustados automaticamente</li>
        <li>O agendamento voltará para o status "Em andamento"</li>
        <li>Esta ação permite refazer o checkout corretamente</li>
       </ul>
      </div>
      <div className="space-y-2">
       <Label htmlFor="cancel-checkout-reason">Motivo do cancelamento*</Label>
       <Textarea
        id="cancel-checkout-reason"
        placeholder="Ex: Erro no valor, forma de pagamento incorreta, etc."
        value={cancelCheckoutReason}
        onChange={(e) => setCancelCheckoutReason(e.target.value)}
        rows={3}
       />
      </div>
      <div className="flex justify-end gap-2 pt-4">
       <Button
        variant="outline"
        onClick={() => {
         setShowCancelCheckout(false)
         setCancelCheckoutReason('')
        }}
       >
        Cancelar
       </Button>
       <Button
        onClick={handleCancelCheckout}
        disabled={!cancelCheckoutReason.trim() || cancelCheckout.isPending}
        className="bg-orange-600 hover:"
       >
        {cancelCheckout.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
       </Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>

   <CheckoutPaymentModal
    appointment={appointment}
    isOpen={showCheckOutPayment}
    onClose={() => setShowCheckOutPayment(false)}
    onSubmit={handleCheckOutWithPayment}
    isLoading={checkOutAppointmentWithPayment.isPending}
   />
  </>
 )
}

