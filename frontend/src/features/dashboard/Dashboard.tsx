import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDays, DollarSign, Users, TrendingUp, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { useDashboardOverview, useAppointmentMetrics, useRevenueMetrics, usePartnerMetrics } from '@/hooks/useDashboard'
import { KPICard } from './components/KPICard'
import { AppointmentsChart } from './components/AppointmentsChart'
import { RevenueChart } from './components/RevenueChart'
import { PartnerPerformance } from './components/PartnerPerformance'
import { CacheBuster } from '@/components/common/CacheBuster'

export function Dashboard() {
  // Período atual (mês atual)
  const currentDate = new Date()
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  const [selectedPeriod] = useState({
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0]
  })

  // Hooks para buscar dados
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview()
  const { data: appointmentMetrics, isLoading: appointmentsLoading } = useAppointmentMetrics(
    selectedPeriod.startDate, 
    selectedPeriod.endDate
  )
  const { data: revenueMetrics, isLoading: revenueLoading } = useRevenueMetrics(
    selectedPeriod.startDate, 
    selectedPeriod.endDate
  )
  const { data: partnerMetrics, isLoading: partnersLoading } = usePartnerMetrics(
    selectedPeriod.startDate, 
    selectedPeriod.endDate
  )

  const kpis = overview?.kpis

  // Detectar se há problemas de cache (sem dados após loading)
  const hasDataIssues = !overviewLoading && !overview && 
                       !appointmentsLoading && !appointmentMetrics &&
                       !revenueLoading && !revenueMetrics &&
                       !partnersLoading && !partnerMetrics

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {hasDataIssues && <CacheBuster onRetry={handleRetry} />}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da sua clínica
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Período: {new Date(selectedPeriod.startDate).toLocaleDateString('pt-BR')} - {new Date(selectedPeriod.endDate).toLocaleDateString('pt-BR')}
          </Badge>
        </div>
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
          trend={{
            value: kpis?.netProfit || 0,
            isPositive: (kpis?.netProfit || 0) > 0,
            label: "lucro líquido"
          }}
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
          value={overview?.appointments?.completionRate || 0}
          format="percentage"
          icon={<CheckCircle className="h-4 w-4" />}
          isLoading={overviewLoading}
          trend={{
            value: overview?.appointments?.cancellationRate || 0,
            isPositive: false,
            label: "% cancelamentos"
          }}
        />
      </div>

      {/* KPIs Secundários */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Agendamentos Semana"
          value={kpis?.appointmentsThisWeek || 0}
          icon={<CalendarDays className="h-4 w-4" />}
          isLoading={overviewLoading}
        />
        
        <KPICard
          title="Saldo Total"
          value={kpis?.totalBalance || 0}
          format="currency"
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={overviewLoading}
        />
        
        <KPICard
          title="A Receber"
          value={kpis?.pendingReceivables || 0}
          format="currency"
          icon={<Clock className="h-4 w-4" />}
          isLoading={overviewLoading}
        />
        
        <KPICard
          title="A Pagar"
          value={kpis?.pendingPayables || 0}
          format="currency"
          icon={<AlertCircle className="h-4 w-4" />}
          isLoading={overviewLoading}
        />
      </div>

      {/* Gráficos e Métricas */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          <TabsTrigger value="revenue">Financeiro</TabsTrigger>
          <TabsTrigger value="partners">Parceiros</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="space-y-4">
          <AppointmentsChart
            dailyData={appointmentMetrics?.appointmentsByDay}
            statusData={appointmentMetrics?.appointmentsByStatus}
            isLoading={appointmentsLoading}
          />
          
          {/* Resumo de Agendamentos */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total de Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {appointmentMetrics?.totalAppointments || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taxa de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {appointmentMetrics?.completionRate.toFixed(1) || 0}%
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taxa de Cancelamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {appointmentMetrics?.cancellationRate.toFixed(1) || 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <RevenueChart
            dailyData={revenueMetrics?.dailyRevenue}
            categoryData={revenueMetrics?.revenueByCategory}
            isLoading={revenueLoading}
          />
          
          {/* Resumo Financeiro */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Receita Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(revenueMetrics?.totalRevenue || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Despesas Totais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(revenueMetrics?.totalExpenses || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Margem de Lucro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  (revenueMetrics?.profitMargin || 0) > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {revenueMetrics?.profitMargin.toFixed(1) || 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="partners" className="space-y-4">
          <PartnerPerformance
            topPartners={partnerMetrics?.topPartnersByRevenue}
            partnersByType={partnerMetrics?.partnersByType}
            isLoading={partnersLoading}
          />
          
          {/* Resumo de Parceiros */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total de Parceiros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {partnerMetrics?.totalPartners || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Parceiros Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {partnerMetrics?.activePartners || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Parceiros Inativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-500">
                  {partnerMetrics?.inactivePartners || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}