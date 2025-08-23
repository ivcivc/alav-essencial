import React, { useState } from 'react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
 useNotificationStatistics,
 useNotificationProviders,
 useNotificationScheduler,
 useProcessSchedulerManually,
 useNotificationChannels
} from '../../../hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Loader2, RefreshCw, Play, Pause, TrendingUp, TrendingDown, Activity, Wifi, WifiOff, Calendar } from 'lucide-react'

export function NotificationStatistics() {
 const [dateRange, setDateRange] = useState({
  dateFrom: startOfDay(subDays(new Date(), 7)),
  dateTo: endOfDay(new Date())
 })

 const { data: statistics, isLoading: statsLoading, refetch: refetchStats } = useNotificationStatistics(dateRange)
 const { data: providers, isLoading: providersLoading } = useNotificationProviders()
 const { data: scheduler, isLoading: schedulerLoading, refetch: refetchScheduler } = useNotificationScheduler()
 const processScheduler = useProcessSchedulerManually()
 const channels = useNotificationChannels()

 const handleProcessScheduler = () => {
  processScheduler.mutate(undefined, {
   onSuccess: () => {
    refetchScheduler()
    refetchStats()
   }
  })
 }

 const updateDateRange = (field: 'dateFrom' | 'dateTo', value: string) => {
  setDateRange(prev => ({
   ...prev,
   [field]: value ? (field === 'dateFrom' ? startOfDay(new Date(value)) : endOfDay(new Date(value))) : undefined
  }))
 }

 // Calcular taxas de sucesso
 const successRate = statistics ? ((statistics.sent / statistics.total) * 100) : 0
 const failureRate = statistics ? ((statistics.failed / statistics.total) * 100) : 0

 return (
  <div className="space-y-6">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <h2 className="text-2xl font-bold">Dashboard de Notificações</h2>
     <p className="text-muted-foreground">Acompanhe estatísticas e status do sistema de notificações</p>
    </div>
    <div className="flex items-center gap-2">
     <Button 
      variant="outline" 
      onClick={() => {
       refetchStats()
       refetchScheduler()
      }}
      className="flex items-center gap-2"
     >
      <RefreshCw className="h-4 w-4" />
      Atualizar
     </Button>
    </div>
   </div>

   <Tabs defaultValue="overview" className="w-full">
    <TabsList className="grid w-full grid-cols-4">
     <TabsTrigger value="overview">Visão Geral</TabsTrigger>
     <TabsTrigger value="providers">Provedores</TabsTrigger>
     <TabsTrigger value="scheduler">Agendador</TabsTrigger>
     <TabsTrigger value="performance">Performance</TabsTrigger>
    </TabsList>

    {/* Aba: Visão Geral */}
    <TabsContent value="overview" className="space-y-6">
     {/* Filtros de Data */}
     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Período de Análise
       </CardTitle>
      </CardHeader>
      <CardContent>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
         <Label>Data Início</Label>
         <Input
          type="date"
          value={format(dateRange.dateFrom, 'yyyy-MM-dd')}
          onChange={(e) => updateDateRange('dateFrom', e.target.value)}
         />
        </div>
        <div className="space-y-2">
         <Label>Data Fim</Label>
         <Input
          type="date"
          value={format(dateRange.dateTo, 'yyyy-MM-dd')}
          onChange={(e) => updateDateRange('dateTo', e.target.value)}
         />
        </div>
       </div>
      </CardContent>
     </Card>

     {/* Métricas Principais */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
       <CardContent className="p-6">
        <div className="flex items-center justify-between">
         <div>
          <p className="text-sm font-medium text-muted-foreground">Total Enviadas</p>
          <p className="text-3xl font-bold">{statistics?.total || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">
           Período: {format(dateRange.dateFrom, 'dd/MM', { locale: ptBR })} - {format(dateRange.dateTo, 'dd/MM', { locale: ptBR })}
          </p>
         </div>
         <div className="h-12 w-12  rounded-full flex items-center justify-center">
          <Activity className="h-6 w-6 text-primary" />
         </div>
        </div>
       </CardContent>
      </Card>

      <Card>
       <CardContent className="p-6">
        <div className="flex items-center justify-between">
         <div>
          <p className="text-sm font-medium text-muted-foreground">Sucesso</p>
          <p className="text-3xl font-bold ">{statistics?.sent || 0}</p>
          <div className="flex items-center gap-1 mt-1">
           <TrendingUp className="h-3 w-3 " />
           <p className="text-xs ">{successRate.toFixed(1)}%</p>
          </div>
         </div>
         <div className="h-12 w-12  rounded-full flex items-center justify-center">
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
          <p className="text-3xl font-bold ">{statistics?.failed || 0}</p>
          <div className="flex items-center gap-1 mt-1">
           <TrendingDown className="h-3 w-3 " />
           <p className="text-xs ">{failureRate.toFixed(1)}%</p>
          </div>
         </div>
         <div className="h-12 w-12  rounded-full flex items-center justify-center">
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
          <p className="text-3xl font-bold ">{statistics?.pending || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Aguardando envio</p>
         </div>
         <div className="h-12 w-12  rounded-full flex items-center justify-center">
          ⏳
         </div>
        </div>
       </CardContent>
      </Card>
     </div>

     {/* Distribuição por Canal */}
     <Card>
      <CardHeader>
       <CardTitle>Distribuição por Canal</CardTitle>
       <CardDescription>
        Quantidade de notificações enviadas por cada canal
       </CardDescription>
      </CardHeader>
      <CardContent>
       {statsLoading ? (
        <div className="flex items-center justify-center p-8">
         <Loader2 className="h-8 w-8 animate-spin" />
        </div>
       ) : (
        <div className="space-y-4">
         {channels.map(channel => {
          const count = statistics?.byChannel?.[channel.value] || 0
          const percentage = statistics?.total ? (count / statistics.total) * 100 : 0
          
          return (
           <div key={channel.value} className="space-y-2">
            <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
              <span className="text-lg">{channel.icon}</span>
              <span className="font-medium">{channel.label}</span>
             </div>
             <div className="text-right">
              <span className="font-bold">{count}</span>
              <span className="text-sm text-muted-foreground ml-2">({percentage.toFixed(1)}%)</span>
             </div>
            </div>
            <Progress value={percentage} className="h-2" />
           </div>
          )
         })}
        </div>
       )}
      </CardContent>
     </Card>
    </TabsContent>

    {/* Aba: Provedores */}
    <TabsContent value="providers" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle>Status dos Provedores</CardTitle>
       <CardDescription>
        Verifique o status de conexão com os provedores de notificação
       </CardDescription>
      </CardHeader>
      <CardContent>
       {providersLoading ? (
        <div className="flex items-center justify-center p-8">
         <Loader2 className="h-8 w-8 animate-spin" />
        </div>
       ) : (
        <div className="space-y-4">
         {/* WhatsApp */}
         <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
           <span className="text-2xl">📱</span>
           <div>
            <h3 className="font-semibold">WhatsApp</h3>
            <p className="text-sm text-muted-foreground">API do WhatsApp Business</p>
           </div>
          </div>
          <div className="flex items-center gap-2">
           <Badge variant={providers?.whatsapp ? 'default' : 'secondary'}>
            {providers?.whatsapp ? 'Conectado' : 'Desconectado'}
           </Badge>
           {providers?.whatsapp ? (
            <Wifi className="h-5 w-5 " />
           ) : (
            <WifiOff className="h-5 w-5 " />
           )}
          </div>
         </div>

         {/* SMS */}
         <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
           <span className="text-2xl">💬</span>
           <div>
            <h3 className="font-semibold">SMS</h3>
            <p className="text-sm text-muted-foreground">Provedor de SMS (Twilio)</p>
           </div>
          </div>
          <div className="flex items-center gap-2">
           <Badge variant={providers?.sms ? 'default' : 'secondary'}>
            {providers?.sms ? 'Conectado' : 'Desconectado'}
           </Badge>
           {providers?.sms ? (
            <Wifi className="h-5 w-5 " />
           ) : (
            <WifiOff className="h-5 w-5 " />
           )}
          </div>
         </div>

         {/* Email */}
         <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
           <span className="text-2xl">📧</span>
           <div>
            <h3 className="font-semibold">Email</h3>
            <p className="text-sm text-muted-foreground">SMTP (Nodemailer)</p>
           </div>
          </div>
          <div className="flex items-center gap-2">
           <Badge variant={providers?.email ? 'default' : 'secondary'}>
            {providers?.email ? 'Conectado' : 'Desconectado'}
           </Badge>
           {providers?.email ? (
            <Wifi className="h-5 w-5 " />
           ) : (
            <WifiOff className="h-5 w-5 " />
           )}
          </div>
         </div>
        </div>
       )}
      </CardContent>
     </Card>

     {/* Canais Configurados */}
     <Card>
      <CardHeader>
       <CardTitle>Resumo de Configuração</CardTitle>
      </CardHeader>
      <CardContent>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 border  rounded-lg">
         <div className="text-2xl font-bold ">
          {providers?.configured?.length || 0}
         </div>
         <p className="text-sm ">Canais Configurados</p>
        </div>
        <div className="text-center p-4 bg-blue-50 border  rounded-lg">
         <div className="text-2xl font-bold text-primary">
          {providers?.available?.length || 0}
         </div>
         <p className="text-sm text-primary">Canais Disponíveis</p>
        </div>
        <div className="text-center p-4 bg-card border border-border rounded-lg">
         <div className="text-2xl font-bold text-muted-foreground">
          {3 - (providers?.configured?.length || 0)}
         </div>
         <p className="text-sm text-muted-foreground">Não Configurados</p>
        </div>
       </div>
      </CardContent>
     </Card>
    </TabsContent>

    {/* Aba: Agendador */}
    <TabsContent value="scheduler" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle>Status do Agendador</CardTitle>
       <CardDescription>
        Monitore o agendador automático de notificações
       </CardDescription>
      </CardHeader>
      <CardContent>
       {schedulerLoading ? (
        <div className="flex items-center justify-center p-8">
         <Loader2 className="h-8 w-8 animate-spin" />
        </div>
       ) : (
        <div className="space-y-6">
         {/* Status Principal */}
         <div className="flex items-center justify-between p-6 border rounded-lg">
          <div className="flex items-center gap-4">
           <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            scheduler?.isRunning ? 'bg-green-100' : 'bg-red-100'
           }`}>
            {scheduler?.isRunning ? (
             <Play className="h-6 w-6 " />
            ) : (
             <Pause className="h-6 w-6 " />
            )}
           </div>
           <div>
            <h3 className="text-lg font-semibold">
             Agendador {scheduler?.isRunning ? 'Ativo' : 'Inativo'}
            </h3>
            <p className="text-sm text-muted-foreground">
             {scheduler?.isRunning 
              ? 'O agendador está processando notificações automaticamente'
              : 'O agendador está parado - notificações não serão enviadas automaticamente'
             }
            </p>
           </div>
          </div>
          <Badge variant={scheduler?.isRunning ? 'default' : 'destructive'}>
           {scheduler?.isRunning ? 'Ativo' : 'Inativo'}
          </Badge>
         </div>

         {/* Próxima Execução */}
         {scheduler?.nextExecution && (
          <div className="p-4 bg-blue-50 border  rounded-lg">
           <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">Próxima Execução</span>
           </div>
           <p className="text-primary">
            {format(new Date(scheduler.nextExecution), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
           </p>
          </div>
         )}

         {/* Controles Manuais */}
         <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Controles Manuais</h4>
          <div className="flex gap-4">
           <Button
            onClick={handleProcessScheduler}
            disabled={processScheduler.isPending}
            className="flex items-center gap-2"
           >
            {processScheduler.isPending ? (
             <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
             <Play className="h-4 w-4" />
            )}
            Processar Agora
           </Button>
           <Button variant="outline" onClick={refetchScheduler}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Status
           </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
           Use "Processar Agora" para executar manualmente o processamento de notificações pendentes.
          </p>
         </div>
        </div>
       )}
      </CardContent>
     </Card>
    </TabsContent>

    {/* Aba: Performance */}
    <TabsContent value="performance" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle>Métricas de Performance</CardTitle>
       <CardDescription>
        Analise a eficiência do sistema de notificações
       </CardDescription>
      </CardHeader>
      <CardContent>
       {statsLoading ? (
        <div className="flex items-center justify-center p-8">
         <Loader2 className="h-8 w-8 animate-spin" />
        </div>
       ) : (
        <div className="space-y-6">
         {/* Taxa de Sucesso */}
         <div>
          <div className="flex items-center justify-between mb-2">
           <h4 className="font-semibold">Taxa de Sucesso</h4>
           <span className="text-2xl font-bold ">{successRate.toFixed(1)}%</span>
          </div>
          <Progress value={successRate} className="h-3" />
          <p className="text-sm text-muted-foreground mt-1">
           {statistics?.sent || 0} de {statistics?.total || 0} notificações enviadas com sucesso
          </p>
         </div>

         {/* Taxa de Falha */}
         <div>
          <div className="flex items-center justify-between mb-2">
           <h4 className="font-semibold">Taxa de Falha</h4>
           <span className="text-2xl font-bold ">{failureRate.toFixed(1)}%</span>
          </div>
          <Progress value={failureRate} className="h-3" />
          <p className="text-sm text-muted-foreground mt-1">
           {statistics?.failed || 0} notificações falharam no envio
          </p>
         </div>

         {/* Alertas de Performance */}
         <div className="space-y-3">
          <h4 className="font-semibold">Alertas de Performance</h4>
          
          {failureRate > 10 && (
           <div className="p-3 bg-red-50 border  rounded-lg">
            <div className="flex items-center gap-2">
             <span className="">⚠️</span>
             <span className="font-medium ">Alta Taxa de Falha</span>
            </div>
            <p className="text-sm  mt-1">
             A taxa de falha está acima de 10%. Verifique a configuração dos provedores.
            </p>
           </div>
          )}

          {(statistics?.pending || 0) > 100 && (
           <div className="p-3 bg-yellow-50 border  rounded-lg">
            <div className="flex items-center gap-2">
             <span className="">⚠️</span>
             <span className="font-medium ">Muitas Notificações Pendentes</span>
            </div>
            <p className="text-sm  mt-1">
             Há mais de 100 notificações pendentes. O agendador pode estar sobrecarregado.
            </p>
           </div>
          )}

          {!scheduler?.isRunning && (
           <div className="p-3 bg-red-50 border  rounded-lg">
            <div className="flex items-center gap-2">
             <span className="">❌</span>
             <span className="font-medium ">Agendador Inativo</span>
            </div>
            <p className="text-sm  mt-1">
             O agendador automático está parado. Notificações não serão enviadas automaticamente.
            </p>
           </div>
          )}

          {failureRate <= 10 && (statistics?.pending || 0) <= 100 && scheduler?.isRunning && (
           <div className="p-3 bg-green-50 border  rounded-lg">
            <div className="flex items-center gap-2">
             <span className="">✅</span>
             <span className="font-medium ">Sistema Funcionando Bem</span>
            </div>
            <p className="text-sm  mt-1">
             Todas as métricas estão dentro dos parâmetros normais.
            </p>
           </div>
          )}
         </div>
        </div>
       )}
      </CardContent>
     </Card>
    </TabsContent>
   </Tabs>
  </div>
 )
}
