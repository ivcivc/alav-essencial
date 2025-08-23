import React, { useState } from 'react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
 LineChart, 
 Line, 
 XAxis, 
 YAxis, 
 CartesianGrid, 
 Tooltip, 
 Legend, 
 ResponsiveContainer,
 BarChart,
 Bar,
 Area,
 AreaChart
} from 'recharts'
import { 
 TrendingUp, 
 TrendingDown, 
 Calendar, 
 DollarSign, 
 ArrowUpRight, 
 ArrowDownRight,
 BarChart3,
 Activity
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'

import { useCashFlow } from '../../../hooks/useFinancial'
import type { CashFlowData } from '../../../services/financial'

interface CashFlowChartProps {
 className?: string
}

export function CashFlowChart({ className }: CashFlowChartProps) {
 const [period, setPeriod] = useState('30') // dias
 const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line')
 const [startDate, setStartDate] = useState(() => 
  format(subDays(new Date(), 30), 'yyyy-MM-dd')
 )
 const [endDate, setEndDate] = useState(() => 
  format(new Date(), 'yyyy-MM-dd')
 )

 const { data: cashFlowData, isLoading, error } = useCashFlow(
  `${startDate}T00:00:00.000Z`,
  `${endDate}T23:59:59.999Z`
 )

 const handlePeriodChange = (days: string) => {
  setPeriod(days)
  const end = new Date()
  const start = subDays(end, parseInt(days))
  setStartDate(format(start, 'yyyy-MM-dd'))
  setEndDate(format(end, 'yyyy-MM-dd'))
 }

 const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
   style: 'currency',
   currency: 'BRL'
  }).format(value)
 }

 const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd/MM', { locale: ptBR })
 }

 // Calcular estatísticas
 const stats = React.useMemo(() => {
  if (!cashFlowData || cashFlowData.length === 0) {
   return {
    totalIncome: 0,
    totalExpense: 0,
    netResult: 0,
    finalBalance: 0,
    averageDaily: 0,
    bestDay: null as CashFlowData | null,
    worstDay: null as CashFlowData | null
   }
  }

  const totalIncome = cashFlowData.reduce((sum, day) => sum + day.income, 0)
  const totalExpense = cashFlowData.reduce((sum, day) => sum + day.expense, 0)
  const netResult = totalIncome - totalExpense
  const finalBalance = cashFlowData[cashFlowData.length - 1]?.balance || 0
  const averageDaily = netResult / cashFlowData.length

  // Melhor e pior dia (baseado no resultado líquido diário)
  const dailyResults = cashFlowData.map(day => ({
   ...day,
   dailyResult: day.income - day.expense
  }))

  const bestDay = dailyResults.reduce((best, current) => 
   current.dailyResult > best.dailyResult ? current : best
  )

  const worstDay = dailyResults.reduce((worst, current) => 
   current.dailyResult < worst.dailyResult ? current : worst
  )

  return {
   totalIncome,
   totalExpense,
   netResult,
   finalBalance,
   averageDaily,
   bestDay,
   worstDay
  }
 }, [cashFlowData])

 // Preparar dados para o gráfico
 const chartData = React.useMemo(() => {
  if (!cashFlowData || !Array.isArray(cashFlowData)) return []

  const processedData = cashFlowData
   .filter(day => day && day.date) // Filtrar dados inválidos
   .map(day => {
    const income = Number(day.income) || 0
    const expense = Number(day.expense) || 0
    const balance = Number(day.balance) || 0
    
    return {
     date: formatDate(day.date),
     fullDate: day.date,
     receitas: income,
     despesas: expense,
     saldo: balance,
     resultado: income - expense
    }
   })
   .filter(item => item.date && !isNaN(item.receitas) && !isNaN(item.despesas)) // Filtrar NaN
  
  console.log('📊 Chart data processed:', processedData.length, 'entries')
  return processedData
 }, [cashFlowData])

 const CustomTooltip = React.useCallback(({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) {
   return null
  }

  const data = payload[0]?.payload
  if (!data) return null

  return (
   <div className="bg-card p-3 border rounded-lg shadow-lg">
    <p className="font-medium">{label}</p>
    <div className="space-y-1 mt-2">
     {payload.map((entry: any, index: number) => (
      <div key={index} className="flex items-center gap-2">
       <div 
        className="w-3 h-3 rounded-full" 
        
       />
       <span className="text-sm">
        {entry.name}: {formatCurrency(entry.value || 0)}
       </span>
      </div>
     ))}
    </div>
   </div>
  )
 }, [])

 if (isLoading) {
  return (
   <Card className={className}>
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <Activity className="h-5 w-5" />
      Fluxo de Caixa
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8  border-primary"></div>
     </div>
    </CardContent>
   </Card>
  )
 }

 if (error) {
  return (
   <Card className={className}>
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <Activity className="h-5 w-5" />
      Fluxo de Caixa
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="flex justify-center items-center h-64 ">
      <div className="text-center">
       <p>Erro ao carregar dados do fluxo de caixa</p>
       <p className="text-sm mt-2 text-muted-foreground">
        {error?.message || 'Erro desconhecido'}
       </p>
      </div>
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <div className={className}>
   {/* Controles */}
   <Card className="mb-6">
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <Activity className="h-5 w-5" />
      Fluxo de Caixa
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="flex flex-wrap items-end gap-4">
      {/* Período pré-definido */}
      <div className="space-y-2">
       <Label>Período</Label>
       <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-32">
         <SelectValue />
        </SelectTrigger>
        <SelectContent>
         <SelectItem value="7">7 dias</SelectItem>
         <SelectItem value="15">15 dias</SelectItem>
         <SelectItem value="30">30 dias</SelectItem>
         <SelectItem value="60">60 dias</SelectItem>
         <SelectItem value="90">90 dias</SelectItem>
        </SelectContent>
       </Select>
      </div>

      {/* Datas customizadas */}
      <div className="space-y-2">
       <Label>Data Inicial</Label>
       <Input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-40"
       />
      </div>

      <div className="space-y-2">
       <Label>Data Final</Label>
       <Input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-40"
       />
      </div>

      {/* Tipo de gráfico */}
      <div className="space-y-2">
       <Label>Tipo</Label>
       <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
        <SelectTrigger className="w-32">
         <SelectValue />
        </SelectTrigger>
        <SelectContent>
         <SelectItem value="line">Linha</SelectItem>
         <SelectItem value="bar">Barras</SelectItem>
         <SelectItem value="area">Área</SelectItem>
        </SelectContent>
       </Select>
      </div>
     </div>
    </CardContent>
   </Card>

   {/* Estatísticas */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <Card>
     <CardContent className="p-4">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-muted-foreground">Total Receitas</p>
        <p className="text-2xl font-bold ">
         {formatCurrency(stats.totalIncome)}
        </p>
       </div>
       <ArrowUpRight className="h-8 w-8 " />
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="p-4">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-muted-foreground">Total Despesas</p>
        <p className="text-2xl font-bold ">
         {formatCurrency(stats.totalExpense)}
        </p>
       </div>
       <ArrowDownRight className="h-8 w-8 " />
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="p-4">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-muted-foreground">Resultado</p>
        <p className={`text-2xl font-bold ${stats.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
         {formatCurrency(stats.netResult)}
        </p>
       </div>
       {stats.netResult >= 0 ? (
        <TrendingUp className="h-8 w-8 " />
       ) : (
        <TrendingDown className="h-8 w-8 " />
       )}
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="p-4">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-muted-foreground">Saldo Final</p>
        <p className={`text-2xl font-bold ${stats.finalBalance >= 0 ? 'text-primary' : 'text-red-600'}`}>
         {formatCurrency(stats.finalBalance)}
        </p>
       </div>
       <DollarSign className="h-8 w-8 text-primary" />
      </div>
     </CardContent>
    </Card>
   </div>

   {/* Gráfico */}
   <Card>
    <CardHeader>
     <div className="flex items-center justify-between">
      <CardTitle>Evolução Financeira</CardTitle>
      <div className="flex items-center gap-2">
       {stats.bestDay && (
        <Badge variant="secondary" className="">
         Melhor: {formatDate(stats.bestDay.date)} ({formatCurrency(stats.bestDay.income - stats.bestDay.expense)})
        </Badge>
       )}
       {stats.worstDay && (
        <Badge variant="secondary" className="">
         Pior: {formatDate(stats.worstDay.date)} ({formatCurrency(stats.worstDay.income - stats.worstDay.expense)})
        </Badge>
       )}
      </div>
     </div>
    </CardHeader>
    <CardContent>
     {!chartData || chartData.length === 0 ? (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
       <div className="text-center">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Carregando dados do fluxo de caixa...</p>
        <p className="text-sm">Ou nenhum dado encontrado para o período selecionado</p>
       </div>
      </div>
     ) : (
      <div >
       <ResponsiveContainer>
        {chartType === 'line' ? (
         <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip />
          <Legend />
          <Line 
           type="monotone" 
           dataKey="receitas" 
           stroke="#10b981" 
           strokeWidth={2}
           name="Receitas"
          />
          <Line 
           type="monotone" 
           dataKey="despesas" 
           stroke="#ef4444" 
           strokeWidth={2}
           name="Despesas"
          />
          <Line 
           type="monotone" 
           dataKey="saldo" 
           stroke="#3b82f6" 
           strokeWidth={3}
           name="Saldo Acumulado"
          />
         </LineChart>
        ) : chartType === 'bar' ? (
         <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip />
          <Legend />
          <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
          <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
         </BarChart>
        ) : (
         <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip />
          <Legend />
          <Area 
           type="monotone" 
           dataKey="receitas" 
           stackId="1"
           stroke="#10b981" 
           fill="#10b981"
           name="Receitas"
          />
          <Area 
           type="monotone" 
           dataKey="despesas" 
           stackId="2"
           stroke="#ef4444" 
           fill="#ef4444"
           name="Despesas"
          />
         </AreaChart>
        )}
       </ResponsiveContainer>
      </div>
     )}
    </CardContent>
   </Card>

   {/* Insights adicionais */}
   {stats.averageDaily !== 0 && (
    <Card className="mt-6">
     <CardHeader>
      <CardTitle>Insights</CardTitle>
     </CardHeader>
     <CardContent>
      <div className="space-y-2">
       <p className="text-sm text-muted-foreground">
        Resultado médio diário: <span className={`font-medium ${stats.averageDaily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
         {formatCurrency(stats.averageDaily)}
        </span>
       </p>
       
       {stats.netResult > 0 && (
        <p className="text-sm ">
         ✅ Período positivo! Suas receitas superaram as despesas.
        </p>
       )}
       
       {stats.netResult < 0 && (
        <p className="text-sm ">
         ⚠️ Período negativo. Considere revisar suas despesas.
        </p>
       )}

       {stats.totalIncome > 0 && (
        <p className="text-sm text-muted-foreground">
         Taxa de despesas: {((stats.totalExpense / stats.totalIncome) * 100).toFixed(1)}% das receitas
        </p>
       )}
      </div>
     </CardContent>
    </Card>
   )}
  </div>
 )
}
