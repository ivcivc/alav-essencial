import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreatePartnerData, UpdatePartnerData } from '@/services/partners'
import { Partner } from '@/types/entities'

// Validation Schema
const partnerSchema = z.object({
 // Personal Info
 fullName: z.string().min(1, 'Nome completo é obrigatório'),
 document: z.string().min(1, 'CPF/CNPJ é obrigatório'),
 phone: z.string().min(1, 'Telefone é obrigatório'),
 email: z.string().email('Email inválido'),

 // Address
 street: z.string().optional(),
 number: z.string().optional(),
 complement: z.string().optional(),
 neighborhood: z.string().optional(),
 city: z.string().optional(),
 state: z.string().optional(),
 zipCode: z.string().optional(),

 // Banking
 bank: z.string().optional(),
 agency: z.string().optional(),
 account: z.string().optional(),
 pix: z.string().optional(),

 // Partnership
 partnershipType: z.enum(['SUBLEASE', 'PERCENTAGE', 'PERCENTAGE_WITH_PRODUCTS'], {
  required_error: 'Tipo de parceria é obrigatório'
 }),
 subleaseAmount: z.number().optional(),
 subleasePaymentDay: z.number().min(1).max(31).optional(),
 percentageAmount: z.number().optional(),
 percentageRate: z.number().min(0).max(100).optional(),
})

type PartnerFormData = z.infer<typeof partnerSchema>

interface PartnerFormProps {
 partner?: Partner
 onSubmit: (data: CreatePartnerData | UpdatePartnerData) => void
 onCancel: () => void
 isLoading?: boolean
}

const PARTNERSHIP_TYPES = [
 { value: 'SUBLEASE', label: 'Sublocação' },
 { value: 'PERCENTAGE', label: 'Porcentagem Fixa' },
 { value: 'PERCENTAGE_WITH_PRODUCTS', label: 'Porcentagem com Produtos' },
]

const BRAZILIAN_STATES = [
 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export function PartnerForm({ partner, onSubmit, onCancel, isLoading }: PartnerFormProps) {
 const {
  register,
  handleSubmit,
  watch,
  setValue,
  formState: { errors },
 } = useForm<PartnerFormData>({
  resolver: zodResolver(partnerSchema),
  defaultValues: partner ? {
   fullName: partner.fullName,
   document: partner.document,
   phone: partner.phone,
   email: partner.email,
   street: partner.street || '',
   number: partner.number || '',
   complement: partner.complement || '',
   neighborhood: partner.neighborhood || '',
   city: partner.city || '',
   state: partner.state || '',
   zipCode: partner.zipCode || '',
   bank: partner.bank || '',
   agency: partner.agency || '',
   account: partner.account || '',
   pix: partner.pix || '',
   partnershipType: partner.partnershipType,
   subleaseAmount: partner.subleaseAmount || undefined,
   subleasePaymentDay: partner.subleasePaymentDay || undefined,
   percentageAmount: partner.percentageAmount || undefined,
   percentageRate: partner.percentageRate || undefined,
  } : {}
 })

 const partnershipType = watch('partnershipType')

 const handleFormSubmit = (data: PartnerFormData) => {
  onSubmit(data)
 }

 return (
  <div className="max-w-4xl mx-auto space-y-6">
   <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
    <Tabs defaultValue="personal" className="w-full">
     <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
      <TabsTrigger value="address">Endereço</TabsTrigger>
      <TabsTrigger value="banking">Dados Bancários</TabsTrigger>
      <TabsTrigger value="partnership">Parceria</TabsTrigger>
     </TabsList>

     {/* Personal Info Tab */}
     <TabsContent value="personal">
      <Card>
       <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div>
          <Label htmlFor="fullName">Nome Completo *</Label>
          <Input
           id="fullName"
           {...register('fullName')}
           placeholder="Nome completo do parceiro"
          />
          {errors.fullName && (
           <p className="text-sm  mt-1">{errors.fullName.message}</p>
          )}
         </div>

         <div>
          <Label htmlFor="document">CPF/CNPJ *</Label>
          <Input
           id="document"
           {...register('document')}
           placeholder="000.000.000-00"
          />
          {errors.document && (
           <p className="text-sm  mt-1">{errors.document.message}</p>
          )}
         </div>

         <div>
          <Label htmlFor="phone">Telefone *</Label>
          <Input
           id="phone"
           {...register('phone')}
           placeholder="(11) 99999-9999"
          />
          {errors.phone && (
           <p className="text-sm  mt-1">{errors.phone.message}</p>
          )}
         </div>

         <div>
          <Label htmlFor="email">Email *</Label>
          <Input
           id="email"
           type="email"
           {...register('email')}
           placeholder="email@exemplo.com"
          />
          {errors.email && (
           <p className="text-sm  mt-1">{errors.email.message}</p>
          )}
         </div>
        </div>
       </CardContent>
      </Card>
     </TabsContent>

     {/* Address Tab */}
     <TabsContent value="address">
      <Card>
       <CardHeader>
        <CardTitle>Endereço</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="md:col-span-2">
          <Label htmlFor="street">Logradouro</Label>
          <Input
           id="street"
           {...register('street')}
           placeholder="Rua, Avenida, etc."
          />
         </div>

         <div>
          <Label htmlFor="number">Número</Label>
          <Input
           id="number"
           {...register('number')}
           placeholder="123"
          />
         </div>

         <div>
          <Label htmlFor="complement">Complemento</Label>
          <Input
           id="complement"
           {...register('complement')}
           placeholder="Apto, Sala, etc."
          />
         </div>

         <div>
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
           id="neighborhood"
           {...register('neighborhood')}
           placeholder="Nome do bairro"
          />
         </div>

         <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
           id="city"
           {...register('city')}
           placeholder="Nome da cidade"
          />
         </div>

         <div>
          <Label htmlFor="state">Estado</Label>
          <Select onValueChange={(value) => setValue('state', value)}>
           <SelectTrigger>
            <SelectValue placeholder="UF" />
           </SelectTrigger>
           <SelectContent>
            {BRAZILIAN_STATES.map((state) => (
             <SelectItem key={state} value={state}>
              {state}
             </SelectItem>
            ))}
           </SelectContent>
          </Select>
         </div>

         <div>
          <Label htmlFor="zipCode">CEP</Label>
          <Input
           id="zipCode"
           {...register('zipCode')}
           placeholder="00000-000"
          />
         </div>
        </div>
       </CardContent>
      </Card>
     </TabsContent>

     {/* Banking Tab */}
     <TabsContent value="banking">
      <Card>
       <CardHeader>
        <CardTitle>Dados Bancários</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div>
          <Label htmlFor="bank">Banco</Label>
          <Input
           id="bank"
           {...register('bank')}
           placeholder="Nome do banco"
          />
         </div>

         <div>
          <Label htmlFor="agency">Agência</Label>
          <Input
           id="agency"
           {...register('agency')}
           placeholder="0000"
          />
         </div>

         <div>
          <Label htmlFor="account">Conta</Label>
          <Input
           id="account"
           {...register('account')}
           placeholder="00000-0"
          />
         </div>

         <div>
          <Label htmlFor="pix">Chave PIX</Label>
          <Input
           id="pix"
           {...register('pix')}
           placeholder="CPF, email, telefone ou chave aleatória"
          />
         </div>
        </div>
       </CardContent>
      </Card>
     </TabsContent>

     {/* Partnership Tab */}
     <TabsContent value="partnership">
      <Card>
       <CardHeader>
        <CardTitle>Configuração da Parceria</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
        <div>
         <Label htmlFor="partnershipType">Tipo de Parceria *</Label>
         <Select 
          value={partnershipType || ''}
          onValueChange={(value) => setValue('partnershipType', value as any)}
         >
          <SelectTrigger>
           <SelectValue placeholder="Selecione o tipo de parceria" />
          </SelectTrigger>
          <SelectContent>
           {PARTNERSHIP_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
             {type.label}
            </SelectItem>
           ))}
          </SelectContent>
         </Select>
         {errors.partnershipType && (
          <p className="text-sm  mt-1">{errors.partnershipType.message}</p>
         )}
        </div>

        {/* Sublease Fields */}
        {partnershipType === 'SUBLEASE' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
           <Label htmlFor="subleaseAmount">Valor da Sublocação (R$)</Label>
           <Input
            id="subleaseAmount"
            type="number"
            step="0.01"
            {...register('subleaseAmount', { valueAsNumber: true })}
            placeholder="0.00"
           />
          </div>

          <div>
           <Label htmlFor="subleasePaymentDay">Dia do Vencimento</Label>
           <Input
            id="subleasePaymentDay"
            type="number"
            min="1"
            max="31"
            {...register('subleasePaymentDay', { valueAsNumber: true })}
            placeholder="5"
           />
          </div>
         </div>
        )}

        {/* Percentage Fields */}
        {partnershipType === 'PERCENTAGE' && (
         <div>
          <Label htmlFor="percentageAmount">Valor Fixo por Serviço (R$)</Label>
          <Input
           id="percentageAmount"
           type="number"
           step="0.01"
           {...register('percentageAmount', { valueAsNumber: true })}
           placeholder="0.00"
          />
         </div>
        )}

        {/* Percentage with Products Fields */}
        {partnershipType === 'PERCENTAGE_WITH_PRODUCTS' && (
         <div>
          <Label htmlFor="percentageRate">Taxa de Porcentagem (%)</Label>
          <Input
           id="percentageRate"
           type="number"
           min="0"
           max="100"
           step="0.01"
           {...register('percentageRate', { valueAsNumber: true })}
           placeholder="0.00"
          />
         </div>
        )}

        {/* Partnership Type Descriptions */}
        <div className=" p-4 rounded-lg">
         <h4 className="font-medium text-primary mb-2">Sobre os tipos de parceria:</h4>
         <ul className="text-sm text-primary space-y-1">
          <li><strong>Sublocação:</strong> Valor fixo mensal independente do faturamento</li>
          <li><strong>Porcentagem Fixa:</strong> Valor fixo por atendimento/serviço realizado</li>
          <li><strong>Porcentagem com Produtos:</strong> Porcentagem sobre o faturamento total</li>
         </ul>
        </div>
       </CardContent>
      </Card>
     </TabsContent>
    </Tabs>

    {/* Action Buttons */}
    <div className="flex justify-end space-x-4">
     <Button type="button" variant="outline" onClick={onCancel}>
      Cancelar
     </Button>
     <Button type="submit" disabled={isLoading}>
      {isLoading ? 'Salvando...' : partner ? 'Atualizar' : 'Criar'} Parceiro
     </Button>
    </div>
   </form>
  </div>
 )
}
