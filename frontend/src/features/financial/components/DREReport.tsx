import React, { useState } from 'react'
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
 PieChart, 
 Pie, 
 Cell, 
 ResponsiveContainer, 
 BarChart, 
 Bar, 
 XAxis, 
 YAxis, 
 CartesianGrid, 
 Tooltip, 
 Legend 
} from 'recharts'
import { 
 FileText, 
 TrendingUp, 
 TrendingDown, 
 DollarSign, 
 Percent, 
 Download,
 Calendar,
 Target,
 AlertTriangle,
 CheckCircle
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import { Separator } from '../../../components/ui/separator'

import { useDRE } from '../../../hooks/useFinancial'
import type { DREReport as DREData } from '../../../services/financial'

interface DREReportProps {
 className?: string
}

export function DREReport({ className }: DREReportProps) {
 const [period, setPeriod] = useState('currentMonth')
 const [startDate, setStartDate] = useState(() => 
  format(startOfMonth(new Date()), 'yyyy-MM-dd')
 )
 const [endDate, setEndDate] = useState(() => 
  format(endOfMonth(new Date()), 'yyyy-MM-dd')
 )

 const { data: dreData, isLoading, error } = useDRE(
  `${startDate}T00:00:00.000Z`,
  `${endDate}T23:59:59.999Z`
 )

 const handlePeriodChange = (value: string) => {
  setPeriod(value)
  const now = new Date()

  switch (value) {
   case 'currentMonth':
    setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'))
    setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'))
    break
   case 'lastMonth':
    const lastMonth = subMonths(now, 1)
    setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'))
    setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'))
    break
   case 'last30Days':
    setStartDate(format(subDays(now, 30), 'yyyy-MM-dd'))
    setEndDate(format(now, 'yyyy-MM-dd'))
    break
   case 'last90Days':
    setStartDate(format(subDays(now, 90), 'yyyy-MM-dd'))
    setEndDate(format(now, 'yyyy-MM-dd'))
    break
   case 'currentYear':
    setStartDate(format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd'))
    setEndDate(format(new Date(now.getFullYear(), 11, 31), 'yyyy-MM-dd'))
    break
  }
 }

 const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
   style: 'currency',
   currency: 'BRL'
  }).format(value)
 }

 const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`
 }

 // Cores para os gráficos
 const REVENUE_COLORS = [
  '#10b981', '#059669', '#047857', '#065f46', '#064e3b',
  '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857'
 ]

 const EXPENSE_COLORS = [
  '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
  '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'
 ]

 const exportToPDF = () => {
  // Implementar exportação para PDF
  console.log('Export to PDF')
 }

 if (isLoading) {
  return (
   <Card className={className}>
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <FileText className="h-5 w-5" />
      DRE - Demonstrativo de Resultado
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
      <FileText className="h-5 w-5" />
      DRE - Demonstrativo de Resultado
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="flex justify-center items-center h-64 ">
      <div className="text-center">
       <p>Erro ao carregar dados do DRE</p>
       <p className="text-sm mt-2 text-muted-foreground">
        {error?.message || 'Erro desconhecido'}
       </p>
      </div>
     </div>
    </CardContent>
   </Card>
  )
 }

 if (!dreData) {
  return (
   <Card className={className}>
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <FileText className="h-5 w-5" />
      DRE - Demonstrativo de Resultado
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="flex justify-center items-center h-64 text-muted-foreground">
      Nenhum dado encontrado para o período selecionado
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
     <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
       <FileText className="h-5 w-5" />
       DRE - Demonstrativo de Resultado
      </CardTitle>
      <Button onClick={exportToPDF} variant="outline" size="sm">
       <Download className="h-4 w-4 mr-2" />
       Exportar PDF
      </Button>
     </div>
    </CardHeader>
    <CardContent>
     <div className="flex flex-wrap items-end gap-4">
      {/* Período pré-definido */}
      <div className="space-y-2">
       <Label>Período</Label>
       <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-40">
         <SelectValue />
        </SelectTrigger>
        <SelectContent>
         <SelectItem value="currentMonth">Mês Atual</SelectItem>
         <SelectItem value="lastMonth">Mês Anterior</SelectItem>
         <SelectItem value="last30Days">Últimos 30 dias</SelectItem>
         <SelectItem value="last90Days">Últimos 90 dias</SelectItem>
         <SelectItem value="currentYear">Ano Atual</SelectItem>
         <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
       </Select>
      </div>

      {period === 'custom' && (
       <>
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
       </>
      )}

      <div className="text-sm text-muted-foreground">
       Período: {format(new Date(dreData?.period.startDate || startDate), 'dd/MM/yyyy', { locale: ptBR })} até{' '}
       {format(new Date(dreData?.period.endDate || endDate), 'dd/MM/yyyy', { locale: ptBR })}
      </div>
     </div>
    </CardContent>
   </Card>

   {dreData && (
    <>
     {/* Resumo Executivo */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
       <CardContent className="p-6">
        <div className="flex items-center justify-between">
         <div>
          <p className="text-sm text-muted-foreground">Receita Total</p>
          <p className="text-3xl font-bold ">
           {formatCurrency(dreData.revenue.total)}
          </p>
         </div>
         <TrendingUp className="h-8 w-8 " />
        </div>
       </CardContent>
      </Card>

      <Card>
       <CardContent className="p-6">
        <div className="flex items-center justify-between">
         <div>
          <p className="text-sm text-muted-foreground">Despesa Total</p>
          <p className="text-3xl font-bold ">
           {formatCurrency(dreData.expenses.total)}
          </p>
         </div>
         <TrendingDown className="h-8 w-8 " />
        </div>
       </CardContent>
      </Card>

      <Card>
       <CardContent className="p-6">
        <div className="flex items-center justify-between">
         <div>
          <p className="text-sm text-muted-foreground">Resultado Líquido</p>
          <p className={`text-3xl font-bold ${dreData.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
           {formatCurrency(dreData.netResult)}
          </p>
          <p className="text-sm text-muted-foreground">
           Margem: {formatPercentage(dreData.netMargin)}
          </p>
         </div>
         <div className="flex flex-col items-center">
          {dreData.netResult >= 0 ? (
           <CheckCircle className="h-8 w-8 " />
          ) : (
           <AlertTriangle className="h-8 w-8 " />
          )}
          <Badge 
           variant={dreData.netResult >= 0 ? "default" : "destructive"}
           className="mt-1"
          >
           {dreData.netResult >= 0 ? 'Lucro' : 'Prejuízo'}
          </Badge>
         </div>
        </div>
       </CardContent>
      </Card>
     </div>

     {/* Análise Detalhada */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Receitas por Categoria */}
      <Card>
       <CardHeader>
        <CardTitle className="text-lg">Receitas por Categoria</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="space-y-4">
         {dreData.revenue.byCategory.map((category, index) => (
          <div key={category.category} className="space-y-2">
           <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{category.category}</span>
            <div className="text-right">
             <div className="font-medium ">
              {formatCurrency(category.amount)}
             </div>
             <div className="text-xs text-muted-foreground">
              {formatPercentage(category.percentage)}
             </div>
            </div>
           </div>
           <Progress 
            value={category.percentage} 
            className="h-2"
            style={{
             background: `linear-gradient(to right, ${REVENUE_COLORS[index % REVENUE_COLORS.length]} 0%, ${REVENUE_COLORS[index % REVENUE_COLORS.length]} ${category.percentage}%, #f1f5f9 ${category.percentage}%, #f1f5f9 100%)`
            }}
           />
          </div>
         ))}
        </div>

        {/* Gráfico de Pizza - Receitas */}
        <div className="mt-6" >
         <ResponsiveContainer>
          <PieChart>
           <Pie
            data={dreData.revenue.byCategory}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="amount"
            nameKey="category"
           >
            {dreData.revenue.byCategory.map((entry, index) => (
             <Cell 
              key={`revenue-${index}`} 
              fill={REVENUE_COLORS[index % REVENUE_COLORS.length]} 
             />
            ))}
           </Pie>
           <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
         </ResponsiveContainer>
        </div>
       </CardContent>
      </Card>

      {/* Despesas por Categoria */}
      <Card>
       <CardHeader>
        <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="space-y-4">
         {dreData.expenses.byCategory.map((category, index) => (
          <div key={category.category} className="space-y-2">
           <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{category.category}</span>
            <div className="text-right">
             <div className="font-medium ">
              {formatCurrency(category.amount)}
             </div>
             <div className="text-xs text-muted-foreground">
              {formatPercentage(category.percentage)}
             </div>
            </div>
           </div>
           <Progress 
            value={category.percentage} 
            className="h-2"
            style={{
             background: `linear-gradient(to right, ${EXPENSE_COLORS[index % EXPENSE_COLORS.length]} 0%, ${EXPENSE_COLORS[index % EXPENSE_COLORS.length]} ${category.percentage}%, #f1f5f9 ${category.percentage}%, #f1f5f9 100%)`
            }}
           />
          </div>
         ))}
        </div>

        {/* Gráfico de Pizza - Despesas */}
        <div className="mt-6" >
         <ResponsiveContainer>
          <PieChart>
           <Pie
            data={dreData.expenses.byCategory}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="amount"
            nameKey="category"
           >
            {dreData.expenses.byCategory.map((entry, index) => (
             <Cell 
              key={`expense-${index}`} 
              fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} 
             />
            ))}
           </Pie>
           <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
         </ResponsiveContainer>
        </div>
       </CardContent>
      </Card>
     </div>

     {/* Comparativo */}
     <Card className="mb-6">
      <CardHeader>
       <CardTitle>Comparativo Receitas vs Despesas</CardTitle>
      </CardHeader>
      <CardContent>
       <div >
        <ResponsiveContainer>
         <BarChart
          data={[
           ...dreData.revenue.byCategory.map(cat => ({
            category: cat.category,
            receitas: cat.amount,
            despesas: 0,
            type: 'receita'
           })),
           ...dreData.expenses.byCategory.map(cat => ({
            category: cat.category,
            receitas: 0,
            despesas: cat.amount,
            type: 'despesa'
           }))
          ]}
         >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
          <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
         </BarChart>
        </ResponsiveContainer>
       </div>
      </CardContent>
     </Card>

     {/* Indicadores Financeiros */}
     <Card>
      <CardHeader>
       <CardTitle>Indicadores Financeiros</CardTitle>
      </CardHeader>
      <CardContent>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-4 border rounded-lg">
         <Percent className="h-8 w-8 mx-auto mb-2 text-primary" />
         <p className="text-sm text-muted-foreground">Margem Líquida</p>
         <p className={`text-xl font-bold ${dreData.netMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatPercentage(dreData.netMargin)}
         </p>
        </div>

        <div className="text-center p-4 border rounded-lg">
         <Target className="h-8 w-8 mx-auto mb-2 " />
         <p className="text-sm text-muted-foreground">Eficiência Operacional</p>
         <p className="text-xl font-bold text-primary">
          {dreData.revenue.total > 0 ? 
           formatPercentage((dreData.expenses.total / dreData.revenue.total) * 100) : 
           '0%'
          }
         </p>
        </div>

        <div className="text-center p-4 border rounded-lg">
         <DollarSign className="h-8 w-8 mx-auto mb-2 " />
         <p className="text-sm text-muted-foreground">ROI</p>
         <p className={`text-xl font-bold ${dreData.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {dreData.expenses.total > 0 ? 
           formatPercentage((dreData.netResult / dreData.expenses.total) * 100) : 
           '∞'
          }
         </p>
        </div>

        <div className="text-center p-4 border rounded-lg">
         <Calendar className="h-8 w-8 mx-auto mb-2 " />
         <p className="text-sm text-muted-foreground">Break-even</p>
         <p className="text-xl font-bold ">
          {dreData.netResult >= 0 ? 'Atingido' : 'Não atingido'}
         </p>
        </div>
       </div>

       <Separator className="my-6" />

       {/* Insights */}
       <div className="space-y-3">
        <h4 className="font-medium">Insights e Recomendações:</h4>
        
        {dreData.netResult >= 0 ? (
         <div className="flex items-start gap-2 text-green-700  p-3 rounded-lg">
          <CheckCircle className="h-5 w-5 mt-0.5" />
          <div>
           <p className="font-medium">Resultado Positivo!</p>
           <p className="text-sm">
            Sua operação está gerando lucro. Considere investir em expansão ou reservas.
           </p>
          </div>
         </div>
        ) : (
         <div className="flex items-start gap-2 text-red-700  p-3 rounded-lg">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div>
           <p className="font-medium">Atenção: Resultado Negativo</p>
           <p className="text-sm">
            Revise suas despesas e busque maneiras de aumentar a receita.
           </p>
          </div>
         </div>
        )}

        {dreData.expenses.total > 0 && (dreData.expenses.total / dreData.revenue.total) > 0.8 && (
         <div className="flex items-start gap-2 text-yellow-700  p-3 rounded-lg">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div>
           <p className="font-medium">Alta Taxa de Despesas</p>
           <p className="text-sm">
            Suas despesas representam mais de 80% da receita. Considere otimizar custos.
           </p>
          </div>
         </div>
        )}

        {dreData.netMargin > 20 && (
         <div className="flex items-start gap-2 text-primary  p-3 rounded-lg">
          <CheckCircle className="h-5 w-5 mt-0.5" />
          <div>
           <p className="font-medium">Excelente Margem</p>
           <p className="text-sm">
            Margem líquida acima de 20% é considerada excelente para o setor.
           </p>
          </div>
         </div>
        )}
       </div>
      </CardContent>
     </Card>
    </>
   )}
  </div>
 )
}
