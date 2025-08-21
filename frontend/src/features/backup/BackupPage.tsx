import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { 
  Database, 
  Clock, 
  History, 
  Settings, 
  Play, 
  Download,
  Shield,
  Server,
  HardDrive,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { BackupConfigurations } from './components/BackupConfigurations'
import { BackupHistory } from './components/BackupHistory'
import { BackupStats } from './components/BackupStats'
import { useBackupConfigs, useBackupStats, useCheckScheduledBackups } from '../../hooks/useBackup'

export function BackupPage() {
  const { data: configs, isLoading: configsLoading } = useBackupConfigs()
  const { data: stats, isLoading: statsLoading } = useBackupStats()
  const checkScheduledMutation = useCheckScheduledBackups()

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleCheckScheduled = () => {
    checkScheduledMutation.mutate()
  }

  if (configsLoading || statsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Sistema de Backup
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie backups automáticos e mantenha seus dados seguros
          </p>
        </div>
        <Button 
          onClick={handleCheckScheduled}
          disabled={checkScheduledMutation.isPending}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          {checkScheduledMutation.isPending ? 'Verificando...' : 'Verificar Agendados'}
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configurações</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {configs?.filter(c => c.enabled).length || 0} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBackups || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.successfulBackups || 0} bem-sucedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamanho Total</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats?.totalSize || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Espaço ocupado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalBackups ? 
                Math.round((stats.successfulBackups / stats.totalBackups) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos backups
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      {configs && configs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {configs.slice(0, 3).map((config) => (
            <Card key={config.id} className={`border-l-4 ${
              config.enabled 
                ? config.lastBackup 
                  ? 'border-l-green-500' 
                  : 'border-l-yellow-500'
                : 'border-l-gray-300'
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {config.enabled ? (
                    config.lastBackup ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  {config.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequência:</span>
                    <span>{config.frequency === 'DAILY' ? 'Diária' : 
                           config.frequency === 'WEEKLY' ? 'Semanal' : 'Mensal'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={config.enabled ? 'text-green-600' : 'text-gray-500'}>
                      {config.enabled ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  {config.lastBackup && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Último:</span>
                      <span>{new Date(config.lastBackup).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {config.nextBackup && config.enabled && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Próximo:</span>
                      <span>{new Date(config.nextBackup).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs Content */}
      <Tabs defaultValue="configurations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configurations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configurations">
          <BackupConfigurations />
        </TabsContent>

        <TabsContent value="history">
          <BackupHistory />
        </TabsContent>

        <TabsContent value="stats">
          <BackupStats />
        </TabsContent>
      </Tabs>
    </div>
  )
}
