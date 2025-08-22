import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDays, DollarSign, Users, TrendingUp, Calendar, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { useDashboardOverview, useAppointmentMetrics, useRevenueMetrics, usePartnerMetrics, usePeriodComparison } from '@/hooks/useDashboard'
import { KPICard } from './components/KPICard'
import { AppointmentsChart } from './components/AppointmentsChart'
import { RevenueChart } from './components/RevenueChart'
import { PartnerPerformance } from './components/PartnerPerformance'
import { PeriodSelector, type DateRange } from './components/PeriodSelector'
import { PeriodComparison } from './components/PeriodComparison'
import { CacheBuster } from '@/components/common/CacheBuster'

export function Dashboard() {
  // Período selecionável (padrão: mês atual)
  const currentDate = new Date()
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange>({
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0],
    label: 'Este Mês'
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

  // Hook para comparação de períodos
  const comparison = usePeriodComparison(selectedPeriod)

  const kpis = overview?.kpis

  // Detectar se há problemas de cache (sem dados após loading)
  const hasDataIssues = !overviewLoading && !overview && 
                       !appointmentsLoading && !appointmentMetrics &&
                       !revenueLoading && !revenueMetrics &&
                       !partnersLoading && !partnerMetrics

  const handleRetry = () => {
    window.location.reload()
  }

  const handlePeriodChange = (newPeriod: DateRange) => {
    setSelectedPeriod(newPeriod)
  }

  return (
    <div className="space-y-6">
      {hasDataIssues && <CacheBuster onRetry={handleRetry} />}
      
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da sua clínica
          </p>
        </div>
        
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            className="lg:min-w-[300px]"
          />
          
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

      {/* Comparação de Períodos */}
      {comparison.current.appointments && comparison.previous.appointments && (
        <PeriodComparison
          data={[
            {
              current: comparison.current.appointments.totalAppointments || 0,
              previous: comparison.previous.appointments.totalAppointments || 0,
              label: 'Total de Agendamentos'
            },
            {
              current: comparison.current.appointments.completedAppointments || 0,
              previous: comparison.previous.appointments.completedAppointments || 0,
              label: 'Agendamentos Concluídos'
            },
            {
              current: comparison.current.revenue?.totalRevenue || 0,
              previous: comparison.previous.revenue?.totalRevenue || 0,
              label: 'Receita Total (R$)'
            },
            {
              current: comparison.current.revenue?.paidRevenue || 0,
              previous: comparison.previous.revenue?.paidRevenue || 0,
              label: 'Receita Recebida (R$)'
            }
          ]}
          isLoading={comparison.isLoading}
        />
      )}

      {/* Gráficos e Métricas */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          <TabsTrigger value="revenue">Financeiro</TabsTrigger>
          <TabsTrigger value="partners">Parceiros</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
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

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Detalhes da Comparação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Análise de Tendências
                </CardTitle>
                <CardDescription>
                  Comparação detalhada entre períodos selecionados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {comparison.isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Resumo dos Períodos */}
                    <div className="grid gap-4 text-sm">
                      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="font-medium">Período Atual:</span>
                        <Badge variant="outline">{selectedPeriod.label || 'Personalizado'}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="font-medium">Período Anterior:</span>
                        <Badge variant="secondary">Mesmo período anterior</Badge>
                      </div>
                    </div>

                    {/* Métricas Adicionais */}
                    {comparison.current.appointments && comparison.previous.appointments && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Métricas de Performance</h4>
                        <div className="grid gap-3 text-xs">
                          <div className="flex justify-between">
                            <span>Taxa de Conclusão Atual:</span>
                            <span className="font-medium">
                              {comparison.current.appointments.totalAppointments > 0 
                                ? ((comparison.current.appointments.completedAppointments / comparison.current.appointments.totalAppointments) * 100).toFixed(1)
                                : 0}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxa de Conclusão Anterior:</span>
                            <span className="font-medium">
                              {comparison.previous.appointments.totalAppointments > 0 
                                ? ((comparison.previous.appointments.completedAppointments / comparison.previous.appointments.totalAppointments) * 100).toFixed(1)
                                : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insights e Recomendações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Insights e Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">💡 Dica</h5>
                    <p className="text-green-700 dark:text-green-300">
                      Use diferentes períodos para identificar tendências sazonais e padrões de crescimento.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📊 Análise</h5>
                    <p className="text-blue-700 dark:text-blue-300">
                      Compare períodos similares (mesmo mês do ano anterior) para análises mais precisas.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-2">🎯 Ação</h5>
                    <p className="text-amber-700 dark:text-amber-300">
                      Identifique os períodos de melhor performance e replique as estratégias utilizadas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}