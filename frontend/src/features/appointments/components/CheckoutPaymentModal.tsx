import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Textarea } from '../../../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { useBankAccounts } from '../../../hooks/useFinancial'
import { useToast } from '../../../hooks/useToast'
import { CreditCard, DollarSign, Calculator, Receipt } from 'lucide-react'
import type { Appointment } from '../../../types/entities'

const checkoutPaymentSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_TRANSFER']),
  bankAccountId: z.string().min(1, 'Conta bancária é obrigatória'),
  totalAmount: z.number().min(0, 'Valor deve ser positivo'),
  discountAmount: z.number().min(0).optional(),
  additionalCharges: z.number().min(0).optional(),
  notes: z.string().optional()
})

type CheckoutPaymentData = z.infer<typeof checkoutPaymentSchema>

interface CheckoutPaymentModalProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CheckoutPaymentData) => Promise<void>
  isLoading?: boolean
}

const paymentMethodLabels = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Cartão de Crédito', 
  DEBIT_CARD: 'Cartão de Débito',
  PIX: 'PIX',
  BANK_TRANSFER: 'Transferência Bancária'
}

const paymentMethodIcons = {
  CASH: DollarSign,
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  PIX: Receipt,
  BANK_TRANSFER: Receipt
}

export function CheckoutPaymentModal({
  appointment,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: CheckoutPaymentModalProps) {
  const { toast } = useToast()
  const { data: bankAccounts, isLoading: loadingAccounts } = useBankAccounts()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<CheckoutPaymentData>({
    resolver: zodResolver(checkoutPaymentSchema),
    defaultValues: {
      totalAmount: appointment?.productService?.salePrice ? Number(appointment.productService.salePrice) : 0,
      discountAmount: 0,
      additionalCharges: 0
    }
  })

  // Observar mudanças nos valores para calcular total
  const totalAmount = watch('totalAmount') || 0
  const discountAmount = watch('discountAmount') || 0
  const additionalCharges = watch('additionalCharges') || 0
  const paymentMethod = watch('paymentMethod')

  const finalAmount = totalAmount - discountAmount + additionalCharges

  React.useEffect(() => {
    if (appointment?.productService?.salePrice) {
      setValue('totalAmount', Number(appointment.productService.salePrice))
    }
  }, [appointment, setValue])

  const handleFormSubmit = async (data: CheckoutPaymentData) => {
    try {
      await onSubmit({
        ...data,
        totalAmount: finalAmount
      })
      
      toast({
        title: "Checkout realizado com sucesso!",
        description: "Lançamentos financeiros foram criados automaticamente.",
      })
      
      reset()
      onClose()
    } catch (error) {
      toast({
        title: "Erro no checkout",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

  if (!appointment) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Checkout com Processamento Financeiro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Agendamento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Detalhes do Atendimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Paciente:</span>
                  <p>{appointment?.patient?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Profissional:</span>
                  <p>{appointment?.partner?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Serviço:</span>
                  <p>{appointment?.productService?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Valor Original:</span>
                  <p className="text-green-600 font-semibold">
                    R$ {appointment?.productService?.salePrice ? Number(appointment.productService.salePrice).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Valores */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Cálculo de Valores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="totalAmount">Valor do Serviço</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      step="0.01"
                      {...register('totalAmount', { valueAsNumber: true })}
                    />
                    {errors.totalAmount && (
                      <p className="text-sm text-red-500">{errors.totalAmount.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="discountAmount">Desconto</Label>
                    <Input
                      id="discountAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('discountAmount', { valueAsNumber: true })}
                    />
                    {errors.discountAmount && (
                      <p className="text-sm text-red-500">{errors.discountAmount.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="additionalCharges">Taxas Adicionais</Label>
                    <Input
                      id="additionalCharges"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('additionalCharges', { valueAsNumber: true })}
                    />
                    {errors.additionalCharges && (
                      <p className="text-sm text-red-500">{errors.additionalCharges.message}</p>
                    )}
                  </div>
                </div>

                <hr className="border-gray-200 my-4" />

                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Valor Final:</span>
                  <span className="text-green-600">
                    R$ {finalAmount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Forma de Pagamento */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value) => setValue('paymentMethod', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(paymentMethodLabels).map(([value, label]) => {
                        const Icon = paymentMethodIcons[value as keyof typeof paymentMethodIcons]
                        return (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {errors.paymentMethod && (
                    <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bankAccountId">Conta de Destino</Label>
                  <Select
                    value={watch('bankAccountId')}
                    onValueChange={(value) => setValue('bankAccountId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta bancária" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex flex-col">
                            <span>{account.name}</span>
                            <span className="text-xs text-gray-500">{account.bank}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bankAccountId && (
                    <p className="text-sm text-red-500">{errors.bankAccountId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações sobre o pagamento..."
                    {...register('notes')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || loadingAccounts || !paymentMethod}
                className="min-w-[150px]"
              >
                {isLoading ? (
                  "Processando..."
                ) : (
                  `Finalizar - R$ ${finalAmount.toFixed(2)}`
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
