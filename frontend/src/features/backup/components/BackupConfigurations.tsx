import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { 
  Settings, 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Clock,
  Database,
  FileText,
  Calendar,
  Shield
} from 'lucide-react'
import { 
  useBackupConfigs, 
  useDeleteBackupConfig, 
  useExecuteBackup,
  useUpdateBackupConfig
} from '../../../hooks/useBackup'
import { BackupConfigForm } from './BackupConfigForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog'
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
import type { BackupConfig } from '../../../types/backup'

export function BackupConfigurations() {
  const { data: configs, isLoading } = useBackupConfigs()
  const deleteConfigMutation = useDeleteBackupConfig()
  const executeBackupMutation = useExecuteBackup()
  const updateConfigMutation = useUpdateBackupConfig()
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<BackupConfig | null>(null)

  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case 'DAILY': return 'Diário'
      case 'WEEKLY': return 'Semanal'
      case 'MONTHLY': return 'Mensal'
      default: return frequency
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const handleToggleConfig = async (config: BackupConfig) => {
    await updateConfigMutation.mutateAsync({
      id: config.id,
      data: { enabled: !config.enabled }
    })
  }

  const handleExecuteBackup = async (configId: string) => {
    await executeBackupMutation.mutateAsync(configId)
  }

  const handleDeleteConfig = async (configId: string) => {
    await deleteConfigMutation.mutateAsync(configId)
  }

  const handleEditConfig = (config: BackupConfig) => {
    setEditingConfig(config)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingConfig(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando configurações...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Configurações de Backup</h2>
          <p className="text-muted-foreground">
            Gerencie as configurações automáticas de backup
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Configuração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? 'Editar Configuração' : 'Nova Configuração de Backup'}
              </DialogTitle>
              <DialogDescription>
                {editingConfig 
                  ? 'Atualize as configurações do backup automático'
                  : 'Configure um novo backup automático para proteger seus dados'
                }
              </DialogDescription>
            </DialogHeader>
            <BackupConfigForm 
              config={editingConfig} 
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Configurations List */}
      {!configs || configs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma configuração encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira configuração de backup para proteger seus dados
            </p>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Configuração
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Configuração de Backup</DialogTitle>
                  <DialogDescription>
                    Configure um novo backup automático para proteger seus dados
                  </DialogDescription>
                </DialogHeader>
                <BackupConfigForm 
                  onSuccess={handleCloseForm}
                  onCancel={handleCloseForm}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {configs.map((config) => (
            <Card key={config.id} className={`${
              config.enabled ? 'border-green-200 bg-green-50/50' : 'border-gray-200'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      config.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatFrequency(config.frequency)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Retenção: {config.retentionDays} dias
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={config.enabled ? 'default' : 'secondary'}>
                      {config.enabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleConfig(config)}
                        disabled={updateConfigMutation.isPending}
                      >
                        {config.enabled ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExecuteBackup(config.id)}
                        disabled={executeBackupMutation.isPending || !config.enabled}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditConfig(config)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a configuração "{config.name}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteConfig(config.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Inclui:</span>
                    <div className="mt-1">
                      {config.includeDatabase && (
                        <Badge variant="outline" className="mr-1">
                          <Database className="h-3 w-3 mr-1" />
                          Banco
                        </Badge>
                      )}
                      {config.includeFiles && (
                        <Badge variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Arquivos
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Último backup:</span>
                    <div className="mt-1 font-medium">
                      {formatDate(config.lastBackup)}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Próximo backup:</span>
                    <div className="mt-1 font-medium">
                      {config.enabled ? formatDate(config.nextBackup) : 'Desabilitado'}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Notificações:</span>
                    <div className="mt-1">
                      {config.notifyOnSuccess && (
                        <Badge variant="outline" className="mr-1">Sucesso</Badge>
                      )}
                      {config.notifyOnFailure && (
                        <Badge variant="outline">Falha</Badge>
                      )}
                      {!config.notifyOnSuccess && !config.notifyOnFailure && (
                        <span className="text-muted-foreground">Nenhuma</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
