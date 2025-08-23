import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { CalendarIcon, DownloadIcon, FileTextIcon, TrendingUpIcon, UsersIcon, DollarSignIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { useAppointmentReport, useFinancialReport, usePartnerReport, useReportSummary } from '../../hooks/useReports'
import { reportsService } from '../../services/reports'
import { AppointmentReportTable } from './components/AppointmentReportTable'
import { FinancialReportTable } from './components/FinancialReportTable'
import { PartnerReportTable } from './components/PartnerReportTable'
import { ReportCharts } from './components/ReportCharts'
import { ReportFilters } from './components/ReportFilters'

export function ReportsPage() {
 const [dateRange, setDateRange] = useState({
  startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd')
 })

 const [filters, setFilters] = useState({
  partnerId: '',
  patientId: '',
  roomId: '',
  serviceId: '',
  status: 'all',
  type: 'all',
  bankAccountId: '',
  category: 'all',
  partnershipType: 'all'
 })

 const [activeTab, setActiveTab] = useState('summary')
 const [exportLoading, setExportLoading] = useState<string | null>(null)

 // Queries dos relatórios
 const summaryQuery = useReportSummary(dateRange)
 const appointmentQuery = useAppointmentReport({ 
  ...dateRange, 
  ...filters,
  status: filters.status === 'all' ? undefined : filters.status,
  type: filters.type === 'all' ? undefined : filters.type
 }, activeTab === 'appointments')
 
 const financialQuery = useFinancialReport({ 
  ...dateRange, 
  ...filters,
  status: filters.status === 'all' ? undefined : filters.status,
  type: filters.type === 'all' ? undefined : filters.type as any,
  category: filters.category === 'all' ? undefined : filters.category
 }, activeTab === 'financial')
 
 const partnerQuery = usePartnerReport({ 
  ...dateRange, 
  ...filters,
  partnershipType: filters.partnershipType === 'all' ? undefined : filters.partnershipType
 }, activeTab === 'partners')

 const handleExport = async (type: 'appointments' | 'financial' | 'partners', format: 'json' | 'csv') => {
  try {
   setExportLoading(`${type}-${format}`)
   
   let exportFilters = { ...dateRange }
   
   if (type === 'appointments') {
    exportFilters = { 
     ...exportFilters, 
     ...filters,
     status: filters.status === 'all' ? undefined : filters.status,
     type: filters.type === 'all' ? undefined : filters.type
    }
   } else if (type === 'financial') {
    exportFilters = { 
     ...exportFilters, 
     ...filters,
     status: filters.status === 'all' ? undefined : filters.status,
     type: filters.type === 'all' ? undefined : filters.type,
     category: filters.category === 'all' ? undefined : filters.category
    }
   } else if (type === 'partners') {
    exportFilters = { 
     ...exportFilters, 
     partnerId: filters.partnerId, 
     partnershipType: filters.partnershipType === 'all' ? undefined : filters.partnershipType
    }
   }

   await reportsService.exportReport(type, exportFilters, format)
   
   if (format === 'json') {
    // Para JSON, podemos mostrar uma mensagem de sucesso
    console.log('Relatório exportado com sucesso!')
   }
  } catch (error) {
   console.error('Erro ao exportar relatório:', error)
  } finally {
   setExportLoading(null)
  }
 }

 const handleFilterChange = (newFilters: any) => {
  setFilters(prev => ({ ...prev, ...newFilters }))
 }

 const handleDateRangeChange = (newDateRange: { startDate: string; endDate: string }) => {
  setDateRange(newDateRange)
 }

 const isLoading = summaryQuery.isLoading || appointmentQuery.isLoading || financialQuery.isLoading || partnerQuery.isLoading

 return (
  <div className="container mx-auto py-6 space-y-6">
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
     <p className="text-muted-foreground">
      Análises detalhadas e exportação de dados da clínica
     </p>
    </div>
    <div className="flex items-center space-x-2">
     <Badge variant="outline">
      {format(new Date(dateRange.startDate), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(dateRange.endDate), 'dd/MM/yyyy', { locale: ptBR })}
     </Badge>
    </div>
   </div>

   {/* Filtros */}
   <ReportFilters
    dateRange={dateRange}
    filters={filters}
    onDateRangeChange={handleDateRangeChange}
    onFilterChange={handleFilterChange}
   />

   <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
    <TabsList className="grid w-full grid-cols-4">
     <TabsTrigger value="summary" className="flex items-center gap-2">
      <TrendingUpIcon className="h-4 w-4" />
      Resumo
     </TabsTrigger>
     <TabsTrigger value="appointments" className="flex items-center gap-2">
      <CalendarIcon className="h-4 w-4" />
      Agendamentos
     </TabsTrigger>
     <TabsTrigger value="financial" className="flex items-center gap-2">
      <DollarSignIcon className="h-4 w-4" />
      Financeiro
     </TabsTrigger>
     <TabsTrigger value="partners" className="flex items-center gap-2">
      <UsersIcon className="h-4 w-4" />
      Parceiros
     </TabsTrigger>
    </TabsList>

    {/* Resumo Executivo */}
    <TabsContent value="summary" className="space-y-6">
     {summaryQuery.data && (
      <>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
         </CardHeader>
         <CardContent>
          <div className="text-2xl font-bold">{summaryQuery.data.appointments.total}</div>
          <p className="text-xs text-muted-foreground">
           {summaryQuery.data.appointments.completed} concluídos
          </p>
         </CardContent>
        </Card>

        <Card>
         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
         </CardHeader>
         <CardContent>
          <div className="text-2xl font-bold">
           {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
           }).format(summaryQuery.data.appointments.revenue)}
          </div>
          <p className="text-xs text-muted-foreground">
           Lucro: {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
           }).format(summaryQuery.data.financial.netProfit)}
          </p>
         </CardContent>
        </Card>

        <Card>
         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Parceiros Ativos</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
         </CardHeader>
         <CardContent>
          <div className="text-2xl font-bold">{summaryQuery.data.partners.active}</div>
          <p className="text-xs text-muted-foreground">
           de {summaryQuery.data.partners.total} total
          </p>
         </CardContent>
        </Card>

        <Card>
         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
         </CardHeader>
         <CardContent>
          <div className="text-2xl font-bold">
           {summaryQuery.data.partners.averageCompletionRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
           Média dos parceiros
          </p>
         </CardContent>
        </Card>
       </div>

       <ReportCharts data={summaryQuery.data} />
      </>
     )}
    </TabsContent>

    {/* Relatório de Agendamentos */}
    <TabsContent value="appointments" className="space-y-6">
     <div className="flex items-center justify-between">
      <div>
       <h2 className="text-2xl font-bold">Relatório de Agendamentos</h2>
       <p className="text-muted-foreground">Análise detalhada dos agendamentos do período</p>
      </div>
      <div className="flex items-center space-x-2">
       <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('appointments', 'csv')}
        disabled={exportLoading === 'appointments-csv'}
       >
        <DownloadIcon className="h-4 w-4 mr-2" />
        {exportLoading === 'appointments-csv' ? 'Exportando...' : 'CSV'}
       </Button>
       <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('appointments', 'json')}
        disabled={exportLoading === 'appointments-json'}
       >
        <FileTextIcon className="h-4 w-4 mr-2" />
        {exportLoading === 'appointments-json' ? 'Exportando...' : 'JSON'}
       </Button>
      </div>
     </div>

     {appointmentQuery.data && (
      <AppointmentReportTable data={appointmentQuery.data} />
     )}
    </TabsContent>

    {/* Relatório Financeiro */}
    <TabsContent value="financial" className="space-y-6">
     <div className="flex items-center justify-between">
      <div>
       <h2 className="text-2xl font-bold">Relatório Financeiro</h2>
       <p className="text-muted-foreground">Análise detalhada das finanças do período</p>
      </div>
      <div className="flex items-center space-x-2">
       <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('financial', 'csv')}
        disabled={exportLoading === 'financial-csv'}
       >
        <DownloadIcon className="h-4 w-4 mr-2" />
        {exportLoading === 'financial-csv' ? 'Exportando...' : 'CSV'}
       </Button>
       <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('financial', 'json')}
        disabled={exportLoading === 'financial-json'}
       >
        <FileTextIcon className="h-4 w-4 mr-2" />
        {exportLoading === 'financial-json' ? 'Exportando...' : 'JSON'}
       </Button>
      </div>
     </div>

     {financialQuery.data && (
      <FinancialReportTable data={financialQuery.data} />
     )}
    </TabsContent>

    {/* Relatório de Parceiros */}
    <TabsContent value="partners" className="space-y-6">
     <div className="flex items-center justify-between">
      <div>
       <h2 className="text-2xl font-bold">Relatório de Parceiros</h2>
       <p className="text-muted-foreground">Performance e métricas dos parceiros</p>
      </div>
      <div className="flex items-center space-x-2">
       <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('partners', 'csv')}
        disabled={exportLoading === 'partners-csv'}
       >
        <DownloadIcon className="h-4 w-4 mr-2" />
        {exportLoading === 'partners-csv' ? 'Exportando...' : 'CSV'}
       </Button>
       <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('partners', 'json')}
        disabled={exportLoading === 'partners-json'}
       >
        <FileTextIcon className="h-4 w-4 mr-2" />
        {exportLoading === 'partners-json' ? 'Exportando...' : 'JSON'}
       </Button>
      </div>
     </div>

     {partnerQuery.data && (
      <PartnerReportTable data={partnerQuery.data} />
     )}
    </TabsContent>
   </Tabs>
  </div>
 )
}
