import React from 'react'
import { format, subDays, subMonths, subYears } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'

interface ComparisonData {
 current: number
 previous: number
 label: string
}

interface PeriodComparisonProps {
 data: ComparisonData[]
 isLoading?: boolean
 className?: string
}

export function PeriodComparison({ data, isLoading, className }: PeriodComparisonProps) {
 const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
 }

 const formatChange = (change: number) => {
  const absChange = Math.abs(change)
  return `${change >= 0 ? '+' : '-'}${absChange.toFixed(1)}%`
 }

 const getTrendIcon = (change: number) => {
  if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600 dark:" />
  if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600 dark:" />
  return <Minus className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
 }

 const getTrendColor = (change: number) => {
  if (change > 0) return 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800'
  if (change < 0) return 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800'
  return 'text-muted-foreground bg-muted border-border'
 }

 if (isLoading) {
  return (
   <Card className={className}>
    <CardHeader>
     <CardTitle className="text-lg">Comparação com Período Anterior</CardTitle>
    </CardHeader>
    <CardContent>
     <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
       <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg animate-pulse">
        <div className="h-4 bg-muted-foreground rounded w-1/3"></div>
        <div className="h-6 bg-muted-foreground rounded w-16"></div>
       </div>
      ))}
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <Card className={className}>
   <CardHeader>
    <CardTitle className="text-lg">Comparação com Período Anterior</CardTitle>
   </CardHeader>
   <CardContent>
    <div className="space-y-4">
     {data.map((item, index) => {
      const change = calculateChange(item.current, item.previous)
      return (
       <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg">
        <div className="flex-1">
         <p className="font-medium text-sm">{item.label}</p>
                   <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>Atual: {item.current.toLocaleString('pt-BR')}</span>
          <span>•</span>
          <span>Anterior: {item.previous.toLocaleString('pt-BR')}</span>
         </div>
        </div>
        
        <Badge 
         variant="outline" 
         className={`flex items-center gap-1 ${getTrendColor(change)}`}
        >
         {getTrendIcon(change)}
         {formatChange(change)}
        </Badge>
       </div>
      )
     })}
    </div>
   </CardContent>
  </Card>
 )
}

// Hook para calcular dados de comparação
export function useComparisonData(currentPeriod: { startDate: string; endDate: string }) {
 const calculatePreviousPeriod = () => {
  const start = new Date(currentPeriod.startDate)
  const end = new Date(currentPeriod.endDate)
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  const previousStart = subDays(start, diffDays + 1)
  const previousEnd = subDays(end, diffDays + 1)
  
  return {
   startDate: format(previousStart, 'yyyy-MM-dd'),
   endDate: format(previousEnd, 'yyyy-MM-dd')
  }
 }

 return {
  previousPeriod: calculatePreviousPeriod()
 }
}
