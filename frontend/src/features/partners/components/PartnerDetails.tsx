import React from 'react'
import { 
  ArrowLeft, 
  Edit, 
  User, 
  MapPin, 
  CreditCard, 
  Handshake,
  Mail,
  Phone,
  FileText,
  Calendar,
  DollarSign,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePartner } from '@/hooks/usePartners'
import { Partner } from '@/types/entities'
import { PartnerAvailabilityComponent } from './PartnerAvailability'
import { PartnerBlockedDatesComponent } from './PartnerBlockedDates'
import { PartnerServicesComponent } from './PartnerServices'

interface PartnerDetailsProps {
  partnerId: string
  onBack: () => void
  onEdit: (partner: Partner) => void
}

const PARTNERSHIP_TYPE_LABELS = {
  SUBLEASE: 'Sublocação',
  PERCENTAGE: 'Porcentagem Fixa',
  PERCENTAGE_WITH_PRODUCTS: 'Porcentagem com Produtos',
}

const PARTNERSHIP_TYPE_COLORS = {
  SUBLEASE: 'bg-blue-100 text-blue-800',
  PERCENTAGE: 'bg-green-100 text-green-800',
  PERCENTAGE_WITH_PRODUCTS: 'bg-purple-100 text-purple-800',
}

export function PartnerDetails({ partnerId, onBack, onEdit }: PartnerDetailsProps) {
  const { data: partner, isLoading } = usePartner(partnerId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando dados do parceiro...</p>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">Parceiro não encontrado</p>
        </div>
      </div>
    )
  }

  const formatPartnershipDetails = () => {
    switch (partner.partnershipType) {
      case 'SUBLEASE':
        return {
          title: 'Sublocação',
          details: [
            `Valor: R$ ${(typeof partner.subleaseAmount === 'number' ? partner.subleaseAmount.toFixed(2) : '0,00')}/mês`,
            `Vencimento: Dia ${partner.subleasePaymentDay || 'não definido'}`,
          ]
        }
      case 'PERCENTAGE':
        return {
          title: 'Porcentagem Fixa',
          details: [
            `Valor por serviço: R$ ${(typeof partner.percentageAmount === 'number' ? partner.percentageAmount.toFixed(2) : '0,00')}`,
          ]
        }
      case 'PERCENTAGE_WITH_PRODUCTS':
        return {
          title: 'Porcentagem com Produtos',
          details: [
            `Taxa: ${partner.percentageRate || 0}% do faturamento`,
          ]
        }
      default:
        return { title: 'Não definido', details: [] }
    }
  }

  const partnershipInfo = formatPartnershipDetails()

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{partner.fullName}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <Badge 
                variant="secondary"
                className={PARTNERSHIP_TYPE_COLORS[partner.partnershipType]}
              >
                {PARTNERSHIP_TYPE_LABELS[partner.partnershipType]}
              </Badge>
              <Badge variant={partner.active ? 'default' : 'secondary'}>
                {partner.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => onEdit(partner)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
          <TabsTrigger value="blocked-dates">Datas Bloqueadas</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                  <p className="text-gray-900">{partner.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">CPF/CNPJ</label>
                  <p className="text-gray-900 font-mono">{partner.document}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{partner.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telefone</label>
                    <p className="text-gray-900">{partner.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cadastrado em</label>
                    <p className="text-gray-900">{formatDate(partner.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {partner.street ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Logradouro</label>
                      <p className="text-gray-900">
                        {partner.street}
                        {partner.number && `, ${partner.number}`}
                        {partner.complement && ` - ${partner.complement}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Bairro</label>
                      <p className="text-gray-900">{partner.neighborhood || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Cidade/UF</label>
                      <p className="text-gray-900">
                        {partner.city || 'Não informado'}
                        {partner.state && ` - ${partner.state}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">CEP</label>
                      <p className="text-gray-900 font-mono">{partner.zipCode || 'Não informado'}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-4">Endereço não cadastrado</p>
                )}
              </CardContent>
            </Card>

            {/* Banking & Partnership */}
            <div className="space-y-6">
              {/* Banking Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Dados Bancários
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {partner.bank ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Banco</label>
                        <p className="text-gray-900 dark:text-gray-100">{partner.bank}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Agência</label>
                          <p className="text-gray-900 dark:text-gray-100 font-mono">{partner.agency || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Conta</label>
                          <p className="text-gray-900 dark:text-gray-100 font-mono">{partner.account || 'N/A'}</p>
                        </div>
                      </div>
                      {partner.pix && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Chave PIX</label>
                          <p className="text-gray-900 dark:text-gray-100 font-mono">{partner.pix}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Dados bancários não cadastrados</p>
                  )}
                </CardContent>
              </Card>

              {/* Partnership Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Handshake className="h-5 w-5" />
                    Detalhes da Parceria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tipo</label>
                    <Badge 
                      variant="secondary"
                      className={`${PARTNERSHIP_TYPE_COLORS[partner.partnershipType]} ml-2`}
                    >
                      {partnershipInfo.title}
                    </Badge>
                  </div>
                  {partnershipInfo.details.map((detail, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <p className="text-gray-900">{detail}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability">
          <PartnerAvailabilityComponent partnerId={partnerId} />
        </TabsContent>

        {/* Blocked Dates Tab */}
        <TabsContent value="blocked-dates">
          <PartnerBlockedDatesComponent partnerId={partnerId} />
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <PartnerServicesComponent partnerId={partnerId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
