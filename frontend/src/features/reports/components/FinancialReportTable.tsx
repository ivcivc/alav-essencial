import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon, ClockIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { FinancialReport } from '../../../services/reports'

interface FinancialReportTableProps {
 data: FinancialReport
}

export function FinancialReportTable({ data }: FinancialReportTableProps) {
 // Função para traduzir categorias
 const translateCategory = (category: string) => {
  const categoryMap: Record<string, string> = {
   // Categorias em inglês
   'CONSULTATION': 'Consulta',
   'PARTNER_COMMISSION': 'Comissão de Parceiro',
   'Pessoal': 'Pessoal',
   'Infraestrutura': 'Infraestrutura',
   'Outras Receitas': 'Outras Receitas',
   'Serviços': 'Serviços',
   'Convênios': 'Convênios',
   'Impostos e Taxas': 'Impostos e Taxas',
   'Operacional': 'Operacional',
   'Procedimentos': 'Procedimentos',
   'Consultas': 'Consultas',
   'Financeiro': 'Financeiro',
   'Outras Despesas': 'Outras Despesas',
   'Exames': 'Exames',
   // Variações em minúscula
   'consultation': 'Consulta',
   'partner_commission': 'Comissão de Parceiro',
   'pessoal': 'Pessoal',
   'infraestrutura': 'Infraestrutura',
   'outras receitas': 'Outras Receitas',
   'serviços': 'Serviços',
   'convênios': 'Convênios',
   'impostos e taxas': 'Impostos e Taxas',
   'operacional': 'Operacional',
   'procedimentos': 'Procedimentos',
   'consultas': 'Consultas',
   'financeiro': 'Financeiro',
   'outras despesas': 'Outras Despesas',
   'exames': 'Exames',
  }
  
  return categoryMap[category] || category
 }

 const translateStatus = (status: string) => {
  const statusMap: Record<string, string> = {
   'PENDING': 'Pendente',
   'PAID': 'Pago',
   'OVERDUE': 'Vencido',
   'CANCELLED': 'Cancelado',
   'PARTIAL': 'Parcial',
   'pending': 'Pendente',
   'paid': 'Pago',
   'overdue': 'Vencido',
   'cancelled': 'Cancelado',
   'Pendente': 'Pendente',
   'Pago': 'Pago',
   'Vencido': 'Vencido',
   'Cancelado': 'Cancelado',
   'Parcial': 'Parcial',
  }
  return statusMap[status] || status
 }

 const translateType = (type: string) => {
  const typeMap: Record<string, string> = {
   'INCOME': 'Receita',
   'EXPENSE': 'Despesa',
   'income': 'Receita',
   'expense': 'Despesa',
   'Receita': 'Receita',
   'Despesa': 'Despesa',
  }
  return typeMap[type] || type
 }

 const getStatusBadge = (status: string) => {
  const statusColors = {
   'PENDING': { bg: '#fd7e14', color: 'white' },
   'PAID': { bg: '#28a745', color: 'white' },
   'OVERDUE': { bg: '#dc3545', color: 'white' },
   'CANCELLED': { bg: '#6c757d', color: 'white' },
   'PARTIAL': { bg: '#17a2b8', color: 'white' }
  }
  
  const color = statusColors[status as keyof typeof statusColors] || { bg: '#6c757d', color: 'white' }
  
  return (
   <Badge >
    {translateStatus(status)}
   </Badge>
  )
 }

 const getTypeBadge = (type: string) => {
  const typeColors = {
   'INCOME': { bg: '#28a745', color: 'white' },
   'EXPENSE': { bg: '#dc3545', color: 'white' }
  }
  
  const color = typeColors[type as keyof typeof typeColors] || { bg: '#6c757d', color: 'white' }
  
  return (
   <Badge >
    {translateType(type)}
   </Badge>
  )
 }

 return (
  <div className="space-y-6">
   {/* Métricas Resumo */}
   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Receitas</CardTitle>
      <TrendingUpIcon className="h-4 w-4 " />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold ">
       {new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
       }).format(data.totalIncome)}
      </div>
      <p className="text-xs text-muted-foreground">
       Total de entradas no período
      </p>
     </CardContent>
    </Card>

    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Despesas</CardTitle>
      <TrendingDownIcon className="h-4 w-4 " />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold ">
       {new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
       }).format(data.totalExpenses)}
      </div>
      <p className="text-xs text-muted-foreground">
       Total de saídas no período
      </p>
     </CardContent>
    </Card>

    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
      <DollarSignIcon className={`h-4 w-4 ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
     </CardHeader>
     <CardContent>
      <div className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
       {new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
       }).format(data.netProfit)}
      </div>
      <p className="text-xs text-muted-foreground">
       Receitas - Despesas
      </p>
     </CardContent>
    </Card>

    <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Pendente</CardTitle>
      <ClockIcon className="h-4 w-4 " />
     </CardHeader>
     <CardContent>
      <div className="text-2xl font-bold ">
       {new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
       }).format(data.totalPending)}
      </div>
      <p className="text-xs text-muted-foreground">
       Valores a receber/pagar
      </p>
     </CardContent>
    </Card>
   </div>

   {/* Resumos por Categoria */}
   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <Card>
     <CardHeader>
      <CardTitle className="text-lg">Por Categoria</CardTitle>
      <CardDescription>Distribuição por categoria</CardDescription>
     </CardHeader>
     <CardContent className="space-y-2">
      {Object.entries(data.groupedByCategory)
       .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
       .slice(0, 8)
       .map(([category, amount]) => (
        <div key={category} className="flex items-center justify-between">
         <span className="text-sm truncate capitalize">{category}</span>
         <span className={`font-medium ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {new Intl.NumberFormat('pt-BR', {
           style: 'currency',
           currency: 'BRL'
          }).format(Math.abs(amount))}
         </span>
        </div>
       ))}
     </CardContent>
    </Card>

    <Card>
     <CardHeader>
      <CardTitle className="text-lg">Por Conta</CardTitle>
      <CardDescription>Movimentação por conta bancária</CardDescription>
     </CardHeader>
     <CardContent className="space-y-2">
      {Object.entries(data.groupedByAccount)
       .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
       .map(([account, amount]) => (
        <div key={account} className="flex items-center justify-between">
         <span className="text-sm truncate">{account}</span>
         <span className={`font-medium ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {new Intl.NumberFormat('pt-BR', {
           style: 'currency',
           currency: 'BRL'
          }).format(Math.abs(amount))}
         </span>
        </div>
       ))}
     </CardContent>
    </Card>

    <Card>
     <CardHeader>
      <CardTitle className="text-lg">Fluxo de Caixa</CardTitle>
      <CardDescription>Últimos 5 dias com movimentação</CardDescription>
     </CardHeader>
     <CardContent className="space-y-2">
      {data.cashFlow
       .slice(-5)
       .map((flow) => (
        <div key={flow.date} className="space-y-1">
         <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
           {format(new Date(flow.date), 'dd/MM', { locale: ptBR })}
          </span>
          <span className={`font-medium ${flow.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
           {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
           }).format(flow.balance)}
          </span>
         </div>
         <div className="text-xs text-muted-foreground flex justify-between">
          <span className="">+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(flow.income)}</span>
          <span className="">-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(flow.expenses)}</span>
         </div>
        </div>
       ))}
     </CardContent>
    </Card>
   </div>

   {/* Tabela Detalhada */}
   <Card>
    <CardHeader>
     <CardTitle>Lançamentos Detalhados</CardTitle>
     <CardDescription>Lista completa dos lançamentos financeiros do período</CardDescription>
    </CardHeader>
    <CardContent>
     <Table>
      <TableHeader>
       <TableRow>
        <TableHead>Data</TableHead>
        <TableHead>Descrição</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Categoria</TableHead>
        <TableHead>Conta</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Valor</TableHead>
       </TableRow>
      </TableHeader>
      <TableBody>
       {data.entries.map((entry) => {
        const statusInfo = getStatusBadge(entry.status)
        const typeInfo = getTypeBadge(entry.type)
        
        return (
         <TableRow key={entry.id}>
          <TableCell>
           <div className="flex flex-col">
            <span className="font-medium">
             {format(new Date(entry.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
            {entry.paidDate && (
             <span className="text-sm text-muted-foreground">
              Pago: {format(new Date(entry.paidDate), 'dd/MM/yyyy', { locale: ptBR })}
             </span>
            )}
           </div>
          </TableCell>
          <TableCell>
           <div className="flex flex-col">
            <span className="font-medium">{entry.description}</span>
            {entry.notes && (
             <span className="text-sm text-muted-foreground">{entry.notes}</span>
            )}
           </div>
          </TableCell>
          <TableCell>
           {typeInfo}
          </TableCell>
          <TableCell>
           <span className="text-sm capitalize">{translateCategory(entry.category || '-')}</span>
          </TableCell>
          <TableCell>
           <span className="text-sm">{entry.bankAccount?.name || '-'}</span>
          </TableCell>
          <TableCell>
           {statusInfo}
          </TableCell>
          <TableCell className="text-right">
           <span className={`font-medium ${entry.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
            {entry.type === 'INCOME' ? '+' : '-'}
            {new Intl.NumberFormat('pt-BR', {
             style: 'currency',
             currency: 'BRL'
            }).format(entry.amount)}
           </span>
          </TableCell>
         </TableRow>
        )
       })}
      </TableBody>
     </Table>
     
     {data.entries.length === 0 && (
      <div className="text-center py-8 text-muted-foreground">
       Nenhum lançamento financeiro encontrado para o período selecionado
      </div>
     )}
    </CardContent>
   </Card>
  </div>
 )
}
