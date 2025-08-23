import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
 useNotificationLogs,
 useNotificationChannels
} from '../../../hooks'
import { NotificationLogFilters, NotificationChannel, NotificationStatus } from '../../../types'
import { notificationsService } from '../../../services/notifications'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Badge } from '../../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { ScrollArea } from '../../../components/ui/scroll-area'
import { Loader2, Search, Calendar, Eye, RefreshCw, Download, Filter } from 'lucide-react'

export function NotificationHistory() {
 const [filters, setFilters] = useState<NotificationLogFilters>({
  page: 1,
  limit: 20
 })
 const [showFilters, setShowFilters] = useState(false)
 const [selectedLog, setSelectedLog] = useState<any>(null)

 const { data: logsData, isLoading, refetch } = useNotificationLogs(filters)
 const channels = useNotificationChannels()

 const logs = logsData?.logs || []
 const total = logsData?.total || 0

 const totalPages = Math.ceil(total / (filters.limit || 20))

 // Atualizar filtros
 const updateFilters = (newFilters: Partial<NotificationLogFilters>) => {
  setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
 }

 // Limpar filtros
 const clearFilters = () => {
  setFilters({ page: 1, limit: 20 })
 }

 // Navegar páginas
 const goToPage = (page: number) => {
  setFilters(prev => ({ ...prev, page }))
 }

 // Visualizar detalhes do log
 const handleViewDetails = (log: any) => {
  setSelectedLog(log)
 }

 // Status colors
 const getStatusBadge = (status: NotificationStatus) => {
  const color = notificationsService.getStatusColor(status)
  const label = notificationsService.getStatusLabel(status)
  
  return (
   <Badge 
    variant={status === 'DELIVERED' || status === 'SENT' ? 'default' : 
        status === 'FAILED' ? 'destructive' : 'secondary'}
    className={color}
   >
    {label}
   </Badge>
  )
 }

 return (
  <div className="space-y-6">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <h2 className="text-2xl font-bold">Histórico de Notificações</h2>
     <p className="text-muted-foreground">Visualize todas as notificações enviadas e seus status</p>
    </div>
    <div className="flex items-center gap-2">
     <Button 
      variant="outline" 
      onClick={() => refetch()}
      className="flex items-center gap-2"
     >
      <RefreshCw className="h-4 w-4" />
      Atualizar
     </Button>
     <Button 
      variant="outline" 
      onClick={() => setShowFilters(!showFilters)}
      className="flex items-center gap-2"
     >
      <Filter className="h-4 w-4" />
      Filtros
     </Button>
    </div>
   </div>

   {/* Filtros */}
   {showFilters && (
    <Card>
     <CardHeader>
      <CardTitle>Filtros de Busca</CardTitle>
      <CardDescription>
       Use os filtros abaixo para encontrar notificações específicas
      </CardDescription>
     </CardHeader>
     <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
       {/* ID do Agendamento */}
       <div className="space-y-2">
        <Label>ID do Agendamento</Label>
        <Input
         placeholder="ID do agendamento"
         value={filters.appointmentId || ''}
         onChange={(e) => updateFilters({ appointmentId: e.target.value || undefined })}
        />
       </div>

       {/* Canal */}
       <div className="space-y-2">
        <Label>Canal</Label>
        <Select 
         value={filters.channel || 'all'} 
         onValueChange={(value) => updateFilters({ channel: value === 'all' ? undefined : value as NotificationChannel })}
        >
         <SelectTrigger>
          <SelectValue />
         </SelectTrigger>
         <SelectContent>
          <SelectItem value="all">Todos os canais</SelectItem>
          {channels.map((channel) => (
           <SelectItem key={channel.value} value={channel.value}>
            <div className="flex items-center gap-2">
             <span>{channel.icon}</span>
             <span>{channel.label}</span>
            </div>
           </SelectItem>
          ))}
         </SelectContent>
        </Select>
       </div>

       {/* Status */}
       <div className="space-y-2">
        <Label>Status</Label>
        <Select 
         value={filters.status || 'all'} 
         onValueChange={(value) => updateFilters({ status: value === 'all' ? undefined : value as NotificationStatus })}
        >
         <SelectTrigger>
          <SelectValue />
         </SelectTrigger>
         <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {Object.values(NotificationStatus).map((status) => (
           <SelectItem key={status} value={status}>
            {notificationsService.getStatusLabel(status)}
           </SelectItem>
          ))}
         </SelectContent>
        </Select>
       </div>

       {/* Data */}
       <div className="space-y-2">
        <Label>Data (De)</Label>
        <Input
         type="date"
         value={filters.dateFrom ? format(filters.dateFrom, 'yyyy-MM-dd') : ''}
         onChange={(e) => updateFilters({ 
          dateFrom: e.target.value ? new Date(e.target.value) : undefined 
         })}
        />
       </div>

       <div className="space-y-2">
        <Label>Data (Até)</Label>
        <Input
         type="date"
         value={filters.dateTo ? format(filters.dateTo, 'yyyy-MM-dd') : ''}
         onChange={(e) => updateFilters({ 
          dateTo: e.target.value ? new Date(e.target.value) : undefined 
         })}
        />
       </div>
      </div>

      <div className="flex justify-end gap-2">
       <Button variant="outline" onClick={clearFilters}>
        Limpar Filtros
       </Button>
      </div>
     </CardContent>
    </Card>
   )}

   {/* Estatísticas Rápidas */}
   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card>
     <CardContent className="p-6">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm font-medium text-muted-foreground">Total</p>
        <p className="text-2xl font-bold">{total}</p>
       </div>
       <div className="h-8 w-8  rounded-full flex items-center justify-center">
        📊
       </div>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="p-6">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm font-medium text-muted-foreground">Enviadas</p>
        <p className="text-2xl font-bold ">
         {logs.filter(log => log.status === 'SENT' || log.status === 'DELIVERED').length}
        </p>
       </div>
       <div className="h-8 w-8  rounded-full flex items-center justify-center">
        ✅
       </div>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="p-6">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm font-medium text-muted-foreground">Falharam</p>
        <p className="text-2xl font-bold ">
         {logs.filter(log => log.status === 'FAILED').length}
        </p>
       </div>
       <div className="h-8 w-8  rounded-full flex items-center justify-center">
        ❌
       </div>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="p-6">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
        <p className="text-2xl font-bold ">
         {logs.filter(log => log.status === 'PENDING').length}
        </p>
       </div>
       <div className="h-8 w-8  rounded-full flex items-center justify-center">
        ⏳
       </div>
      </div>
     </CardContent>
    </Card>
   </div>

   {/* Lista de Logs */}
   <Card>
    <CardHeader>
     <CardTitle>Logs de Notificação</CardTitle>
     <CardDescription>
      {total} notificação(ões) encontrada(s) - Página {filters.page} de {totalPages}
     </CardDescription>
    </CardHeader>
    <CardContent>
     {isLoading ? (
      <div className="flex items-center justify-center p-8">
       <Loader2 className="h-8 w-8 animate-spin" />
      </div>
     ) : (
      <div className="space-y-4">
       <Table>
        <TableHeader>
         <TableRow>
          <TableHead>Data/Hora</TableHead>
          <TableHead>Canal</TableHead>
          <TableHead>Destinatário</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Agendamento</TableHead>
          <TableHead>Ações</TableHead>
         </TableRow>
        </TableHeader>
        <TableBody>
         {logs.map((log) => (
          <TableRow key={log.id}>
           <TableCell>
            <div className="text-sm">
             <div className="font-medium">
              {format(new Date(log.sentAt), 'dd/MM/yyyy', { locale: ptBR })}
             </div>
             <div className="text-muted-foreground">
              {format(new Date(log.sentAt), 'HH:mm:ss', { locale: ptBR })}
             </div>
            </div>
           </TableCell>
           <TableCell>
            <div className="flex items-center gap-2">
             <span>{channels.find(c => c.value === log.channel)?.icon}</span>
             <span className="text-sm">{channels.find(c => c.value === log.channel)?.label}</span>
            </div>
           </TableCell>
           <TableCell>
            <div className="text-sm font-mono">
             {log.recipient}
            </div>
           </TableCell>
           <TableCell>
            {getStatusBadge(log.status)}
           </TableCell>
           <TableCell>
            <div className="text-sm text-muted-foreground">
             {log.appointmentId.substring(0, 8)}...
            </div>
           </TableCell>
           <TableCell>
            <Button
             variant="ghost"
             size="sm"
             onClick={() => handleViewDetails(log)}
             className="flex items-center gap-1"
            >
             <Eye className="h-4 w-4" />
             Ver
            </Button>
           </TableCell>
          </TableRow>
         ))}
        </TableBody>
       </Table>

       {/* Paginação */}
       {totalPages > 1 && (
        <div className="flex items-center justify-between">
         <div className="text-sm text-muted-foreground">
          Mostrando {((filters.page || 1) - 1) * (filters.limit || 20) + 1} a {Math.min((filters.page || 1) * (filters.limit || 20), total)} de {total} resultados
         </div>
         <div className="flex items-center gap-2">
          <Button
           variant="outline"
           size="sm"
           disabled={filters.page === 1}
           onClick={() => goToPage((filters.page || 1) - 1)}
          >
           Anterior
          </Button>
          <span className="text-sm px-3 py-1 bg-card rounded">
           {filters.page} de {totalPages}
          </span>
          <Button
           variant="outline"
           size="sm"
           disabled={filters.page === totalPages}
           onClick={() => goToPage((filters.page || 1) + 1)}
          >
           Próxima
          </Button>
         </div>
        </div>
       )}
      </div>
     )}
    </CardContent>
   </Card>

   {/* Dialog de Detalhes */}
   <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
    <DialogContent className="max-w-2xl">
     <DialogHeader>
      <DialogTitle>Detalhes da Notificação</DialogTitle>
      <DialogDescription>
       Informações completas sobre a notificação enviada
      </DialogDescription>
     </DialogHeader>

     {selectedLog && (
      <div className="space-y-6">
       {/* Informações Básicas */}
       <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
         <Label>ID:</Label>
         <p className="font-mono mt-1">{selectedLog.id}</p>
        </div>
        <div>
         <Label>Canal:</Label>
         <div className="flex items-center gap-2 mt-1">
          <span>{channels.find(c => c.value === selectedLog.channel)?.icon}</span>
          <span>{channels.find(c => c.value === selectedLog.channel)?.label}</span>
         </div>
        </div>
        <div>
         <Label>Status:</Label>
         <div className="mt-1">
          {getStatusBadge(selectedLog.status)}
         </div>
        </div>
        <div>
         <Label>Destinatário:</Label>
         <p className="font-mono mt-1">{selectedLog.recipient}</p>
        </div>
        <div>
         <Label>Enviado em:</Label>
         <p className="mt-1">
          {format(new Date(selectedLog.sentAt), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
         </p>
        </div>
        {selectedLog.deliveredAt && (
         <div>
          <Label>Entregue em:</Label>
          <p className="mt-1">
           {format(new Date(selectedLog.deliveredAt), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
          </p>
         </div>
        )}
       </div>

       {/* Assunto (se houver) */}
       {selectedLog.subject && (
        <div>
         <Label>Assunto:</Label>
         <p className="bg-card p-3 rounded border mt-1">
          {selectedLog.subject}
         </p>
        </div>
       )}

       {/* Conteúdo */}
       <div>
        <Label>Conteúdo:</Label>
        <ScrollArea className="h-32 bg-card p-3 rounded border mt-1">
         <div className="whitespace-pre-wrap text-sm">
          {selectedLog.content}
         </div>
        </ScrollArea>
       </div>

       {/* Erro (se houver) */}
       {selectedLog.errorMessage && (
        <div>
         <Label>Mensagem de Erro:</Label>
         <p className="bg-red-50 border border-red-200 p-3 rounded mt-1  text-sm">
          {selectedLog.errorMessage}
         </p>
        </div>
       )}

       {/* Dados do Provedor (se houver) */}
       {selectedLog.providerData && (
        <div>
         <Label>Dados do Provedor:</Label>
         <ScrollArea className="h-24 bg-card p-3 rounded border mt-1">
          <pre className="text-xs">
           {JSON.stringify(selectedLog.providerData, null, 2)}
          </pre>
         </ScrollArea>
        </div>
       )}
      </div>
     )}
    </DialogContent>
   </Dialog>
  </div>
 )
}
