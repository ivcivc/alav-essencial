import React, { useState } from 'react'
import { 
 DollarSign, 
 TrendingUp, 
 TrendingDown, 
 CreditCard, 
 Wallet, 
 FileText, 
 BarChart3, 
 PlusCircle,
 Settings,
 Download,
 RefreshCw
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { BankIcon } from '../../components/ui/bank-icon'

import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'

import { 
 useTotalBalance,
 useAccountsSummary,
 useOverdueEntries,
 useBankAccounts 
} from '../../hooks/useFinancial'
import { CashFlowChart } from './components/CashFlowChart'
import { DREReport } from './components/DREReport'
import { AccountsDashboard } from './components/AccountsDashboard'
import { FinancialEntryForm } from './components/FinancialEntryForm'

export default function FinancialPage() {
 const [activeTab, setActiveTab] = useState('overview')
 const [showNewEntryModal, setShowNewEntryModal] = useState(false)

 // Queries
 const { data: totalBalance, isLoading: balanceLoading } = useTotalBalance()
 const { data: summary, isLoading: summaryLoading } = useAccountsSummary()
 const { data: overdueEntries } = useOverdueEntries()
 const { data: bankAccounts, isLoading: bankAccountsLoading } = useBankAccounts({ active: true })

 const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
   style: 'currency',
   currency: 'BRL'
  }).format(value)
 }

 const isLoading = balanceLoading || summaryLoading

 return (
  <div className="container mx-auto p-6 space-y-6">
   {/* Header */}
   <div className="flex justify-between items-center">
    <div>
     <h1 className="text-3xl font-bold">Gestão Financeira</h1>
     <p className="text-muted-foreground">
      Controle completo das finanças da clínica
     </p>
    </div>
    
    <div className="flex items-center gap-3">
     <Dialog open={showNewEntryModal} onOpenChange={setShowNewEntryModal}>
      <DialogTrigger asChild>
       <Button>
        <PlusCircle className="h-4 w-4 mr-2" />
        Novo Lançamento
       </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
       <DialogHeader>
        <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
       </DialogHeader>
       <FinancialEntryForm
        onSuccess={() => setShowNewEntryModal(false)}
        onCancel={() => setShowNewEntryModal(false)}
       />
      </DialogContent>
     </Dialog>
     
     <Button variant="outline" size="sm">
      <Settings className="h-4 w-4" />
     </Button>
    </div>
   </div>

   {/* Cards de Resumo */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card>
     <CardContent className="p-6">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-muted-foreground">Saldo Total</p>
        {isLoading ? (
         <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        ) : (
         <p className="text-2xl font-bold text-primary">
          {formatCurrency(totalBalance?.totalBalance || 0)}
         </p>
        )}
       </div>
       <Wallet className="h-8 w-8 text-primary" />
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="p-6">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-muted-foreground">A Receber</p>
        {isLoading ? (
         <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        ) : (
         <p className="text-2xl font-bold ">
          {formatCurrency(summary?.totalReceivable || 0)}
         </p>
        )}
        {summary && summary.overdueReceivable > 0 && (
         <p className="text-xs ">
          {formatCurrency(summary.overdueReceivable)} vencidos
         </p>
        )}
       </div>
       <TrendingUp className="h-8 w-8 text-primary" />
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="p-6">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-muted-foreground">A Pagar</p>
        {isLoading ? (
         <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        ) : (
         <p className="text-2xl font-bold ">
          {formatCurrency(summary?.totalPayable || 0)}
         </p>
        )}
        {summary && summary.overduePayable > 0 && (
         <p className="text-xs ">
          {formatCurrency(summary.overduePayable)} vencidos
         </p>
        )}
       </div>
       <TrendingDown className="h-8 w-8 text-primary" />
      </div>
     </CardContent>
    </Card>

    <Card className="contas-bancarias-card">
     <CardContent className="p-6">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-muted-foreground">Contas Bancárias</p>
        <p className="text-2xl font-bold ">
         {bankAccountsLoading ? '...' : (bankAccounts?.data?.length || 0)}
        </p>
        <p className="text-xs text-muted-foreground">
         {bankAccountsLoading ? '...' : (bankAccounts?.data?.filter(acc => acc.active).length || 0)} ativas
        </p>
       </div>
       <BankIcon />
      </div>
     </CardContent>
    </Card>
   </div>

   {/* Alertas e Pendências */}
   {overdueEntries && overdueEntries.length > 0 && (
    <Card className="border-red-200 ">
     <CardHeader>
      <CardTitle className=" flex items-center gap-2">
       <TrendingDown className="h-5 w-5" />
       Atenção: Contas Vencidas
      </CardTitle>
     </CardHeader>
     <CardContent>
      <div className="space-y-2">
       <p className="">
        Você tem {overdueEntries.length} contas vencidas totalizando{' '}
        <span className="font-bold">
         {formatCurrency(
          overdueEntries.reduce((sum, entry) => sum + entry.amount, 0)
         )}
        </span>
       </p>
       <Button 
        variant="outline" 
        size="sm"
        onClick={() => setActiveTab('accounts')}
        className="border-red-300 text-red-700 hover:"
       >
        Ver Detalhes
       </Button>
      </div>
     </CardContent>
    </Card>
   )}

   {/* Saúde Financeira */}
   {summary && (
    <Card>
     <CardHeader>
      <CardTitle className="flex items-center gap-2">
       <BarChart3 className="h-5 w-5" />
       Saúde Financeira
      </CardTitle>
     </CardHeader>
     <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
       <div className="space-y-3">
        <div className="flex justify-between items-center">
         <span className="text-sm text-muted-foreground">Liquidez</span>
         <span className="text-sm font-medium">
          {summary.totalPayable > 0
           ? `${((summary.totalReceivable / summary.totalPayable) * 100).toFixed(0)}%`
           : '∞%'
          }
         </span>
        </div>
        <div className="space-y-2">
         <Progress 
          value={summary.totalPayable > 0 ? Math.min((summary.totalReceivable / summary.totalPayable) * 100, 100) : 100}
          className="h-3"
         />
        </div>
        <p className="text-xs text-muted-foreground">
         Capacidade de pagamento das obrigações
        </p>
       </div>

       <div className="space-y-3">
        <div className="flex justify-between items-center">
         <span className="text-sm text-muted-foreground">Inadimplência</span>
         <span className="text-sm font-medium">
          {summary.totalReceivable > 0
           ? `${((summary.overdueReceivable / summary.totalReceivable) * 100).toFixed(1)}%`
           : '0%'
          }
         </span>
        </div>
        <div className="space-y-2">
         <Progress 
          value={summary.totalReceivable > 0 ? (summary.overdueReceivable / summary.totalReceivable) * 100 : 0}
          className="h-3"
         />
        </div>
        <p className="text-xs text-muted-foreground">
         Percentual de contas a receber vencidas
        </p>
       </div>

       <div className="space-y-3">
        <div className="flex justify-between items-center">
         <span className="text-sm text-muted-foreground">Saldo Líquido</span>
         <span className={`text-sm font-medium ${(summary.totalReceivable - summary.totalPayable) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(summary.totalReceivable - summary.totalPayable)}
         </span>
        </div>
        <div className="space-y-2">
         <div className="flex items-center gap-2">
          {(summary.totalReceivable - summary.totalPayable) >= 0 ? (
           <Badge variant="default" className="bg-green-100 ">
            Positivo
           </Badge>
          ) : (
           <Badge variant="destructive">
            Negativo
           </Badge>
          )}
         </div>
        </div>
        <p className="text-xs text-muted-foreground">
         Diferença entre recebíveis e pagáveis
        </p>
       </div>
      </div>
     </CardContent>
    </Card>
   )}

   {/* Tabs Principais */}
   <Tabs value={activeTab} onValueChange={setActiveTab}>
    <TabsList className="grid w-full grid-cols-4">
     <TabsTrigger value="overview">Visão Geral</TabsTrigger>
     <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
     <TabsTrigger value="reports">Relatórios</TabsTrigger>
     <TabsTrigger value="accounts">Contas</TabsTrigger>
    </TabsList>

    <TabsContent value="overview" className="space-y-6">
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Próximos Vencimentos */}
      <Card>
       <CardHeader>
        <CardTitle className="text-lg">Próximos 7 Dias</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="space-y-4">
         <div className="flex justify-between items-center p-3  rounded-lg">
          <div>
           <p className="font-medium ">A Receber</p>
           <p className="text-sm ">
            {formatCurrency(summary?.nextWeekReceivable || 0)}
           </p>
          </div>
          <TrendingUp className="h-5 w-5 text-primary" />
         </div>

         <div className="flex justify-between items-center p-3  rounded-lg">
          <div>
           <p className="font-medium ">A Pagar</p>
           <p className="text-sm ">
            {formatCurrency(summary?.nextWeekPayable || 0)}
           </p>
          </div>
          <TrendingDown className="h-5 w-5 text-primary" />
         </div>

         <div className="flex justify-between items-center p-3  rounded-lg">
          <div>
           <p className="font-medium text-primary">Saldo Projetado</p>
           <p className={`text-sm ${((summary?.nextWeekReceivable || 0) - (summary?.nextWeekPayable || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(
             (summary?.nextWeekReceivable || 0) - (summary?.nextWeekPayable || 0)
            )}
           </p>
          </div>
          <DollarSign className="h-5 w-5 text-primary" />
         </div>
        </div>
       </CardContent>
      </Card>

      {/* Contas Bancárias */}
      <Card>
       <CardHeader>
        <CardTitle className="text-lg">Contas Bancárias</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="space-y-3">
         {bankAccountsLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
         ) : bankAccounts && bankAccounts.length > 0 ? (
          bankAccounts.slice(0, 5).map((account) => (
           <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
             <div className="relative">
              <CreditCard className="h-4 w-4 text-primary" />
              <div 
               className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background" 
               
              />
             </div>
             <div>
              <p className="font-medium text-sm">{account.name}</p>
              <p className="text-xs text-muted-foreground">{account.bank}</p>
             </div>
            </div>
            <div className="text-right">
             <p className={`font-medium text-sm ${account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(account.currentBalance)}
             </p>
             <Badge variant={account.active ? "default" : "secondary"} className="text-xs">
              {account.active ? 'Ativa' : 'Inativa'}
             </Badge>
            </div>
           </div>
          ))
         ) : (
          <div className="text-center py-4 text-muted-foreground">Nenhuma conta encontrada</div>
         )}
         
         {bankAccounts && bankAccounts.data && bankAccounts.data.length > 5 && (
          <p className="text-xs text-muted-foreground text-center">
           +{bankAccounts.data.length - 5} contas a mais
          </p>
         )}
        </div>
       </CardContent>
      </Card>
     </div>
    </TabsContent>

    <TabsContent value="cashflow">
     <CashFlowChart />
    </TabsContent>

    <TabsContent value="reports">
     <DREReport />
    </TabsContent>

    <TabsContent value="accounts">
     <AccountsDashboard />
    </TabsContent>
   </Tabs>
  </div>
 )
}
