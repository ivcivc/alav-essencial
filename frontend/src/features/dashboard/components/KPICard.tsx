import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    isPositive?: boolean
    label?: string
  }
  icon?: React.ReactNode
  className?: string
  isLoading?: boolean
  format?: 'number' | 'currency' | 'percentage'
}

export function KPICard({
  title,
  value,
  description,
  trend,
  icon,
  className,
  isLoading = false,
  format = 'number'
}: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (isLoading) return '...'
    
    const numValue = typeof val === 'string' ? parseFloat(val) : val
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(numValue)
      case 'percentage':
        return `${numValue.toFixed(1)}%`
      default:
        return new Intl.NumberFormat('pt-BR').format(numValue)
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null
    
    if (trend.value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (trend.value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground'
    
    if (trend.isPositive === undefined) {
      return trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-500'
    }
    
    return trend.isPositive ? 'text-green-600' : 'text-red-600'
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(value)}
        </div>
        {(description || trend) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {trend && getTrendIcon()}
            <span className={getTrendColor()}>
              {trend && (
                <>
                  {trend.value > 0 ? '+' : ''}{trend.value}
                  {trend.label && ` ${trend.label}`}
                </>
              )}
              {trend && description && ' • '}
              {description}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
