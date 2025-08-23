import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { NotificationConfiguration } from './components/NotificationConfiguration'
import { NotificationTemplates } from './components/NotificationTemplates'
import { NotificationHistory } from './components/NotificationHistory'
import { NotificationStatistics } from './components/NotificationStatistics'
import { useNotificationConfiguration, useNotificationProviders, useNotificationScheduler } from '../../hooks'
import { Settings, MessageSquare, History, BarChart3, Bell, Wifi, WifiOff, Play, Pause } from 'lucide-react'

export function NotificationsPage() {
 const [activeTab, setActiveTab] = useState('dashboard')

 const { data: configuration } = useNotificationConfiguration()
 const { data: providers } = useNotificationProviders()
 const { data: scheduler } = useNotificationScheduler()

 return (
  <div className="container mx-auto p-6 space-y-6">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-3xl font-bold flex items-center gap-3">
      <Bell className="h-8 w-8" />
      Sistema de Notificações
     </h1>
     <p className="text-muted-foreground mt-1">
      Configure e monitore o sistema de lembretes automáticos
     </p>
    </div>

    {/* Status Cards */}
    <div className="flex items-center gap-4">
     {/* Status do Sistema */}
     <Card className="w-48">
      <CardContent className="p-4">
       <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${configuration?.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-medium">
         {configuration?.enabled ? 'Sistema Ativo' : 'Sistema Inativo'}
        </span>
       </div>
       <p className="text-xs text-muted-foreground mt-1">
        {providers?.configured?.length || 0} de 3 provedores configurados
       </p>
      </CardContent>
     </Card>

     {/* Status do Agendador */}
     <Card className="w-48">
      <CardContent className="p-4">
       <div className="flex items-center gap-2">
        {scheduler?.isRunning ? (
         <Play className="h-4 w-4 " />
        ) : (
         <Pause className="h-4 w-4 " />
        )}
        <span className="text-sm font-medium">
         Agendador {scheduler?.isRunning ? 'Ativo' : 'Inativo'}
        </span>
       </div>
       <p className="text-xs text-muted-foreground mt-1">
        Executa a cada 5 minutos
       </p>
      </CardContent>
     </Card>
    </div>
   </div>

   {/* Navegação por Abas */}
   <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
    <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
     <TabsTrigger value="dashboard" className="flex items-center gap-2">
      <BarChart3 className="h-4 w-4" />
      Dashboard
     </TabsTrigger>
     <TabsTrigger value="configuration" className="flex items-center gap-2">
      <Settings className="h-4 w-4" />
      Configurações
     </TabsTrigger>
     <TabsTrigger value="templates" className="flex items-center gap-2">
      <MessageSquare className="h-4 w-4" />
      Templates
     </TabsTrigger>
     <TabsTrigger value="history" className="flex items-center gap-2">
      <History className="h-4 w-4" />
      Histórico
     </TabsTrigger>
    </TabsList>

    {/* Conteúdo das Abas */}
    <div className="mt-6">
     {/* Aba: Dashboard */}
     <TabsContent value="dashboard" className="space-y-6">
      <NotificationStatistics />
     </TabsContent>

     {/* Aba: Configurações */}
     <TabsContent value="configuration" className="space-y-6">
      <NotificationConfiguration />
     </TabsContent>

     {/* Aba: Templates */}
     <TabsContent value="templates" className="space-y-6">
      <NotificationTemplates />
     </TabsContent>

     {/* Aba: Histórico */}
     <TabsContent value="history" className="space-y-6">
      <NotificationHistory />
     </TabsContent>
    </div>
   </Tabs>

   {/* Alertas do Sistema */}
   {configuration?.enabled && (
    <div className="space-y-3">
     {/* Alerta: Sistema Inativo */}
     {!configuration.enabled && (
      <Card className="border-yellow-200 ">
       <CardContent className="p-4">
        <div className="flex items-center gap-2">
         <span className="">⚠️</span>
         <span className="font-medium ">Sistema de Notificações Desabilitado</span>
        </div>
        <p className="text-sm  mt-1">
         O sistema de notificações está desabilitado. Acesse a aba "Configurações" para habilitá-lo.
        </p>
       </CardContent>
      </Card>
     )}

     {/* Alerta: Agendador Inativo */}
     {configuration.enabled && !scheduler?.isRunning && (
      <Card className="border-red-200 ">
       <CardContent className="p-4">
        <div className="flex items-center gap-2">
         <span className="">❌</span>
         <span className="font-medium ">Agendador Inativo</span>
        </div>
        <p className="text-sm  mt-1">
         O agendador automático está parado. Notificações não serão enviadas automaticamente. 
         Verifique o status na aba "Dashboard".
        </p>
       </CardContent>
      </Card>
     )}

     {/* Alerta: Provedores Não Configurados */}
     {configuration.enabled && (providers?.configured?.length || 0) === 0 && (
      <Card className="border-orange-200 ">
       <CardContent className="p-4">
        <div className="flex items-center gap-2">
         <WifiOff className="h-4 w-4 " />
         <span className="font-medium ">Nenhum Provedor Configurado</span>
        </div>
        <p className="text-sm  mt-1">
         Nenhum provedor de notificação está configurado. Configure pelo menos um provedor para começar a enviar notificações.
        </p>
       </CardContent>
      </Card>
     )}

     {/* Alerta: Sucesso */}
     {configuration.enabled && scheduler?.isRunning && (providers?.configured?.length || 0) > 0 && (
      <Card className="border-green-200 ">
       <CardContent className="p-4">
        <div className="flex items-center gap-2">
         <span className="">✅</span>
         <span className="font-medium ">Sistema Funcionando Corretamente</span>
        </div>
        <p className="text-sm  mt-1">
         O sistema de notificações está configurado e funcionando. 
         Lembretes serão enviados automaticamente conforme os agendamentos.
        </p>
       </CardContent>
      </Card>
     )}
    </div>
   )}
  </div>
 )
}
