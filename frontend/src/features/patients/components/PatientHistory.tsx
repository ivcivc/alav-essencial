import React from 'react'
import { Calendar, Clock, User, MapPin, FileText, Phone, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePatient } from '@/hooks/usePatients'
import { PatientWithAppointments } from '@/types/entities'

interface PatientHistoryProps {
 patientId: string
}

export const PatientHistory: React.FC<PatientHistoryProps> = ({ patientId }) => {
 const { data: patient, isLoading, error } = usePatient(patientId)

 const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR')
 }

 const formatDateTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('pt-BR')
 }

 const formatCPF = (cpf: string) => {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
 }

 const formatPhone = (phone: string) => {
  if (phone.length === 11) {
   return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (phone.length === 10) {
   return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
 }

 const getStatusVariant = (status: string) => {
  switch (status) {
   case 'SCHEDULED':
    return 'info'
   case 'CONFIRMED':
    return 'success'
   case 'IN_PROGRESS':
    return 'warning'
   case 'COMPLETED':
    return 'success'
   case 'CANCELLED':
    return 'destructive'
   default:
    return 'secondary'
  }
 }

 const getStatusClass = (status: string) => {
  switch (status) {
   case 'SCHEDULED':
    return 'badge-available'
   case 'CONFIRMED':
    return 'badge-active'
   case 'IN_PROGRESS':
    return 'badge-unavailable'
   case 'COMPLETED':
    return 'badge-active'
   case 'CANCELLED':
    return 'badge-stock-out'
   default:
    return 'badge-inactive'
  }
 }

 const getStatusText = (status: string) => {
  switch (status) {
   case 'SCHEDULED':
    return 'Agendado'
   case 'CONFIRMED':
    return 'Confirmado'
   case 'IN_PROGRESS':
    return 'Em Andamento'
   case 'COMPLETED':
    return 'Concluído'
   case 'CANCELLED':
    return 'Cancelado'
   default:
    return status
  }
 }

 if (isLoading) {
  return (
   <div className="space-y-6">
    <div className="animate-pulse">
     <div className="h-8 bg-card rounded w-1/4 mb-4"></div>
     <div className="space-y-4">
      <div className="h-32 bg-card rounded"></div>
      <div className="h-32 bg-card rounded"></div>
     </div>
    </div>
   </div>
  )
 }

 if (error || !patient) {
  return (
   <Card>
    <CardContent className="p-6">
     <div className="text-center ">
      Erro ao carregar informações do paciente.
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <div className="space-y-6">
   <div>
    <h2 className="text-2xl font-bold">{patient.fullName}</h2>
    <p className="text-muted-foreground">Histórico completo do paciente</p>
   </div>

   {/* Patient Information */}
   <Card>
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <User className="h-5 w-5" />
      Informações Pessoais
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
       <p className="text-sm font-medium text-muted-foreground">CPF</p>
       <p className="text-sm">{formatCPF(patient.cpf)}</p>
      </div>
      <div>
       <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
       <p className="text-sm">{formatDate(patient.birthDate)}</p>
      </div>
      <div>
       <p className="text-sm font-medium text-muted-foreground">Status</p>
       <Badge 
        variant={patient.active ? "success" : "secondary"}
        className={patient.active ? 'badge-active' : 'badge-inactive'}
       >
        {patient.active ? 'Ativo' : 'Inativo'}
       </Badge>
      </div>
     </div>
    </CardContent>
   </Card>

   {/* Contact Information */}
   <Card>
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <Phone className="h-5 w-5" />
      Contato
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patient.whatsapp && (
       <div>
        <p className="text-sm font-medium text-muted-foreground">WhatsApp</p>
        <p className="text-sm">{formatPhone(patient.whatsapp)}</p>
       </div>
      )}
      {patient.phone && (
       <div>
        <p className="text-sm font-medium text-muted-foreground">Telefone</p>
        <p className="text-sm">{formatPhone(patient.phone)}</p>
       </div>
      )}
      {patient.email && (
       <div>
        <p className="text-sm font-medium text-muted-foreground">Email</p>
        <p className="text-sm">{patient.email}</p>
       </div>
      )}
     </div>
    </CardContent>
   </Card>

   {/* Address Information */}
   {(patient.street || patient.city || patient.state) && (
    <Card>
     <CardHeader>
      <CardTitle className="flex items-center gap-2">
       <MapPin className="h-5 w-5" />
       Endereço
      </CardTitle>
     </CardHeader>
     <CardContent>
      <div className="text-sm">
       {patient.street && (
        <p>
         {patient.street}
         {patient.number && `, ${patient.number}`}
         {patient.complement && `, ${patient.complement}`}
        </p>
       )}
       {patient.neighborhood && <p>{patient.neighborhood}</p>}
       {(patient.city || patient.state) && (
        <p>
         {patient.city}
         {patient.state && `, ${patient.state}`}
         {patient.zipCode && ` - ${patient.zipCode}`}
        </p>
       )}
      </div>
     </CardContent>
    </Card>
   )}

   {/* Observations */}
   {patient.observations && (
    <Card>
     <CardHeader>
      <CardTitle className="flex items-center gap-2">
       <FileText className="h-5 w-5" />
       Observações
      </CardTitle>
     </CardHeader>
     <CardContent>
      <p className="text-sm whitespace-pre-wrap">{patient.observations}</p>
     </CardContent>
    </Card>
   )}

   {/* Appointment History */}
   <Card>
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <Calendar className="h-5 w-5" />
      Histórico de Agendamentos
      {patient.appointments && (
       <span className="text-sm font-normal text-muted-foreground ml-2">
        ({patient.appointments.length} {patient.appointments.length === 1 ? 'agendamento' : 'agendamentos'})
       </span>
      )}
     </CardTitle>
    </CardHeader>
    <CardContent>
     {!patient.appointments || patient.appointments.length === 0 ? (
      <div className="text-center py-8 text-muted-foreground">
       <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
       <p>Nenhum agendamento encontrado.</p>
       <p className="text-sm">Este paciente ainda não possui histórico de consultas.</p>
      </div>
     ) : (
      <div className="space-y-4">
       {patient.appointments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((appointment) => (
         <div
          key={appointment.id}
          className="border rounded-lg p-4 hover:bg-card transition-colors"
         >
          <div className="flex justify-between items-start mb-2">
           <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
             {formatDate(appointment.date)}
            </span>
            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
            <span className="text-sm text-muted-foreground">
             {appointment.startTime} - {appointment.endTime}
            </span>
           </div>
           <Badge 
            variant={getStatusVariant(appointment.status) as any}
            className={getStatusClass(appointment.status)}
           >
            {getStatusText(appointment.status)}
           </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
           <div>
            <p className="text-muted-foreground">Tipo</p>
            <p>{appointment.type === 'NEW' ? 'Nova Consulta' : 'Retorno'}</p>
           </div>
           {appointment.observations && (
            <div>
             <p className="text-muted-foreground">Observações</p>
             <p className="text-sm">{appointment.observations}</p>
            </div>
           )}
          </div>

          {appointment.checkIn && (
           <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
            Check-in: {formatDateTime(appointment.checkIn)}
            {appointment.checkOut && (
             <span className="ml-4">
              Check-out: {formatDateTime(appointment.checkOut)}
             </span>
            )}
           </div>
          )}

          {appointment.cancellationReason && (
           <div className="mt-2 pt-2 border-t text-xs ">
            Motivo do cancelamento: {appointment.cancellationReason}
           </div>
          )}
         </div>
        ))}
      </div>
     )}
    </CardContent>
   </Card>
  </div>
 )
}