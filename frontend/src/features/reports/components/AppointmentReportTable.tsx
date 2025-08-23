import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { CalendarIcon, ClockIcon, DollarSignIcon, TrendingUpIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AppointmentReport } from '../../../services/reports'

interface AppointmentReportTableProps {
 data: AppointmentReport
}

export function AppointmentReportTable({ data }: AppointmentReportTableProps) {
 const statusMap = {
  'SCHEDULED': 'Agendado',
  'CONFIRMED': 'Confirmado',
  'COMPLETED': 'Concluído',
  'CANCELLED': 'Cancelado',
  'NO_SHOW': 'Não Compareceu',
  'PENDING': 'Pendente'
 }

 const getStatusBadge = (status: string) => {
  const statusColors = {
   'SCHEDULED': { bg: '#17a2b8', color: 'white' },
   'CONFIRMED': { bg: '#28a745', color: 'white' },
   'COMPLETED': { bg: '#28a745', color: 'white' },
   'CANCELLED': { bg: '#6c757d', color: 'white' },
   'NO_SHOW': { bg: '#dc3545', color: 'white' },
   'PENDING': { bg: '#fd7e14', color: 'white' }
  }
  
  const color = statusColors[status as keyof typeof statusColors] || { bg: '#6c757d', color: 'white' }
  
  return (
   <Badge >
    {statusMap[status as keyof typeof statusMap] || status}
   </Badge>
  )
 }

 const getTypeBadge = (type: string) => {
  const typeMap = {
   NEW: { label: 'Nova', variant: 'default' as const },
   RETURN: { label: 'Retorno', variant: 'secondary' as const },
   CONSULTATION: { label: 'Consulta', variant: 'default' as const },
   FOLLOWUP: { label: 'Retorno', variant: 'secondary' as const },
   EMERGENCY: { label: 'Emergência', variant: 'destructive' as const },
   PROCEDURE: { label: 'Procedimento', variant: 'default' as const },
   EXAM: { label: 'Exame', variant: 'secondary' as const },
   SURGERY: { label: 'Cirurgia', variant: 'destructive' as const },
   CHECKUP: { label: 'Check-up', variant: 'secondary' as const },
   TREATMENT: { label: 'Tratamento', variant: 'default' as const },
   THERAPY: { label: 'Terapia', variant: 'default' as const },
   // Adicionando mais traduções para garantir que todos os tipos sejam traduzidos
   'new': { label: 'Nova', variant: 'default' as const },
   'return': { label: 'Retorno', variant: 'secondary' as const },
   'consultation': { label: 'Consulta', variant: 'default' as const },
   'followup': { label: 'Retorno', variant: 'secondary' as const },
   'emergency': { label: 'Emergência', variant: 'destructive' as const },
   'procedure': { label: 'Procedimento', variant: 'default' as const },
   'exam': { label: 'Exame', variant: 'secondary' as const },
   'surgery': { label: 'Cirurgia', variant: 'destructive' as const },
   'checkup': { label: 'Check-up', variant: 'secondary' as const },
   'treatment': { label: 'Tratamento', variant: 'default' as const },
   'therapy': { label: 'Terapia', variant: 'default' as const },
   'Nova': { label: 'Nova', variant: 'default' as const },
   'Retorno': { label: 'Retorno', variant: 'secondary' as const },
   'Consulta': { label: 'Consulta', variant: 'default' as const },
   'Emergência': { label: 'Emergência', variant: 'destructive' as const },
   'Procedimento': { label: 'Procedimento', variant: 'default' as const },
   'Exame': { label: 'Exame', variant: 'secondary' as const },
   'Cirurgia': { label: 'Cirurgia', variant: 'destructive' as const },
   'Check-up': { label: 'Check-up', variant: 'secondary' as const },
   'Tratamento': { label: 'Tratamento', variant: 'default' as const },
   'Terapia': { label: 'Terapia', variant: 'default' as const },
  }
  
  return typeMap[type as keyof typeof typeMap] || { label: type, variant: 'secondary' as const }
 }

 return (
  <div className="space-y-6">
   {/* Métricas Resumo */}
   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold">{data.totalAppointments}</div>
      <p className="text-xs text-muted-foreground">
       {data.completedAppointments} concluídos, {data.cancelledAppointments} cancelados
      </p>
     </CardContent>
    </Card>

    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
      <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold">
       {new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
       }).format(data.totalRevenue)}
      </div>
      <p className="text-xs text-muted-foreground">
       Apenas agendamentos concluídos
      </p>
     </CardContent>
    </Card>

    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
      <ClockIcon className="h-4 w-4 text-muted-foreground" />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold">{Math.round(data.averageServiceTime)}min</div>
      <p className="text-xs text-muted-foreground">
       Duração média dos serviços
      </p>
     </CardContent>
    </Card>

    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
      <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold">
       {data.totalAppointments > 0 ? ((data.completedAppointments / data.totalAppointments) * 100).toFixed(1) : 0}%
      </div>
      <p className="text-xs text-muted-foreground">
       Agendamentos finalizados
      </p>
     </CardContent>
    </Card>
   </div>

   {/* Resumos por Categoria */}
   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <Card>
     <CardHeader>
      <CardTitle className="text-lg">Por Status</CardTitle>
      <CardDescription>Distribuição por status dos agendamentos</CardDescription>
     </CardHeader>
     <CardContent className="space-y-2">
      {Object.entries(data.groupedByStatus).map(([status, count]) => {
       const statusInfo = getStatusBadge(status)
       return (
        <div key={status} className="flex items-center justify-between">
         {statusInfo}
         <span className="font-medium">{count}</span>
        </div>
       )
      })}
     </CardContent>
    </Card>

    <Card>
     <CardHeader>
      <CardTitle className="text-lg">Por Parceiro</CardTitle>
      <CardDescription>Top parceiros com mais agendamentos</CardDescription>
     </CardHeader>
     <CardContent className="space-y-2">
      {Object.entries(data.groupedByPartner)
       .sort(([,a], [,b]) => b - a)
       .slice(0, 5)
       .map(([partner, count]) => (
        <div key={partner} className="flex items-center justify-between">
         <span className="text-sm truncate">{partner}</span>
         <Badge variant="outline">{count}</Badge>
        </div>
       ))}
     </CardContent>
    </Card>

    <Card>
     <CardHeader>
      <CardTitle className="text-lg">Por Serviço</CardTitle>
      <CardDescription>Serviços mais agendados</CardDescription>
     </CardHeader>
     <CardContent className="space-y-2">
      {Object.entries(data.groupedByService)
       .sort(([,a], [,b]) => b - a)
       .slice(0, 5)
       .map(([service, count]) => (
        <div key={service} className="flex items-center justify-between">
         <span className="text-sm truncate">{service}</span>
         <Badge variant="outline">{count}</Badge>
        </div>
       ))}
     </CardContent>
    </Card>
   </div>

   {/* Tabela Detalhada */}
   <Card>
    <CardHeader>
     <CardTitle>Agendamentos Detalhados</CardTitle>
     <CardDescription>Lista completa dos agendamentos do período</CardDescription>
    </CardHeader>
    <CardContent>
     <Table>
      <TableHeader>
       <TableRow>
        <TableHead>Data/Hora</TableHead>
        <TableHead>Paciente</TableHead>
        <TableHead>Parceiro</TableHead>
        <TableHead>Serviço</TableHead>
        <TableHead>Sala</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead className="text-right">Valor</TableHead>
       </TableRow>
      </TableHeader>
      <TableBody>
       {data.appointments.map((appointment) => {
        const statusInfo = getStatusBadge(appointment.status)
        const typeInfo = getTypeBadge(appointment.type)
        
        return (
         <TableRow key={appointment.id}>
          <TableCell>
           <div className="flex flex-col">
            <span className="font-medium">
             {format(new Date(appointment.date), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
            <span className="text-sm text-muted-foreground">
             {appointment.startTime} - {appointment.endTime}
            </span>
           </div>
          </TableCell>
          <TableCell>
           <div className="flex flex-col">
            <span className="font-medium">{appointment.patient?.fullName}</span>
            <span className="text-sm text-muted-foreground">{appointment.patient?.phone}</span>
           </div>
          </TableCell>
          <TableCell>
           <span className="font-medium">{appointment.partner?.fullName}</span>
          </TableCell>
          <TableCell>
           <span className="font-medium">{appointment.productService?.name}</span>
          </TableCell>
          <TableCell>
           <span className="text-sm">{appointment.room?.name || '-'}</span>
          </TableCell>
          <TableCell>
           {statusInfo}
          </TableCell>
          <TableCell>
           <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
          </TableCell>
          <TableCell className="text-right">
           {appointment.productService?.salePrice ? (
            <span className="font-medium">
             {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
             }).format(appointment.productService.salePrice)}
            </span>
           ) : (
            <span className="text-muted-foreground">-</span>
           )}
          </TableCell>
         </TableRow>
        )
       })}
      </TableBody>
     </Table>
     
     {data.appointments.length === 0 && (
      <div className="text-center py-8 text-muted-foreground">
       Nenhum agendamento encontrado para o período selecionado
      </div>
     )}
    </CardContent>
   </Card>
  </div>
 )
}
