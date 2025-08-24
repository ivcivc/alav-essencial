import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Progress } from '../../../components/ui/progress'
import { UsersIcon, DollarSignIcon, TrendingUpIcon, ClockIcon, StarIcon } from 'lucide-react'
import type { PartnerReport } from '../../../services/reports'

interface PartnerReportTableProps {
 data: PartnerReport
}

export function PartnerReportTable({ data }: PartnerReportTableProps) {
 const getPartnershipTypeBadge = (type: string) => {
  const typeMap = {
   SUBLEASE: { label: 'Sublocação', variant: 'default' as const },
   PERCENTAGE: { label: 'Porcentagem', variant: 'secondary' as const },
   PERCENTAGE_WITH_PRODUCTS: { label: 'Porcentagem + Produtos', variant: 'outline' as const },
  }
  
  return typeMap[type as keyof typeof typeMap] || { label: type, variant: 'secondary' as const }
 }

 const getPerformanceColor = (rate: number) => {
  if (rate >= 90) return 'text-green-600'
  if (rate >= 70) return 'text-yellow-600'
  return 'text-red-600'
 }

 const topPerformer = data.performanceMetrics.topPerformer

 return (
  <div className="space-y-6">
   {/* Métricas Resumo */}
   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Total de Parceiros</CardTitle>
      <UsersIcon className="h-4 w-4 text-primary" />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold">{data.totalPartners}</div>
      <p className="text-xs text-muted-foreground">
       {data.activePartners} ativos
      </p>
     </CardContent>
    </Card>

    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
      <DollarSignIcon className="h-4 w-4 text-primary" />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold">
       {new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
       }).format(data.totalRevenue)}
      </div>
      <p className="text-xs text-muted-foreground">
       Receita de todos os parceiros
      </p>
     </CardContent>
    </Card>

    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
      <TrendingUpIcon className="h-4 w-4 text-primary" />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold">{data.totalAppointments}</div>
      <p className="text-xs text-muted-foreground">
       Média: {data.performanceMetrics.averageAppointmentsPerPartner.toFixed(1)} por parceiro
      </p>
     </CardContent>
    </Card>

    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Taxa Média</CardTitle>
      <ClockIcon className="h-4 w-4 text-primary" />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold">
       {data.performanceMetrics.averageCompletionRate.toFixed(1)}%
      </div>
      <p className="text-xs text-muted-foreground">
       Taxa de conclusão média
      </p>
     </CardContent>
    </Card>
   </div>

   {/* Top Performer e Resumos */}
   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {topPerformer && (
     <Card>
      <CardHeader>
       <CardTitle className="text-lg flex items-center gap-2">
        <StarIcon className="h-5 w-5 text-primary" />
        Top Performer
       </CardTitle>
       <CardDescription>Parceiro com maior receita no período</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
       <div>
        <div className="font-medium">{topPerformer.name}</div>
        <Badge variant="outline">{getPartnershipTypeBadge(topPerformer.partnershipType).label}</Badge>
       </div>
       <div className="space-y-2">
        <div className="flex justify-between text-sm">
         <span>Receita:</span>
         <span className="font-medium ">
          {new Intl.NumberFormat('pt-BR', {
           style: 'currency',
           currency: 'BRL'
          }).format(topPerformer.revenue)}
         </span>
        </div>
        <div className="flex justify-between text-sm">
         <span>Agendamentos:</span>
         <span className="font-medium">{topPerformer.appointmentsCount}</span>
        </div>
        <div className="flex justify-between text-sm">
         <span>Taxa de Conclusão:</span>
         <span className={`font-medium ${getPerformanceColor(topPerformer.completionRate)}`}>
          {topPerformer.completionRate.toFixed(1)}%
         </span>
        </div>
       </div>
      </CardContent>
     </Card>
    )}

    <Card>
     <CardHeader>
      <CardTitle className="text-lg">Por Tipo de Parceria</CardTitle>
      <CardDescription>Distribuição por tipo</CardDescription>
     </CardHeader>
     <CardContent className="space-y-2">
      {Object.entries(data.groupedByType).map(([type, count]) => {
       const typeInfo = getPartnershipTypeBadge(type)
       return (
        <div key={type} className="flex items-center justify-between">
         <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
         <span className="font-medium">{count}</span>
        </div>
       )
      })}
     </CardContent>
    </Card>

    <Card>
     <CardHeader>
      <CardTitle className="text-lg">Métricas Gerais</CardTitle>
      <CardDescription>Performance geral dos parceiros</CardDescription>
     </CardHeader>
     <CardContent className="space-y-3">
      <div className="space-y-1">
       <div className="flex justify-between text-sm">
        <span>Receita Média:</span>
        <span className="font-medium">
         {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
         }).format(data.performanceMetrics.averageRevenuePerPartner)}
        </span>
       </div>
      </div>
      <div className="space-y-1">
       <div className="flex justify-between text-sm">
        <span>Agendamentos Médios:</span>
        <span className="font-medium">{data.performanceMetrics.averageAppointmentsPerPartner.toFixed(1)}</span>
       </div>
      </div>
      <div className="space-y-1">
       <div className="flex justify-between text-sm">
        <span>Taxa Média:</span>
        <span className={`font-medium ${getPerformanceColor(data.performanceMetrics.averageCompletionRate)}`}>
         {data.performanceMetrics.averageCompletionRate.toFixed(1)}%
        </span>
       </div>
       <Progress value={data.performanceMetrics.averageCompletionRate} className="h-2" />
      </div>
     </CardContent>
    </Card>
   </div>

   {/* Tabela Detalhada */}
   <Card>
    <CardHeader>
     <CardTitle>Performance Detalhada dos Parceiros</CardTitle>
     <CardDescription>Métricas individuais de cada parceiro</CardDescription>
    </CardHeader>
    <CardContent>
     <Table>
      <TableHeader>
       <TableRow>
        <TableHead>Parceiro</TableHead>
        <TableHead>Tipo de Parceria</TableHead>
        <TableHead className="text-center">Agendamentos</TableHead>
        <TableHead className="text-right">Receita</TableHead>
        <TableHead className="text-right">Comissão</TableHead>
        <TableHead className="text-center">Tempo Médio</TableHead>
        <TableHead className="text-center">Taxa de Conclusão</TableHead>
       </TableRow>
      </TableHeader>
      <TableBody>
       {data.partners
        .sort((a, b) => b.revenue - a.revenue)
        .map((partner) => {
         const typeInfo = getPartnershipTypeBadge(partner.partnershipType)
         
         return (
          <TableRow key={partner.id}>
           <TableCell>
            <div className="font-medium">{partner.name}</div>
           </TableCell>
           <TableCell>
            <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
           </TableCell>
           <TableCell className="text-center">
            <span className="font-medium">{partner.appointmentsCount}</span>
           </TableCell>
           <TableCell className="text-right">
            <span className="font-medium ">
             {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
             }).format(partner.revenue)}
            </span>
           </TableCell>
           <TableCell className="text-right">
            <span className="font-medium">
             {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
             }).format(partner.commission)}
            </span>
           </TableCell>
           <TableCell className="text-center">
            <span className="text-sm">
             {Math.round(partner.averageServiceTime)}min
            </span>
           </TableCell>
           <TableCell className="text-center">
            <div className="flex items-center justify-center space-x-2">
             <span className={`font-medium ${getPerformanceColor(partner.completionRate)}`}>
              {partner.completionRate.toFixed(1)}%
             </span>
            </div>
            <Progress value={partner.completionRate} className="h-1 mt-1" />
           </TableCell>
          </TableRow>
         )
        })}
      </TableBody>
     </Table>
     
     {data.partners.length === 0 && (
      <div className="text-center py-8 text-muted-foreground">
       Nenhum parceiro encontrado para o período selecionado
      </div>
     )}
    </CardContent>
   </Card>
  </div>
 )
}
