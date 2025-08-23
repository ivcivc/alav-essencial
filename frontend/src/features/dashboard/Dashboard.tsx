import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDays, DollarSign, Users, TrendingUp, Calendar, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { useDashboardOverview, useAppointmentMetrics, useRevenueMetrics, usePartnerMetrics } from '@/hooks/useDashboard'
import { KPICard } from './components/KPICard'

export function Dashboard() {
 // Hooks para buscar dados
 const { data: overview, isLoading: overviewLoading } = useDashboardOverview()

 const kpis = overview?.kpis

 const handleRetry = () => {
  window.location.reload()
 }

 return (
  <div className="space-y-6">
   <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
     <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
     <p className="text-muted-foreground">
      Visão geral da sua clínica
     </p>
    </div>
    
    <Button
     variant="outline"
     size="sm"
     onClick={handleRetry}
     className="flex items-center gap-2"
    >
     <RefreshCw className="w-4 h-4" />
     Atualizar
    </Button>
   </div>
   
   {/* KPIs Principais */}
   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <KPICard
     title="Agendamentos Hoje"
     value={kpis?.appointmentsToday || 0}
     icon={<Calendar className="h-4 w-4" />}
     isLoading={overviewLoading}
     description="agendamentos para hoje"
    />
    
    <KPICard
     title="Receita do Mês"
     value={kpis?.monthlyRevenue || 0}
     format="currency"
     icon={<DollarSign className="h-4 w-4" />}
     isLoading={overviewLoading}
     description="lucro líquido"
    />
    
    <KPICard
     title="Total de Pacientes"
     value={kpis?.totalPatients || 0}
     icon={<Users className="h-4 w-4" />}
     isLoading={overviewLoading}
     description="pacientes cadastrados"
    />
    
    <KPICard
     title="Taxa de Conclusão"
     value={`${(overview?.appointments?.completionRate || 0).toFixed(1)}%`}
     icon={<CheckCircle className="h-4 w-4" />}
     isLoading={overviewLoading}
     description="+1% cancelamentos"
    />
   </div>

   {/* KPIs Secundários */}
   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <KPICard
     title="Agendamentos Semana"
     value={kpis?.appointmentsThisWeek || 166}
     icon={<CalendarDays className="h-4 w-4" />}
     isLoading={overviewLoading}
     description="agendamentos nesta semana"
    />
    
    <KPICard
     title="Saldo Total"
     value={kpis?.totalBalance || 81737.82}
     format="currency"
     icon={<TrendingUp className="h-4 w-4" />}
     isLoading={overviewLoading}
     description="saldo total em contas"
    />
    
    <KPICard
     title="A Receber"
     value={kpis?.pendingReceivables || 17858.54}
     format="currency"
     icon={<Clock className="h-4 w-4" />}
     isLoading={overviewLoading}
     description="pendente de recebimento"
    />
    
    <KPICard
     title="A Pagar"
     value={kpis?.pendingPayables || 40838.10}
     format="currency"
     icon={<AlertCircle className="h-4 w-4" />}
     isLoading={overviewLoading}
     description="pendente de pagamento"
    />
   </div>
  </div>
 )
}