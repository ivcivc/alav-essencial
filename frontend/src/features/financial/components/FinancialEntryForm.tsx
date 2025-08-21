import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, Plus, Sparkles, DollarSign, Building, User, Calendar } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Switch } from '../../../components/ui/switch'

import {
  useBankAccounts,
  useCategoriesByType,
  useCreateFinancialEntry,
  useUpdateFinancialEntry,
  useCreateRecurringEntry,
  useSuggestCategory
} from '../../../hooks/useFinancial'
import { usePartners } from '../../../hooks/usePartners'
import { usePatients } from '../../../hooks/usePatients'
import type { FinancialEntry, CreateFinancialEntryData } from '../../../services/financial'

const financialEntrySchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  bankAccountId: z.string().min(1, 'Conta bancária é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  subcategory: z.string().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  paidDate: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'PARTIAL']).default('PENDING'),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  partnerId: z.string().optional(),
  patientId: z.string().optional(),
  recurring: z.boolean().default(false)
})

type FinancialEntryFormData = z.infer<typeof financialEntrySchema>

interface FinancialEntryFormProps {
  entry?: FinancialEntry
  onSuccess?: () => void
  onCancel?: () => void
  defaultType?: 'INCOME' | 'EXPENSE'
  defaultBankAccountId?: string
}

export function FinancialEntryForm({ 
  entry, 
  onSuccess, 
  onCancel,
  defaultType = 'INCOME',
  defaultBankAccountId 
}: FinancialEntryFormProps) {
  const [showRecurringOptions, setShowRecurringOptions] = useState(false)
  const [suggestedCategory, setSuggestedCategory] = useState<any>(null)
  
  // Verificar se este lançamento está relacionado a um agendamento
  const isRelatedToAppointment = entry?.referenceType === 'APPOINTMENT' && entry?.referenceId

  const { data: bankAccounts, isLoading: loadingBankAccounts, error: bankAccountsError } = useBankAccounts({ active: true })
  
  // Debug temporário removido - contas funcionando
  const { data: partners } = usePartners({ active: true })
  const { data: patients } = usePatients({ active: true })
  
  const [selectedType, setSelectedType] = useState<'INCOME' | 'EXPENSE'>(entry?.type || defaultType)
  const { data: categories } = useCategoriesByType(selectedType)
  
  const createMutation = useCreateFinancialEntry()
  const updateMutation = useUpdateFinancialEntry()
  const createRecurringMutation = useCreateRecurringEntry()
  const suggestCategoryMutation = useSuggestCategory()

  const form = useForm<FinancialEntryFormData>({
    resolver: zodResolver(financialEntrySchema),
    defaultValues: {
      type: entry?.type || defaultType,
      bankAccountId: entry?.bankAccountId || defaultBankAccountId || '',
      category: entry?.category || '',
      subcategory: entry?.subcategory || '',
      description: entry?.description || '',
      amount: entry?.amount || 0,
      dueDate: entry?.dueDate ? format(new Date(entry.dueDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      paidDate: entry?.paidDate ? format(new Date(entry.paidDate), 'yyyy-MM-dd') : '',
      status: entry?.status || 'PENDING',
      paymentMethod: entry?.paymentMethod || '',
      notes: entry?.notes || '',
      partnerId: entry?.partnerId || 'none',
      patientId: entry?.patientId || 'none',
      recurring: false
    }
  })

  const watchedType = form.watch('type')
  const watchedDescription = form.watch('description')
  const watchedStatus = form.watch('status')

  // Atualizar tipo quando mudar
  useEffect(() => {
    if (watchedType !== selectedType) {
      setSelectedType(watchedType)
      form.setValue('category', '') // Limpar categoria quando mudar tipo
      form.setValue('subcategory', '')
    }
  }, [watchedType, selectedType, form])

  // Atualizar selectedType quando entry muda (para modo de edição)
  useEffect(() => {
    if (entry?.type && entry.type !== selectedType) {
      setSelectedType(entry.type)
    }
  }, [entry?.type, selectedType])

  // Sugerir categoria baseada na descrição
  useEffect(() => {
    if (watchedDescription && watchedDescription.length > 10 && !entry) {
      const timer = setTimeout(() => {
        suggestCategoryMutation.mutate(
          { description: watchedDescription, type: selectedType },
          {
            onSuccess: (suggestion) => {
              if (suggestion && !form.getValues('category')) {
                setSuggestedCategory(suggestion)
              }
            }
          }
        )
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [watchedDescription, selectedType, suggestCategoryMutation, entry, form])

  // Aplicar sugestão de categoria
  const applySuggestion = () => {
    if (suggestedCategory) {
      form.setValue('category', suggestedCategory.name)
      setSuggestedCategory(null)
    }
  }

  const onSubmit = async (data: FinancialEntryFormData) => {
    try {
      const entryData: CreateFinancialEntryData = {
        ...data,
        amount: Number(data.amount),
        paidDate: data.paidDate || undefined,
        paymentMethod: data.paymentMethod || undefined,
        notes: data.notes || undefined,
        partnerId: data.partnerId === 'none' ? undefined : data.partnerId || undefined,
        patientId: data.patientId === 'none' ? undefined : data.patientId || undefined,
        subcategory: data.subcategory === 'none' ? undefined : data.subcategory || undefined
      }



      if (entry) {
        // Atualizar lançamento existente
        await updateMutation.mutateAsync({ id: entry.id, data: entryData })
      } else if (data.recurring && showRecurringOptions) {
        // Criar lançamentos recorrentes
        await createRecurringMutation.mutateAsync({
          baseEntry: entryData,
          config: {
            frequency: 'MONTHLY',
            interval: 1,
            maxOccurrences: 12
          }
        })
      } else {
        // Criar lançamento único
        await createMutation.mutateAsync(entryData)
      }

      onSuccess?.()
    } catch (error: any) {
      console.error('❌ Erro no formulário:', error)
      
      // Mostrar erro detalhado para o usuário
      let errorMessage = 'Erro desconhecido'
      
      if (error?.message) {
        errorMessage = error.message
      }
      
      if (error?.details?.length > 0) {
        errorMessage = `Erro de validação: ${error.details.map((d: any) => d.message).join(', ')}`
      }
      
      console.error('💥 Mensagem de erro para o usuário:', errorMessage)
    }
  }

  const paymentMethods = [
    { value: 'CASH', label: 'Dinheiro' },
    { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
    { value: 'PIX', label: 'PIX' },
    { value: 'BANK_TRANSFER', label: 'Transferência' },
    { value: 'CHECK', label: 'Cheque' },
    { value: 'VOUCHER', label: 'Vale/Voucher' }
  ]

  const statusOptions = [
    { value: 'PENDING', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'PAID', label: 'Pago', color: 'bg-green-100 text-green-800' },
    { value: 'OVERDUE', label: 'Vencido', color: 'bg-red-100 text-red-800' },
    { value: 'CANCELLED', label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
    { value: 'PARTIAL', label: 'Parcial', color: 'bg-blue-100 text-blue-800' }
  ]

  const selectedCategory = categories?.find(cat => cat.name === form.watch('category'))



  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Aviso para lançamentos relacionados a agendamentos */}
      {isRelatedToAppointment && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2 text-blue-700">
              <Calendar className="h-5 w-5" />
              <span className="font-semibold">Sincronização com Agendamento</span>
            </div>
          </div>
          <div className="mt-2 text-sm text-blue-600">
            <p>⚠️ <strong>Este lançamento está vinculado a um agendamento.</strong></p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Alterações no status serão sincronizadas automaticamente com o agendamento</li>
              <li><strong>PAID/PENDING → Agendamento: COMPLETED/IN_PROGRESS</strong></li>
              <li><strong>CANCELLED → Agendamento: IN_PROGRESS</strong></li>
            </ul>
            <p className="mt-2 text-xs bg-blue-100 p-2 rounded border">
              💡 <strong>Dica:</strong> Para cancelar apenas o checkout (mantendo o agendamento ativo), 
              use a opção "Cancelar Checkout" no próprio agendamento.
            </p>
          </div>
        </div>
      )}

      {/* Tipo e Conta Bancária */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <Select
            value={form.watch('type')}
            onValueChange={(value) => form.setValue('type', value as 'INCOME' | 'EXPENSE')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-600" />
                  Receita
                </div>
              </SelectItem>
              <SelectItem value="EXPENSE">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-600" />
                  Despesa
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.type && (
            <p className="text-sm text-red-600">{form.formState.errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankAccountId">Conta Bancária *</Label>
          <Select
            value={form.watch('bankAccountId')}
            onValueChange={(value) => form.setValue('bankAccountId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingBankAccounts ? "Carregando contas..." : "Selecione a conta"} />
            </SelectTrigger>
            <SelectContent>
              {loadingBankAccounts ? (
                <SelectItem value="loading" disabled>Carregando contas...</SelectItem>
              ) : bankAccountsError ? (
                <SelectItem value="error" disabled>Erro ao carregar contas</SelectItem>
              ) : (() => {
                // Detectar estrutura dos dados automaticamente
                const accounts = Array.isArray(bankAccounts) ? bankAccounts : bankAccounts?.data;
                
                if (accounts && Array.isArray(accounts) && accounts.length > 0) {
                  return accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: account.color }}
                        />
                        {account.name}
                      </div>
                    </SelectItem>
                  ));
                } else {
                  return <SelectItem value="empty" disabled>Nenhuma conta encontrada</SelectItem>;
                }
              })()}
            </SelectContent>
          </Select>
          {form.formState.errors.bankAccountId && (
            <p className="text-sm text-red-600">{form.formState.errors.bankAccountId.message}</p>
          )}
        </div>
      </div>

      {/* Descrição e Valor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição *</Label>
          <Input
            id="description"
            {...form.register('description')}
            placeholder="Descreva o lançamento..."
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
          )}
          
          {/* Sugestão de categoria */}
          {suggestedCategory && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Categoria sugerida: <strong>{suggestedCategory.name}</strong>
              </span>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={applySuggestion}
              >
                Aplicar
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            {...form.register('amount', { valueAsNumber: true })}
            placeholder="0,00"
          />
          {form.formState.errors.amount && (
            <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
          )}
        </div>
      </div>

      {/* Categoria e Subcategoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select
            value={form.watch('category')}
            onValueChange={(value) => {
              form.setValue('category', value)
              form.setValue('subcategory', '') // Limpar subcategoria
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.name} value={category.name}>
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategoria</Label>
          <Select
            value={form.watch('subcategory') || 'none'}
            onValueChange={(value) => form.setValue('subcategory', value)}
            disabled={!selectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a subcategoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {selectedCategory?.subcategories?.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Datas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Data de Vencimento *</Label>
          <Input
            id="dueDate"
            type="date"
            {...form.register('dueDate')}
          />
          {form.formState.errors.dueDate && (
            <p className="text-sm text-red-600">{form.formState.errors.dueDate.message}</p>
          )}
        </div>

        {watchedStatus === 'PAID' && (
          <div className="space-y-2">
            <Label htmlFor="paidDate">Data de Pagamento</Label>
            <Input
              id="paidDate"
              type="date"
              {...form.register('paidDate')}
            />
          </div>
        )}
      </div>

      {/* Status e Método de Pagamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.watch('status')}
            onValueChange={(value) => form.setValue('status', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <Badge variant="secondary" className={status.color}>
                    {status.label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {watchedStatus === 'PAID' && (
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
            <Select
              value={form.watch('paymentMethod')}
              onValueChange={(value) => form.setValue('paymentMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Associações (Partner/Patient) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="partnerId">Parceiro (opcional)</Label>
          <Select
            value={form.watch('partnerId')}
            onValueChange={(value) => form.setValue('partnerId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o parceiro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {partners?.partners?.map((partner) => (
                <SelectItem key={partner.id} value={partner.id}>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {partner.fullName}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientId">Paciente (opcional)</Label>
          <Select
            value={form.watch('patientId')}
            onValueChange={(value) => form.setValue('patientId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o paciente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {patients?.patients?.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {patient.fullName}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          {...form.register('notes')}
          placeholder="Observações adicionais..."
          rows={3}
        />
      </div>

      {/* Opção de Recorrência */}
      {!entry && (
        <div className="flex items-center space-x-2">
          <Switch
            id="recurring"
            checked={showRecurringOptions}
            onCheckedChange={setShowRecurringOptions}
          />
          <Label htmlFor="recurring">Criar lançamentos recorrentes</Label>
        </div>
      )}

      {/* Botões */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={createMutation.isPending || updateMutation.isPending || createRecurringMutation.isPending}
        >
          {entry ? 'Atualizar' : showRecurringOptions ? 'Criar Recorrentes' : 'Criar'} Lançamento
        </Button>
      </div>
    </form>
  )
}
