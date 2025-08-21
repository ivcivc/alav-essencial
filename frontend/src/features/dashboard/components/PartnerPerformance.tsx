import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Users, Award, DollarSign } from 'lucide-react'

interface PartnerPerformanceProps {
  topPartners?: Array<{
    partnerId: string
    partnerName: string
    totalRevenue: number
    appointmentCount: number
    averageTicket: number
  }>
  partnersByType?: Array<{
    type: string
    count: number
    percentage: number
  }>
  isLoading?: boolean
}

const PARTNERSHIP_TYPE_LABELS = {
  SUBLEASE: 'Sublocação',
  PERCENTAGE: 'Porcentagem',
  PERCENTAGE_WITH_PRODUCTS: 'Porcentagem c/ Produtos'
}

const PARTNERSHIP_TYPE_COLORS = {
  SUBLEASE: 'bg-blue-500',
  PERCENTAGE: 'bg-green-500',
  PERCENTAGE_WITH_PRODUCTS: 'bg-purple-500'
}

export function PartnerPerformance({ topPartners, partnersByType, isLoading }: PartnerPerformanceProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Parceiros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Parceria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Top Parceiros por Receita
          </CardTitle>
          <CardDescription>
            Parceiros com melhor performance no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPartners?.slice(0, 5).map((partner, index) => (
              <div key={partner.partnerId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium leading-none">
                      {partner.partnerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {partner.appointmentCount} agendamentos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {formatCurrency(partner.totalRevenue)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ticket: {formatCurrency(partner.averageTicket)}
                  </p>
                </div>
              </div>
            ))}
            
            {(!topPartners || topPartners.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum parceiro com receita no período
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Distribuição por Tipo de Parceria
          </CardTitle>
          <CardDescription>
            Tipos de parceria ativa na clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partnersByType?.map((type) => (
              <div key={type.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`h-3 w-3 rounded-full ${
                        PARTNERSHIP_TYPE_COLORS[type.type as keyof typeof PARTNERSHIP_TYPE_COLORS] || 'bg-gray-500'
                      }`} 
                    />
                    <span className="font-medium">
                      {PARTNERSHIP_TYPE_LABELS[type.type as keyof typeof PARTNERSHIP_TYPE_LABELS] || type.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {type.count}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {type.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={type.percentage} className="h-2" />
              </div>
            ))}
            
            {(!partnersByType || partnersByType.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum tipo de parceria encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
