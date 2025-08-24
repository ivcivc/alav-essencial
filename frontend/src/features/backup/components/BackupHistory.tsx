import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { 
 Select, 
 SelectContent, 
 SelectItem, 
 SelectTrigger, 
 SelectValue 
} from '../../../components/ui/select'
import { 
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '../../../components/ui/table'
import { 
 CheckCircle, 
 XCircle, 
 Clock, 
 Download, 
 RotateCcw,
 FileText,
 Database,
 HardDrive,
 Calendar
} from 'lucide-react'
import { 
 useBackupHistory, 
 useBackupConfigs,
 useDownloadBackup,
 useRestoreBackup
} from '../../../hooks/useBackup'
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
 AlertDialogTrigger,
} from '../../../components/ui/alert-dialog'

export function BackupHistory() {
 const [selectedConfigId, setSelectedConfigId] = useState<string>('all')
 const { data: configs } = useBackupConfigs()
 const { data: history, isLoading } = useBackupHistory(
  selectedConfigId === 'all' ? undefined : selectedConfigId
 )
 const downloadMutation = useDownloadBackup()
 const restoreMutation = useRestoreBackup()

 const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
 }

 const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('pt-BR')
 }

 const formatDuration = (startedAt: string, completedAt?: string) => {
  if (!completedAt) return 'Em andamento...'
  
  const start = new Date(startedAt).getTime()
  const end = new Date(completedAt).getTime()
  const duration = Math.round((end - start) / 1000)
  
  if (duration < 60) {
   return `${duration}s`
  } else if (duration < 3600) {
   return `${Math.round(duration / 60)}min`
  } else {
   return `${Math.round(duration / 3600)}h`
  }
 }

 const getStatusIcon = (status: string) => {
  switch (status) {
   case 'SUCCESS':
    return <CheckCircle className="h-4 w-4 " />
   case 'FAILED':
    return <XCircle className="h-4 w-4 " />
   case 'IN_PROGRESS':
    return <Clock className="h-4 w-4  animate-spin" />
   default:
    return <Clock className="h-4 w-4 text-muted-foreground" />
  }
 }

 const getStatusBadge = (status: string) => {
  switch (status) {
   case 'SUCCESS':
    return <Badge variant="default" className="">Sucesso</Badge>
   case 'FAILED':
    return <Badge variant="destructive">Falha</Badge>
   case 'IN_PROGRESS':
    return <Badge variant="secondary">Em andamento</Badge>
   default:
    return <Badge variant="outline">{status}</Badge>
  }
 }

 const getTypeIcon = (type: string) => {
  switch (type) {
   case 'DATABASE':
    return <Database className="h-4 w-4" />
   case 'FILES':
    return <FileText className="h-4 w-4" />
   case 'FULL':
    return <HardDrive className="h-4 w-4" />
   default:
    return <FileText className="h-4 w-4" />
  }
 }

 const handleDownload = async (backupId: string) => {
  await downloadMutation.mutateAsync(backupId)
 }

 const handleRestore = async (backupId: string) => {
  await restoreMutation.mutateAsync(backupId)
 }

 const getConfigName = (configId: string) => {
  const config = configs?.find(c => c.id === configId)
  return config?.name || 'Configuração não encontrada'
 }

 if (isLoading) {
  return (
   <Card>
    <CardContent className="flex justify-center items-center h-64">
     <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8  border-primary mx-auto"></div>
      <p className="mt-2 text-muted-foreground">Carregando histórico...</p>
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <div className="space-y-4">
   {/* Header and Filters */}
   <div className="flex items-center justify-between">
    <div>
     <h2 className="text-xl font-semibold">Histórico de Backups</h2>
     <p className="text-muted-foreground">
      Visualize todos os backups executados
     </p>
    </div>
    
    <div className="flex items-center gap-4">
     <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Filtrar por:</span>
      <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
       <SelectTrigger className="w-48">
        <SelectValue />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todas as configurações</SelectItem>
        {configs?.map((config) => (
         <SelectItem key={config.id} value={config.id}>
          {config.name}
         </SelectItem>
        ))}
       </SelectContent>
      </Select>
     </div>
    </div>
   </div>

   {/* History Table */}
   {!history || history.length === 0 ? (
    <Card>
     <CardContent className="flex flex-col items-center justify-center h-64 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Nenhum backup encontrado</h3>
      <p className="text-muted-foreground">
       {selectedConfigId === 'all' 
        ? 'Nenhum backup foi executado ainda'
        : 'Nenhum backup encontrado para esta configuração'
       }
      </p>
     </CardContent>
    </Card>
   ) : (
    <Card>
     <CardHeader>
      <CardTitle className="text-lg">
       Histórico de Execuções ({history.length})
      </CardTitle>
      <CardDescription>
       Últimos backups executados, ordenados por data
      </CardDescription>
     </CardHeader>
     <CardContent>
      <Table>
       <TableHeader>
        <TableRow>
         <TableHead>Status</TableHead>
         <TableHead>Configuração</TableHead>
         <TableHead>Tipo</TableHead>
         <TableHead>Data/Hora</TableHead>
         <TableHead>Duração</TableHead>
         <TableHead>Tamanho</TableHead>
         <TableHead>Ações</TableHead>
        </TableRow>
       </TableHeader>
       <TableBody>
        {history.map((backup) => (
         <TableRow key={backup.id}>
          <TableCell>
           <div className="flex items-center gap-2">
            {getStatusIcon(backup.status)}
            {getStatusBadge(backup.status)}
           </div>
          </TableCell>
          
          <TableCell>
           <div className="font-medium">
            {getConfigName(backup.configId)}
           </div>
          </TableCell>
          
          <TableCell>
           <div className="flex items-center gap-2">
            {getTypeIcon(backup.type)}
            <span className="text-sm">
             {backup.type === 'DATABASE' ? 'Banco' :
              backup.type === 'FILES' ? 'Arquivos' : 
              backup.type === 'FULL' ? 'Completo' : backup.type}
            </span>
           </div>
          </TableCell>
          
          <TableCell>
           <div className="text-sm">
            <div>{formatDate(backup.startedAt)}</div>
            {backup.errorMessage && (
             <div className=" text-xs mt-1 max-w-48 truncate" 
                title={backup.errorMessage}>
              {backup.errorMessage}
             </div>
            )}
           </div>
          </TableCell>
          
          <TableCell>
           <span className="text-sm text-muted-foreground">
            {formatDuration(backup.startedAt, backup.completedAt)}
           </span>
          </TableCell>
          
          <TableCell>
           <span className="text-sm">
            {backup.status === 'SUCCESS' ? formatBytes(backup.size) : '-'}
           </span>
          </TableCell>
          
          <TableCell>
           <div className="flex items-center gap-1">
            {backup.status === 'SUCCESS' && (
             <>
              <Button
               variant="ghost"
               size="sm"
               onClick={() => handleDownload(backup.id)}
               disabled={downloadMutation.isPending}
               title="Download"
              >
               <Download className="h-4 w-4" />
              </Button>
              
              <AlertDialog>
               <AlertDialogTrigger asChild>
                <Button
                 variant="ghost"
                 size="sm"
                 title="Restaurar"
                >
                 <RotateCcw className="h-4 w-4" />
                </Button>
               </AlertDialogTrigger>
               <AlertDialogContent>
                <AlertDialogHeader>
                 <AlertDialogTitle>Confirmar Restauração</AlertDialogTitle>
                 <AlertDialogDescription>
                  <div className="space-y-2">
                   <p>
                    Tem certeza que deseja restaurar este backup? 
                    <strong> Esta ação irá sobrescrever todos os dados atuais.</strong>
                   </p>
                   <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm font-medium ">
                     Backup: {backup.filename}
                    </p>
                    <p className="text-sm ">
                     Data: {formatDate(backup.startedAt)}
                    </p>
                    <p className="text-sm ">
                     Tamanho: {formatBytes(backup.size)}
                    </p>
                   </div>
                   <p className="text-sm  font-medium">
                    ⚠️ Esta ação não pode ser desfeita!
                   </p>
                  </div>
                 </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                 <AlertDialogCancel>Cancelar</AlertDialogCancel>
                 <AlertDialogAction
                  onClick={() => handleRestore(backup.id)}
                  className="bg-red-600 hover:"
                 >
                  Restaurar Backup
                 </AlertDialogAction>
                </AlertDialogFooter>
               </AlertDialogContent>
              </AlertDialog>
             </>
            )}
           </div>
          </TableCell>
         </TableRow>
        ))}
       </TableBody>
      </Table>
     </CardContent>
    </Card>
   )}
  </div>
 )
}
