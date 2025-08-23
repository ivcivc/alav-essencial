import React, { useState } from 'react'
import { format, addDays, isBefore, isAfter, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
 ArrowUpCircle, 
 ArrowDownCircle, 
 Clock, 
 AlertCircle, 
 CheckCircle, 
 DollarSign,
 Calendar,
 Filter,
 Search,
 Plus,
 Eye,
 Edit,
 Trash2,
 CreditCard
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Badge } from '../../../components/ui/badge'
import { StatusBadge, getFinancialStatusBadge } from '../../../components/ui/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Checkbox } from '../../../components/ui/checkbox'

import {
 useAccountsReceivable,
 useAccountsPayable,
 useAccountsSummary,
 useMarkReceivableAsPaid,
 useMarkPayableAsPaid,
 useBankAccounts
} from '../../../hooks/useFinancial'
import { FinancialEntryForm } from './FinancialEntryForm'
import type { FinancialEntry } from '../../../services/financial'

interface AccountsDashboardProps {
 className?: string
}

export function AccountsDashboard({ className }: AccountsDashboardProps) {
 const [activeTab, setActiveTab] = useState('summary')
 const [filters, setFilters] = useState({
  receivable: {
   status: '',
   category: '',
   search: '',
   page: 1,
   limit: 20
  },
  payable: {
   status: '',
   category: '',
   search: '',
   page: 1,
   limit: 20
  }
 })
 const [selectedEntries, setSelectedEntries] = useState<string[]>([])
 const [showPaymentModal, setShowPaymentModal] = useState(false)
 const [selectedEntry, setSelectedEntry] = useState<FinancialEntry | null>(null)
 const [showViewModal, setShowViewModal] = useState(false)
 const [showEditModal, setShowEditModal] = useState(false)
 const [showPaymentConfirm, setShowPaymentConfirm] = useState(false)
 const [entryToMarkPaid, setEntryToMarkPaid] = useState<{entry: FinancialEntry, isReceivable: boolean} | null>(null)

 // Queries
 const { data: summary } = useAccountsSummary()
 const { data: bankAccounts } = useBankAccounts({ active: true })
 const receivableParams = {
  ...filters.receivable,
  status: filters.receivable.status === 'all' || !filters.receivable.status ? undefined : filters.receivable.status
 }
 const payableParams = {
  ...filters.payable,
  status: filters.payable.status === 'all' || !filters.payable.status ? undefined : filters.payable.status
 }
 
 const { data: receivableData, isLoading: receivableLoading } = useAccountsReceivable(receivableParams)
 const { data: payableData, isLoading: payableLoading } = useAccountsPayable(payableParams)



 // Mutations
 const markReceivablePaid = useMarkReceivableAsPaid()
 const markPayablePaid = useMarkPayableAsPaid()

 const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
   style: 'currency',
   currency: 'BRL'
  }).format(value)
 }

 const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
 }

 const getStatusBadge = (status: string, dueDate: string) => {
  const now = new Date()
  const due = new Date(dueDate)
  
  if (status === 'PAID') {
   return <StatusBadge variant="success">Pago</StatusBadge>
  }
  
  if (status === 'CANCELLED') {
   return <StatusBadge variant="muted">Cancelado</StatusBadge>
  }
  
  if (status === 'PARTIAL') {
   return <StatusBadge variant="info">Parcial</StatusBadge>
  }
  
  if (isBefore(due, now)) {
   return <StatusBadge variant="danger">Vencido</StatusBadge>
  }
  
  if (isToday(due)) {
   return <StatusBadge variant="warning">Vence Hoje</StatusBadge>
  }
  
  return <StatusBadge variant="warning">Pendente</StatusBadge>
 }

 const getPriorityLevel = (dueDate: string, status: string) => {
  if (status === 'PAID' || status === 'CANCELLED') return 'none'
  
  const now = new Date()
  const due = new Date(dueDate)
  
  if (isBefore(due, now)) return 'high' // Vencido
  if (isToday(due)) return 'medium' // Vence hoje
  if (isBefore(due, addDays(now, 7))) return 'low' // Próximos 7 dias
  
  return 'none'
 }

 const handleMarkAsPaid = async (entry: FinancialEntry, isReceivable: boolean) => {
  // Verificar se bankAccounts é array direto ou objeto com propriedade data
  const accounts = Array.isArray(bankAccounts) ? bankAccounts : bankAccounts?.data || []
  
  if (!accounts || accounts.length === 0) {
   alert('Nenhuma conta bancária disponível. Cadastre uma conta bancária primeiro.')
   return
  }

  // Abrir modal de confirmação ao invés de marcar diretamente
  setEntryToMarkPaid({ entry, isReceivable })
  setShowPaymentConfirm(true)
 }

 const confirmMarkAsPaid = async () => {
  if (!entryToMarkPaid) return

  const { entry, isReceivable } = entryToMarkPaid
  const accounts = Array.isArray(bankAccounts) ? bankAccounts : bankAccounts?.data || []
  const defaultAccount = accounts[0]
  
  try {
   if (isReceivable) {
    await markReceivablePaid.mutateAsync({
     id: entry.id,
     data: {
      paidAmount: entry.amount,
      paymentMethod: 'PIX',
      paidDate: format(new Date(), 'yyyy-MM-dd'),
      bankAccountId: defaultAccount.id
     }
    })
   } else {
    await markPayablePaid.mutateAsync({
     id: entry.id,
     data: {
      paidAmount: entry.amount,
      paymentMethod: 'PIX',
      paidDate: format(new Date(), 'yyyy-MM-dd'),
      bankAccountId: defaultAccount.id
     }
    })
   }

   setShowPaymentConfirm(false)
   setEntryToMarkPaid(null)
  } catch (error) {
   console.error('Erro ao marcar como pago:', error)
  }
 }

 const handleViewEntry = (entry: FinancialEntry) => {
  setSelectedEntry(entry)
  setShowViewModal(true)
 }

 const handleEditEntry = (entry: FinancialEntry) => {
  setSelectedEntry(entry)
  setShowEditModal(true)
 }

 const EntryTable = ({ entries, isReceivable, isLoading }: { 
  entries: FinancialEntry[] | undefined, 
  isReceivable: boolean,
  isLoading: boolean
 }) => {
  const getPriorityLevel = (dueDate: string, status: string) => {
   if (status === 'PAID') return 'low'
   
   const due = new Date(dueDate)
   const today = new Date()
   const diffInDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
   
   if (diffInDays < 0) return 'high' // Vencido
   if (diffInDays <= 3) return 'medium' // Vence em até 3 dias
   return 'low'
  }
  
  return (
  <div className="space-y-4">
   {/* Filtros - sempre visíveis */}
   <div className="flex flex-wrap gap-4">
    <div className="flex-1 min-w-[200px]">
     <Label>Buscar</Label>
     <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
       placeholder="Buscar por descrição..."
       value={isReceivable ? filters.receivable.search : filters.payable.search}
       onChange={(e) => setFilters(prev => ({
        ...prev,
        [isReceivable ? 'receivable' : 'payable']: {
         ...prev[isReceivable ? 'receivable' : 'payable'],
         search: e.target.value
        }
       }))}
       className="pl-10"
      />
     </div>
    </div>

    <div className="w-40">
     <Label>Status</Label>
     <Select
      value={isReceivable ? filters.receivable.status : filters.payable.status}
      onValueChange={(value) => setFilters(prev => ({
       ...prev,
       [isReceivable ? 'receivable' : 'payable']: {
        ...prev[isReceivable ? 'receivable' : 'payable'],
        status: value
       }
      }))}
     >
      <SelectTrigger>
       <SelectValue placeholder="Todos" />
      </SelectTrigger>
      <SelectContent>
       <SelectItem value="all">Todos</SelectItem>
       <SelectItem value="PENDING">Pendente</SelectItem>
       <SelectItem value="PAID">Pago</SelectItem>
       <SelectItem value="OVERDUE">Vencido</SelectItem>
       <SelectItem value="PARTIAL">Parcial</SelectItem>
       <SelectItem value="CANCELLED">Cancelado</SelectItem>
      </SelectContent>
     </Select>
    </div>
   </div>

   {/* Conteúdo principal */}
   {isLoading ? (
    <div className="text-center py-8 text-muted-foreground">Carregando...</div>
   ) : !entries || entries.length === 0 ? (
    <div className="text-center py-8 text-muted-foreground">
     {isReceivable ? 'Nenhuma conta a receber encontrada' : 'Nenhuma conta a pagar encontrada'}
    </div>
   ) : (
    <>
     {/* Tabela */}
     <div className="border rounded-lg">
    <Table>
     <TableHeader>
      <TableRow>
       <TableHead className="w-[80px] text-center">
        <Checkbox
         checked={selectedEntries.length === entries.length && entries.length > 0}
         onCheckedChange={(checked) => {
          if (checked) {
           setSelectedEntries(entries.map(e => e.id))
          } else {
           setSelectedEntries([])
          }
         }}
        />
       </TableHead>
       <TableHead>Descrição</TableHead>
       <TableHead>Categoria</TableHead>
       <TableHead>Valor</TableHead>
       <TableHead>Vencimento</TableHead>
       <TableHead>Status</TableHead>
       <TableHead>Prioridade</TableHead>
       <TableHead className="w-32">Ações</TableHead>
      </TableRow>
     </TableHeader>
     <TableBody>
      {entries.map((entry) => {
       const priority = getPriorityLevel(entry.dueDate, entry.status)
       const isSelected = selectedEntries.includes(entry.id)

       return (
        <TableRow key={entry.id} className={isSelected ? 'bg-muted/50' : ''}>
         <TableCell className="text-center">
          <Checkbox
           checked={isSelected}
           onCheckedChange={(checked) => {
            if (checked) {
             setSelectedEntries(prev => [...prev, entry.id])
            } else {
             setSelectedEntries(prev => prev.filter(id => id !== entry.id))
            }
           }}
          />
         </TableCell>
         <TableCell>
          <div>
           <p className="font-medium">{entry.description}</p>
           {entry.notes && (
            <p className="text-sm text-muted-foreground">{entry.notes}</p>
           )}
          </div>
         </TableCell>
         <TableCell>
          <div>
           <p className="text-sm font-medium">{entry.category}</p>
           {entry.subcategory && (
            <p className="text-xs text-muted-foreground">{entry.subcategory}</p>
           )}
          </div>
         </TableCell>
         <TableCell>
          <span className={`font-medium ${isReceivable ? 'text-green-600' : 'text-red-600'}`}>
           {formatCurrency(entry.amount)}
          </span>
         </TableCell>
         <TableCell>{formatDate(entry.dueDate)}</TableCell>
         <TableCell>{getStatusBadge(entry.status, entry.dueDate)}</TableCell>
         <TableCell>
          <div className="priority-cell">
           {priority === 'high' && (
            <Badge variant="destructive" className="flex items-center gap-1">
             <AlertCircle className="h-3 w-3" />
             Alto
            </Badge>
           )}
           {priority === 'medium' && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:">
             <Clock className="h-3 w-3" />
             Médio
            </Badge>
           )}
           {priority === 'low' && (
            <Badge variant="outline" className="flex items-center gap-1">
             Baixo
            </Badge>
           )}
          </div>
         </TableCell>
         <TableCell>
          <div className="flex items-center gap-1">
           <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleViewEntry(entry)}
            title="Visualizar"
            className="h-8 w-8 p-0"
           >
            <Eye className="h-4 w-4" />
           </Button>
           <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleEditEntry(entry)}
            title="Editar"
            className="h-8 w-8 p-0"
           >
            <Edit className="h-4 w-4" />
           </Button>
           {entry.status === 'PENDING' && (
            <Button 
             variant="ghost" 
             size="sm"
             onClick={() => handleMarkAsPaid(entry, isReceivable)}
             title="Marcar como pago"
             className="h-8 w-8 p-0 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:"
            >
             <CheckCircle className="h-4 w-4" />
            </Button>
           )}
          </div>
         </TableCell>
        </TableRow>
       )
      })}
     </TableBody>
    </Table>
     </div>
    </>
   )}
  </div>
  )
 }

 return (
  <div className={className}>
   <Tabs value={activeTab} onValueChange={setActiveTab}>
    <TabsList className="grid w-full grid-cols-3">
     <TabsTrigger value="summary">Resumo</TabsTrigger>
     <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
     <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
    </TabsList>

    {/* Resumo */}
    <TabsContent value="summary" className="space-y-6">
     {summary && (
      <>
       {/* Cards de Resumo */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
         <CardContent className="p-4">
          <div className="flex items-center justify-between">
           <div>
            <p className="text-sm text-muted-foreground">Total a Receber</p>
            <p className="text-2xl font-bold ">
             {formatCurrency(summary.totalReceivable)}
            </p>
           </div>
           <ArrowUpCircle className="h-8 w-8 " />
          </div>
         </CardContent>
        </Card>

        <Card>
         <CardContent className="p-4">
          <div className="flex items-center justify-between">
           <div>
            <p className="text-sm text-muted-foreground">Total a Pagar</p>
            <p className="text-2xl font-bold ">
             {formatCurrency(summary.totalPayable)}
            </p>
           </div>
           <ArrowDownCircle className="h-8 w-8 " />
          </div>
         </CardContent>
        </Card>

        <Card>
         <CardContent className="p-4">
          <div className="flex items-center justify-between">
           <div>
            <p className="text-sm text-muted-foreground">Saldo Líquido</p>
            <p className={`text-2xl font-bold ${(summary.totalReceivable - summary.totalPayable) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
             {formatCurrency(summary.totalReceivable - summary.totalPayable)}
            </p>
           </div>
           <DollarSign className="h-8 w-8 text-primary" />
          </div>
         </CardContent>
        </Card>

        <Card>
         <CardContent className="p-4">
          <div className="flex items-center justify-between">
           <div>
            <p className="text-sm text-muted-foreground">Vencidos</p>
            <p className="text-2xl font-bold ">
             {formatCurrency(summary.overdueReceivable + summary.overduePayable)}
            </p>
           </div>
           <AlertCircle className="h-8 w-8 " />
          </div>
         </CardContent>
        </Card>
       </div>

       {/* Próximos Vencimentos */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
         <CardHeader>
          <CardTitle className="text-lg">Próxima Semana - A Receber</CardTitle>
         </CardHeader>
         <CardContent>
          <div className="space-y-2">
           <div className="flex justify-between items-center">
            <span className="text-sm">Valor total</span>
            <span className="font-medium ">
             {formatCurrency(summary.nextWeekReceivable)}
            </span>
           </div>
          </div>
         </CardContent>
        </Card>

        <Card>
         <CardHeader>
          <CardTitle className="text-lg">Próxima Semana - A Pagar</CardTitle>
         </CardHeader>
         <CardContent>
          <div className="space-y-2">
           <div className="flex justify-between items-center">
            <span className="text-sm">Valor total</span>
            <span className="font-medium ">
             {formatCurrency(summary.nextWeekPayable)}
            </span>
           </div>
          </div>
         </CardContent>
        </Card>
       </div>
      </>
     )}
    </TabsContent>

    {/* Contas a Receber */}
    <TabsContent value="receivable" className="space-y-6">
     <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">Contas a Receber</h3>
      <Dialog>
       <DialogTrigger asChild>
        <Button>
         <Plus className="h-4 w-4 mr-2" />
         Nova Receita
        </Button>
       </DialogTrigger>
       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
         <DialogTitle>Nova Conta a Receber</DialogTitle>
        </DialogHeader>
        <FinancialEntryForm
         defaultType="INCOME"
         onSuccess={() => {
          // Fechar modal e recarregar dados
         }}
        />
       </DialogContent>
      </Dialog>
     </div>

     <EntryTable entries={receivableData} isReceivable={true} isLoading={receivableLoading} />
    </TabsContent>

    {/* Contas a Pagar */}
    <TabsContent value="payable" className="space-y-6">
     <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">Contas a Pagar</h3>
      <Dialog>
       <DialogTrigger asChild>
        <Button>
         <Plus className="h-4 w-4 mr-2" />
         Nova Despesa
        </Button>
       </DialogTrigger>
       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
         <DialogTitle>Nova Conta a Pagar</DialogTitle>
        </DialogHeader>
        <FinancialEntryForm
         defaultType="EXPENSE"
         onSuccess={() => {
          // Fechar modal e recarregar dados
         }}
        />
       </DialogContent>
      </Dialog>
     </div>

     <EntryTable entries={payableData} isReceivable={false} isLoading={payableLoading} />
    </TabsContent>
   </Tabs>

   {/* Modal de Visualização */}
   <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
    <DialogContent className="max-w-2xl">
     <DialogHeader>
      <DialogTitle>Detalhes da Entrada</DialogTitle>
     </DialogHeader>
     {selectedEntry && (
      <div className="space-y-4">
       <div className="grid grid-cols-2 gap-4">
        <div>
         <Label>Tipo</Label>
         <p className="text-sm">{selectedEntry.type === 'INCOME' ? 'Receita' : 'Despesa'}</p>
        </div>
        <div>
         <Label>Valor</Label>
         <p className="text-sm font-medium">
          R$ {selectedEntry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
         </p>
        </div>
        <div>
         <Label>Categoria</Label>
         <p className="text-sm">{selectedEntry.category}</p>
        </div>
        <div>
         <Label>Status</Label>
         <p className="text-sm">{
          selectedEntry.status === 'PENDING' ? 'Pendente' :
          selectedEntry.status === 'PAID' ? 'Pago' :
          selectedEntry.status === 'OVERDUE' ? 'Vencido' :
          selectedEntry.status === 'PARTIAL' ? 'Parcial' :
          'Cancelado'
         }</p>
        </div>
        <div>
         <Label>Data de Vencimento</Label>
         <p className="text-sm">{format(new Date(selectedEntry.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
        </div>
        {selectedEntry.paidDate && (
         <div>
          <Label>Data de Pagamento</Label>
          <p className="text-sm">{format(new Date(selectedEntry.paidDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
         </div>
        )}
       </div>
       <div>
        <Label>Descrição</Label>
        <p className="text-sm">{selectedEntry.description}</p>
       </div>
       {selectedEntry.notes && (
        <div>
         <Label>Observações</Label>
         <p className="text-sm">{selectedEntry.notes}</p>
        </div>
       )}
      </div>
     )}
    </DialogContent>
   </Dialog>

   {/* Modal de Edição */}
   <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
     <DialogHeader>
      <DialogTitle>Editar Entrada</DialogTitle>
     </DialogHeader>
     {selectedEntry && (
      <FinancialEntryForm
       entry={selectedEntry}
       onSuccess={() => {
        setShowEditModal(false)
        setSelectedEntry(null)
        // Os dados serão atualizados automaticamente via React Query
       }}
       onCancel={() => {
        setShowEditModal(false)
        setSelectedEntry(null)
       }}
      />
     )}
    </DialogContent>
   </Dialog>

   {/* Modal de Confirmação de Pagamento */}
   <Dialog open={showPaymentConfirm} onOpenChange={setShowPaymentConfirm}>
    <DialogContent className="max-w-md">
     <DialogHeader>
      <DialogTitle>Confirmar Pagamento</DialogTitle>
     </DialogHeader>
     {entryToMarkPaid && (
      <div className="space-y-4">
       <p className="text-sm text-muted-foreground">
        Deseja marcar esta entrada como paga?
       </p>
       <div className="space-y-2">
        <div>
         <Label>Descrição</Label>
         <p className="text-sm font-medium">{entryToMarkPaid.entry.description}</p>
        </div>
        <div>
         <Label>Valor</Label>
         <p className="text-sm font-medium ">
          R$ {entryToMarkPaid.entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
         </p>
        </div>
        <div>
         <Label>Data de Pagamento</Label>
         <p className="text-sm">{format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</p>
        </div>
        <div>
         <Label>Método de Pagamento</Label>
         <p className="text-sm">PIX (padrão)</p>
        </div>
       </div>
       <div className="flex gap-2 pt-4">
        <Button 
         variant="outline" 
         onClick={() => {
          setShowPaymentConfirm(false)
          setEntryToMarkPaid(null)
         }}
         className="flex-1"
        >
         Cancelar
        </Button>
        <Button 
         onClick={confirmMarkAsPaid}
         className="flex-1"
        >
         <CheckCircle className="h-4 w-4 mr-2" />
         Confirmar Pagamento
        </Button>
       </div>
      </div>
     )}
    </DialogContent>
   </Dialog>
  </div>
 )
}
