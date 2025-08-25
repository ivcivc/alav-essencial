import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Building2,
  CreditCard,
  DollarSign,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Plus,
  Eye,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog'

import { useBankAccounts, useDeleteBankAccount, useUpdateBankAccount } from '../../../hooks/useFinancial'
import { BankAccountForm } from './BankAccountForm'
import type { BankAccount } from '../../../services/financial'
import { getBankAccountTypeLabel } from '../../../utils/bankAccountTypes'

interface BankAccountsListProps {
  className?: string
}

export function BankAccountsList({ className }: BankAccountsListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [viewingAccount, setViewingAccount] = useState<BankAccount | null>(null)
  const [inactivatingAccount, setInactivatingAccount] = useState<BankAccount | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<BankAccount | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Queries
  const { data: bankAccountsResponse, isLoading, refetch } = useBankAccounts()
  const bankAccounts = Array.isArray(bankAccountsResponse) 
    ? bankAccountsResponse 
    : bankAccountsResponse?.data || []

  // Mutations
  const deleteBankAccount = useDeleteBankAccount()
  const updateBankAccount = useUpdateBankAccount()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
  }



  const handleToggleActive = async (account: BankAccount) => {
    if (account.active) {
      // Se está ativa, mostrar modal de confirmação para inativar
      setInactivatingAccount(account)
    } else {
      // Se está inativa, ativar diretamente
      try {
        await updateBankAccount.mutateAsync({
          id: account.id,
          data: { active: true }
        })
      } catch (error) {
        console.error('Erro ao ativar conta:', error)
      }
    }
  }

  const confirmInactivate = async () => {
    if (!inactivatingAccount) return
    
    try {
      await updateBankAccount.mutateAsync({
        id: inactivatingAccount.id,
        data: { active: false }
      })
      setInactivatingAccount(null)
    } catch (error) {
      console.error('Erro ao inativar conta:', error)
    }
  }

  const handleDelete = async () => {
    if (!deletingAccount) return
    
    try {
      setDeleteError(null) // Limpar erro anterior
      await deleteBankAccount.mutateAsync(deletingAccount.id)
      setDeletingAccount(null)
    } catch (error: any) {
      console.error('Erro ao excluir conta bancária:', error)
      
      // Capturar mensagem de erro e exibir no modal
      const errorMessage = error?.message || error?.toString() || ''
      if (errorMessage.includes('lançamentos financeiros associados') || errorMessage.toLowerCase().includes('bad request')) {
        setDeleteError('Esta conta bancária possui lançamentos financeiros associados e não pode ser excluída. Use a opção "Inativar" para preservar o histórico.')
      } else if (errorMessage.includes('não encontrada')) {
        setDeleteError('Conta bancária não encontrada. Pode ter sido excluída por outro usuário.')
        refetch() // Atualizar lista
      } else {
        setDeleteError('Erro inesperado ao excluir conta bancária. Tente novamente ou entre em contato com o suporte.')
      }
    }
  }

  const totalBalance = bankAccounts.reduce((sum, account) => sum + (account.currentBalance || 0), 0)
  const activeAccounts = bankAccounts.filter(account => account.active)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Carregando contas bancárias...
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com Resumo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Contas Bancárias</h2>
          <p className="text-muted-foreground">
            {activeAccounts.length} conta(s) ativa(s) • Saldo total: {formatCurrency(totalBalance)}
          </p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Conta Bancária</DialogTitle>
            </DialogHeader>
            <BankAccountForm
              onSuccess={() => {
                setShowCreateModal(false)
                refetch()
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Contas</p>
                <p className="text-xl font-bold">{bankAccounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <ToggleRight className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contas Ativas</p>
                <p className="text-xl font-bold text-green-600">{activeAccounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Total</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Contas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas</CardTitle>
        </CardHeader>
        <CardContent>
          {bankAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma conta bancária cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie sua primeira conta bancária para começar a usar o sistema financeiro.
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Conta
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conta</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Saldo Inicial</TableHead>
                    <TableHead>Saldo Atual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead className="w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: account.color }}
                          />
                          <div>
                            <p className="font-medium">{account.name}</p>
                            {account.description && (
                              <p className="text-sm text-muted-foreground">
                                {account.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{account.bank}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getBankAccountTypeLabel(account.accountType)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(account.initialBalance)}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          account.currentBalance >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {formatCurrency(account.currentBalance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={account.active ? 'default' : 'secondary'}
                          className={account.active 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                          }
                        >
                          {account.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(account.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {/* Visualizar */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingAccount(account)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Editar */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingAccount(account)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Toggle Ativo/Inativo */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(account)}
                            disabled={updateBankAccount.isPending}
                            title={account.active ? 'Inativar conta' : 'Ativar conta'}
                          >
                            {account.active ? (
                              <ToggleLeft className="h-4 w-4 text-orange-600" />
                            ) : (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            )}
                          </Button>

                          {/* Excluir */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeletingAccount(account)}
                            title="Excluir conta"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Conta Bancária</DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <BankAccountForm
              account={editingAccount}
              onSuccess={() => {
                setEditingAccount(null)
                refetch()
              }}
              onCancel={() => setEditingAccount(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização */}
      <Dialog open={!!viewingAccount} onOpenChange={() => setViewingAccount(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Conta</DialogTitle>
          </DialogHeader>
          {viewingAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nome da Conta</Label>
                  <p className="text-sm">{viewingAccount.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Banco</Label>
                  <p className="text-sm">{viewingAccount.bank}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                  <p className="text-sm">{getBankAccountTypeLabel(viewingAccount.accountType)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge 
                    variant={viewingAccount.active ? 'default' : 'secondary'}
                    className={viewingAccount.active 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-white'
                    }
                  >
                    {viewingAccount.active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                {viewingAccount.agency && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Agência</Label>
                    <p className="text-sm">{viewingAccount.agency}</p>
                  </div>
                )}
                {viewingAccount.accountNumber && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Conta</Label>
                    <p className="text-sm">{viewingAccount.accountNumber}</p>
                  </div>
                )}
                {viewingAccount.pixKey && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">PIX</Label>
                    <p className="text-sm">{viewingAccount.pixKey}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Saldo Inicial</Label>
                  <p className="text-sm font-medium">{formatCurrency(viewingAccount.initialBalance)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Saldo Atual</Label>
                  <p className={`text-sm font-medium ${
                    viewingAccount.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(viewingAccount.currentBalance)}
                  </p>
                </div>
              </div>
              
              {viewingAccount.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{viewingAccount.description}</p>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-4 border-t">
                <p>💡 <strong>Saldo Dinâmico:</strong> O saldo inicial ajusta automaticamente conforme novas transações retroativas são adicionadas</p>
                <p>🔄 <strong>Recálculo Automático:</strong> Qualquer modificação em transações recalcula automaticamente todos os saldos subsequentes</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Inativação */}
      <Dialog open={!!inactivatingAccount} onOpenChange={() => setInactivatingAccount(null)}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-2 border-orange-400 dark:border-orange-600 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
              <AlertTriangle className="h-5 w-5" />
              Inativar Conta Bancária
            </DialogTitle>
          </DialogHeader>
          {inactivatingAccount && (
            <div className="space-y-4">
              {/* Informações da Conta */}
              <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-300 dark:border-orange-700">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: inactivatingAccount.color }}
                  />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {inactivatingAccount.name}
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {inactivatingAccount.bank} • {getBankAccountTypeLabel(inactivatingAccount.accountType)}
                    </p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-slate-800 dark:text-slate-200">
                    <strong>Saldo Atual:</strong> <span className={`font-medium ${
                      inactivatingAccount.currentBalance >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                    }`}>
                      {formatCurrency(inactivatingAccount.currentBalance)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Consequências */}
              <div className="space-y-3">
                <h4 className="font-medium text-orange-800 dark:text-orange-300">
                  ⚠️ Consequências da Inativação:
                </h4>
                <div className="space-y-2 text-sm text-slate-800 dark:text-slate-200">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                    <span>A conta não aparecerá em novos lançamentos financeiros</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                    <span>Lançamentos existentes serão mantidos e continuarão visíveis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                    <span>O saldo atual será preservado</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-700 dark:text-green-400 mt-0.5">✓</span>
                    <span>Você pode reativar a conta a qualquer momento</span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-300 dark:border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => setInactivatingAccount(null)}
                  disabled={updateBankAccount.isPending}
                  className="border-slate-400 text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmInactivate}
                  disabled={updateBankAccount.isPending}
                  className="bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-600 dark:hover:bg-orange-700"
                >
                  {updateBankAccount.isPending ? 'Inativando...' : 'Confirmar Inativação'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={!!deletingAccount} onOpenChange={() => {
        setDeletingAccount(null)
        setDeleteError(null)
      }}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-2 border-red-400 dark:border-red-600 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-800 dark:text-red-300">
              <Trash2 className="h-5 w-5" />
              Excluir Conta Bancária
            </DialogTitle>
          </DialogHeader>
          {deletingAccount && (
            <div className="space-y-4">
              {/* Informações da Conta */}
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: deletingAccount.color }}
                  />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {deletingAccount.name}
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {deletingAccount.bank} • {getBankAccountTypeLabel(deletingAccount.accountType)}
                    </p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-slate-800 dark:text-slate-200">
                    <strong>Saldo Atual:</strong> <span className={`font-medium ${
                      deletingAccount.currentBalance >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                    }`}>
                      {formatCurrency(deletingAccount.currentBalance)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Avisos Críticos */}
              <div className="space-y-3">
                <h4 className="font-medium text-red-800 dark:text-red-300">
                  🚨 ATENÇÃO: Exclusão Permanente
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-0.5">⚠️</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      <strong>Esta ação não pode ser desfeita</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-0.5">⚠️</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      A conta será removida permanentemente do sistema
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      <strong>Proteção:</strong> Não é possível excluir contas com lançamentos financeiros
                    </span>
                  </div>
                </div>
              </div>

              {/* Alternativa Sugerida */}
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
                <div className="flex items-start gap-2">
                  <span className="text-blue-700 dark:text-blue-400 mt-0.5">💡</span>
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                      Sugestão:
                    </p>
                    <p className="text-blue-800 dark:text-blue-300">
                      Considere <strong>inativar</strong> a conta ao invés de excluir. 
                      Assim você preserva o histórico e pode reativar no futuro.
                    </p>
                  </div>
                </div>
              </div>

              {/* Exibir erro se houver */}
              {deleteError && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 dark:text-red-400 mt-0.5 text-lg">❌</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">
                        Não foi possível excluir
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {deleteError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-300 dark:border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeletingAccount(null)
                    setDeleteError(null)
                  }}
                  disabled={deleteBankAccount.isPending}
                  className="border-slate-400 text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeletingAccount(null)
                    setDeleteError(null)
                    setInactivatingAccount(deletingAccount)
                  }}
                  className="border-blue-400 text-blue-800 hover:bg-blue-100 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  Inativar ao Invés
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteBankAccount.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
                >
                  {deleteBankAccount.isPending ? 'Excluindo...' : 'Confirmar Exclusão'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente Label (assumindo que não existe)
const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={`block text-sm font-medium ${className}`}>{children}</label>
)
