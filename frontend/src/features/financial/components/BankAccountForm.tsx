import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Building2, 
  CreditCard, 
  DollarSign, 
  Hash, 
  MapPin,
  Palette,
  FileText,
  ToggleLeft
} from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Switch } from '../../../components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'

import { useCreateBankAccount, useUpdateBankAccount } from '../../../hooks/useFinancial'
import type { BankAccount, CreateBankAccountData } from '../../../services/financial'
import { BANK_ACCOUNT_TYPES, type BankAccountType } from '../../../utils/bankAccountTypes'

// Schema de validação seguindo requisitos
const bankAccountSchema = z.object({
  name: z.string().min(1, 'Nome da conta é obrigatório'),
  bank: z.string().min(1, 'Nome do banco é obrigatório'),
  accountType: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'CASH', 'CREDIT_CARD', 'PIX'] as const, {
    required_error: 'Tipo de conta é obrigatório'
  }),
  agency: z.string().optional(),
  accountNumber: z.string().optional(),
  pixKey: z.string().optional(),
  initialBalance: z.number({
    required_error: 'Saldo inicial é obrigatório'
  }),
  active: z.boolean().default(true),
  color: z.string().default('#3B82F6'),
  description: z.string().optional()
})

type BankAccountFormData = z.infer<typeof bankAccountSchema>

interface BankAccountFormProps {
  account?: BankAccount
  onSuccess?: () => void
  onCancel?: () => void
}

export function BankAccountForm({ account, onSuccess, onCancel }: BankAccountFormProps) {
  const isEditing = !!account

  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      name: account?.name || '',
      bank: account?.bank || '',
      accountType: (account?.accountType as any) || 'CHECKING',
      agency: account?.agency || '',
      accountNumber: account?.accountNumber || '',
      pixKey: account?.pixKey || '',
      initialBalance: account?.initialBalance || 0,
      active: account?.active ?? true,
      color: account?.color || '#3B82F6',
      description: account?.description || ''
    }
  })

  // Mutations
  const createBankAccount = useCreateBankAccount()
  const updateBankAccount = useUpdateBankAccount()

  const handleSubmit = async (data: BankAccountFormData) => {
    try {
      if (isEditing) {
        await updateBankAccount.mutateAsync({
          id: account.id,
          data: data as Partial<CreateBankAccountData>
        })
      } else {
        await createBankAccount.mutateAsync(data as CreateBankAccountData)
      }
      
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar conta bancária:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const accountTypeOptions = BANK_ACCOUNT_TYPES

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ]

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informações da Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome da Conta */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Conta *</Label>
            <Input
              id="name"
              placeholder="Ex: Conta Corrente Principal"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Banco e Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank">Banco *</Label>
              <Input
                id="bank"
                placeholder="Ex: Banco do Brasil, Nubank, Caixa"
                {...form.register('bank')}
              />
              {form.formState.errors.bank && (
                <p className="text-sm text-red-600">{form.formState.errors.bank.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">Tipo de Conta *</Label>
              <Select
                value={form.watch('accountType')}
                onValueChange={(value) => form.setValue('accountType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.accountType && (
                <p className="text-sm text-red-600">{form.formState.errors.accountType.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Bancários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Dados Bancários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agency">Agência</Label>
              <Input
                id="agency"
                placeholder="Ex: 1234-5"
                {...form.register('agency')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Número da Conta</Label>
              <Input
                id="accountNumber"
                placeholder="Ex: 12345-6"
                {...form.register('accountNumber')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pixKey">Chave PIX</Label>
            <Input
              id="pixKey"
              placeholder="CPF, email, telefone ou chave aleatória"
              {...form.register('pixKey')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Saldo e Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Saldo e Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Saldo Inicial com Explicação */}
          <div className="space-y-2">
            <Label htmlFor="initialBalance">Saldo Inicial *</Label>
            <Input
              id="initialBalance"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...form.register('initialBalance', { valueAsNumber: true })}
            />
            <p className="text-sm text-muted-foreground">
              💡 <strong>Saldo Dinâmico:</strong> O sistema ajustará automaticamente a data do saldo inicial 
              quando transações anteriores forem adicionadas (Req. 8.2)
            </p>
            {form.formState.errors.initialBalance && (
              <p className="text-sm text-red-600">{form.formState.errors.initialBalance.message}</p>
            )}
          </div>

          {/* Cor e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor da Conta</Label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      form.watch('color') === color ? 'border-primary' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => form.setValue('color', color)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="active">Status da Conta</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={form.watch('active')}
                  onCheckedChange={(checked) => form.setValue('active', checked)}
                />
                <Label htmlFor="active">
                  {form.watch('active') ? 'Ativa' : 'Inativa'}
                </Label>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Observações ou descrição adicional da conta"
              {...form.register('description')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={createBankAccount.isPending || updateBankAccount.isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={createBankAccount.isPending || updateBankAccount.isPending}
        >
          {createBankAccount.isPending || updateBankAccount.isPending 
            ? 'Salvando...' 
            : isEditing 
              ? 'Atualizar Conta' 
              : 'Criar Conta'
          }
        </Button>
      </div>
    </form>
  )
}
