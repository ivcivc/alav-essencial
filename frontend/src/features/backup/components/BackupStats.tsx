import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { 
 Database, 
 CheckCircle, 
 XCircle, 
 HardDrive,
 Calendar,
 TrendingUp,
 Clock,
 Shield
} from 'lucide-react'
import { useBackupStats, useBackupHistory } from '../../../hooks/useBackup'

export function BackupStats() {
 const { data: stats, isLoading: statsLoading } = useBackupStats()
 const { data: history, isLoading: historyLoading } = useBackupHistory()

 const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
 }

 const formatDate = (dateString?: string) => {
  if (!dateString) return 'Nunca'
  return new Date(dateString).toLocaleString('pt-BR')
 }

 // Calcular estatísticas dos últimos 30 dias
 const getRecentStats = () => {
  if (!history) return null

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentBackups = history.filter(backup => 
   new Date(backup.startedAt) >= thirtyDaysAgo
  )

  const successfulRecent = recentBackups.filter(b => b.status === 'SUCCESS')
  const failedRecent = recentBackups.filter(b => b.status === 'FAILED')

  return {
   total: recentBackups.length,
   successful: successfulRecent.length,
   failed: failedRecent.length,
   successRate: recentBackups.length > 0 
    ? Math.round((successfulRecent.length / recentBackups.length) * 100) 
    : 0,
   totalSize: successfulRecent.reduce((sum, backup) => sum + backup.size, 0)
  }
 }

 // Calcular tamanho médio dos backups
 const getAverageBackupSize = () => {
  if (!history) return 0
  const successfulBackups = history.filter(b => b.status === 'SUCCESS')
  if (successfulBackups.length === 0) return 0
  
  const totalSize = successfulBackups.reduce((sum, backup) => sum + backup.size, 0)
  return totalSize / successfulBackups.length
 }

 // Calcular frequência de backups (backups por semana)
 const getBackupFrequency = () => {
  if (!history || history.length === 0) return 0

  const oldestBackup = new Date(Math.min(...history.map(b => new Date(b.startedAt).getTime())))
  const newestBackup = new Date(Math.max(...history.map(b => new Date(b.startedAt).getTime())))
  
  const timeDiff = newestBackup.getTime() - oldestBackup.getTime()
  const daysDiff = timeDiff / (1000 * 3600 * 24)
  const weeksDiff = daysDiff / 7

  if (weeksDiff < 1) return history.length
  return Math.round(history.length / weeksDiff)
 }

 const recentStats = getRecentStats()

 if (statsLoading || historyLoading) {
  return (
   <Card>
    <CardContent className="flex justify-center items-center h-64">
     <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8  border-primary mx-auto"></div>
      <p className="mt-2 text-muted-foreground">Carregando estatísticas...</p>
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <div className="space-y-6">
   {/* Header */}
   <div>
    <h2 className="text-xl font-semibold">Estatísticas de Backup</h2>
    <p className="text-muted-foreground">
     Análise detalhada do histórico de backups
    </p>
   </div>

   {/* Estatísticas Gerais */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
      <Database className="h-4 w-4 text-muted-foreground" />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold">{stats?.totalBackups || 0}</div>
      <p className="text-xs text-muted-foreground">
       Desde o início
      </p>
     </CardContent>
    </Card>

    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
      <CheckCircle className="h-4 w-4 text-muted-foreground" />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold ">
       {stats?.totalBackups ? 
        Math.round((stats.successfulBackups / stats.totalBackups) * 100) : 0}%
      </div>
      <p className="text-xs text-muted-foreground">
       {stats?.successfulBackups || 0} de {stats?.totalBackups || 0} backups
      </p>
     </CardContent>
    </Card>

    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Espaço Total</CardTitle>
      <HardDrive className="h-4 w-4 text-muted-foreground" />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold">{formatBytes(stats?.totalSize || 0)}</div>
      <p className="text-xs text-muted-foreground">
       Espaço ocupado pelos backups
      </p>
     </CardContent>
    </Card>

    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Backup Médio</CardTitle>
      <TrendingUp className="h-4 w-4 text-muted-foreground" />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold">{formatBytes(getAverageBackupSize())}</div>
      <p className="text-xs text-muted-foreground">
       Tamanho médio por backup
      </p>
     </CardContent>
    </Card>
   </div>

   {/* Estatísticas dos Últimos 30 Dias */}
   {recentStats && (
    <Card>
     <CardHeader>
      <CardTitle className="text-lg">Últimos 30 Dias</CardTitle>
      <CardDescription>
       Análise do desempenho recente dos backups
      </CardDescription>
     </CardHeader>
     <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
       <div className="text-center p-4 border rounded-lg">
        <div className="text-2xl font-bold text-primary">{recentStats.total}</div>
        <p className="text-sm text-muted-foreground">Backups Executados</p>
       </div>
       
       <div className="text-center p-4 border rounded-lg">
        <div className="text-2xl font-bold ">{recentStats.successful}</div>
        <p className="text-sm text-muted-foreground">Bem-sucedidos</p>
       </div>
       
       <div className="text-center p-4 border rounded-lg">
        <div className="text-2xl font-bold ">{recentStats.failed}</div>
        <p className="text-sm text-muted-foreground">Falharam</p>
       </div>
       
       <div className="text-center p-4 border rounded-lg">
        <div className="text-2xl font-bold ">{recentStats.successRate}%</div>
        <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
       </div>
      </div>
     </CardContent>
    </Card>
   )}

   {/* Informações Detalhadas */}
   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card>
     <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
       <Calendar className="h-5 w-5" />
       Cronologia
      </CardTitle>
     </CardHeader>
     <CardContent className="space-y-4">
      <div className="flex justify-between items-center">
       <span className="text-muted-foreground">Primeiro backup:</span>
       <span className="font-medium">{formatDate(stats?.oldestBackup)}</span>
      </div>
      
      <div className="flex justify-between items-center">
       <span className="text-muted-foreground">Último backup:</span>
       <span className="font-medium">{formatDate(stats?.newestBackup)}</span>
      </div>
      
      <div className="flex justify-between items-center">
       <span className="text-muted-foreground">Frequência:</span>
       <span className="font-medium">{getBackupFrequency()} por semana</span>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
       <Shield className="h-5 w-5" />
       Análise de Confiabilidade
      </CardTitle>
     </CardHeader>
     <CardContent className="space-y-4">
      <div className="flex justify-between items-center">
       <span className="text-muted-foreground">Backups bem-sucedidos:</span>
       <span className="font-medium ">{stats?.successfulBackups || 0}</span>
      </div>
      
      <div className="flex justify-between items-center">
       <span className="text-muted-foreground">Backups com falha:</span>
       <span className="font-medium ">{stats?.failedBackups || 0}</span>
      </div>
      
      <div className="flex justify-between items-center">
       <span className="text-muted-foreground">Status atual:</span>
       <span className={`font-medium ${
        (stats?.failedBackups || 0) === 0 ? 'text-green-600' :
        (stats?.failedBackups || 0) < (stats?.successfulBackups || 0) / 10 ? 'text-yellow-600' : 'text-red-600'
       }`}>
        {(stats?.failedBackups || 0) === 0 ? 'Excelente' :
         (stats?.failedBackups || 0) < (stats?.successfulBackups || 0) / 10 ? 'Bom' : 'Requer atenção'}
       </span>
      </div>
     </CardContent>
    </Card>
   </div>
  </div>
 )
}
