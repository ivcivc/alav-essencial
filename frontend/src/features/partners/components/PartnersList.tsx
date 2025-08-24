import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
 Users, 
 Plus, 
 Search, 
 Filter, 
 Eye, 
 Edit, 
 Trash2,
 Clock,
 DollarSign,
 CalendarCheck,
 UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePartners, useDeletePartner } from '@/hooks/usePartners'
import { Partner } from '@/types/entities'
import { PartnerFilters } from '@/services/partners'

interface PartnersListProps {
 onCreatePartner: () => void
 onEditPartner: (partner: Partner) => void
 onViewPartner: (partner: Partner) => void
}

const PARTNERSHIP_TYPE_LABELS = {
 SUBLEASE: 'Sublocação',
 PERCENTAGE: 'Porcentagem Fixa',
 PERCENTAGE_WITH_PRODUCTS: 'Porcentagem c/ Produtos',
}

const PARTNERSHIP_TYPE_COLORS = {
 SUBLEASE: 'bg-blue-100 text-primary',
 PERCENTAGE: 'bg-green-100 text-green-800',
 PERCENTAGE_WITH_PRODUCTS: 'bg-purple-100 text-purple-800',
}

export function PartnersList({ onCreatePartner, onEditPartner, onViewPartner }: PartnersListProps) {
 const [filters, setFilters] = useState<PartnerFilters>({
  page: 1,
  limit: 10,
  active: true,
 })

 const { data: partnersData, isLoading } = usePartners(filters)
 const deletePartner = useDeletePartner()

 const handleSearchChange = (search: string) => {
  setFilters(prev => ({ ...prev, search: search || undefined, page: 1 }))
 }

 const handlePartnershipTypeChange = (partnershipType: string) => {
  setFilters(prev => ({
   ...prev,
   partnershipType: partnershipType === 'all' ? undefined : partnershipType,
   page: 1,
  }))
 }

 const handleActiveChange = (active: string) => {
  setFilters(prev => ({
   ...prev,
   active: active === 'all' ? undefined : active === 'true',
   page: 1,
  }))
 }

 const handlePageChange = (page: number) => {
  setFilters(prev => ({ ...prev, page }))
 }

 const handleDeletePartner = (partner: Partner) => {
  if (window.confirm(`Tem certeza que deseja excluir o parceiro "${partner.fullName}"?`)) {
   deletePartner.mutate(partner.id)
  }
 }

 const formatPartnershipValue = (partner: Partner) => {
  switch (partner.partnershipType) {
   case 'SUBLEASE':
    return partner.subleaseAmount && typeof partner.subleaseAmount === 'number'
     ? `R$ ${partner.subleaseAmount.toFixed(2)}/mês`
     : 'Não definido'
   case 'PERCENTAGE':
    return partner.percentageAmount && typeof partner.percentageAmount === 'number'
     ? `R$ ${partner.percentageAmount.toFixed(2)}/serviço`
     : 'Não definido'
   case 'PERCENTAGE_WITH_PRODUCTS':
    return partner.percentageRate && typeof partner.percentageRate === 'number'
     ? `${partner.percentageRate}% do faturamento`
     : 'Não definido'
   default:
    return 'Não definido'
  }
 }

 const partners = partnersData?.partners || []
 const totalPages = partnersData?.totalPages || 1

 if (isLoading) {
  return (
   <Card>
    <CardContent className="p-6">
     <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2  mx-auto mb-4"></div>
      <p>Carregando parceiros...</p>
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <div className="space-y-6">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-2xl font-bold text-muted-foreground">Parceiros</h1>
     <p className="text-muted-foreground">Gerencie os parceiros da clínica</p>
    </div>
    <Button onClick={onCreatePartner}>
     <Plus className="h-4 w-4 mr-2" />
     Novo Parceiro
    </Button>
   </div>

   {/* Stats Cards */}
   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <Card>
     <CardContent className="p-6">
      <div className="flex items-center">
       <Users className="h-8 w-8 text-primary" />
       <div className="ml-4">
        <p className="text-2xl font-bold text-muted-foreground">
         {partnersData?.total || 0}
        </p>
        <p className="text-muted-foreground">Total de Parceiros</p>
       </div>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="p-6">
      <div className="flex items-center">
       <UserCheck className="h-8 w-8 text-primary" />
       <div className="ml-4">
        <p className="text-2xl font-bold text-muted-foreground">
         {partners.filter(p => p.active).length}
        </p>
        <p className="text-muted-foreground">Ativos</p>
       </div>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="p-6">
      <div className="flex items-center">
       <DollarSign className="h-8 w-8 text-primary" />
       <div className="ml-4">
        <p className="text-2xl font-bold text-muted-foreground">
         {partners.filter(p => p.partnershipType === 'SUBLEASE').length}
        </p>
        <p className="text-muted-foreground">Sublocação</p>
       </div>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="p-6">
      <div className="flex items-center">
       <CalendarCheck className="h-8 w-8 text-primary" />
       <div className="ml-4">
        <p className="text-2xl font-bold text-muted-foreground">
         {partners.filter(p => p.partnershipType !== 'SUBLEASE').length}
        </p>
        <p className="text-muted-foreground">Por Produção</p>
       </div>
      </div>
     </CardContent>
    </Card>
   </div>

   {/* Filters */}
   <Card>
    <CardContent className="p-6">
     <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
       <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
         placeholder="Buscar por nome, email ou documento..."
         onChange={(e) => handleSearchChange(e.target.value)}
         className="pl-10"
        />
       </div>
      </div>
      
      <Select onValueChange={handlePartnershipTypeChange}>
       <SelectTrigger className="w-full md:w-48">
        <SelectValue placeholder="Tipo de Parceria" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todos os Tipos</SelectItem>
        <SelectItem value="SUBLEASE">Sublocação</SelectItem>
        <SelectItem value="PERCENTAGE">Porcentagem Fixa</SelectItem>
        <SelectItem value="PERCENTAGE_WITH_PRODUCTS">Porcentagem c/ Produtos</SelectItem>
       </SelectContent>
      </Select>

      <Select onValueChange={handleActiveChange}>
       <SelectTrigger className="w-full md:w-32">
        <SelectValue placeholder="Status" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todos</SelectItem>
        <SelectItem value="true">Ativos</SelectItem>
        <SelectItem value="false">Inativos</SelectItem>
       </SelectContent>
      </Select>
     </div>
    </CardContent>
   </Card>

   {/* Partners Table */}
   <Card>
    <CardContent className="p-0">
     {partners.length === 0 ? (
      <div className="text-center py-12">
       <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
       <h3 className="text-lg font-medium text-muted-foreground mb-2">
        Nenhum parceiro encontrado
       </h3>
       <p className="text-muted-foreground mb-4">
        {filters.search ? 'Tente ajustar os filtros de busca' : 'Comece criando seu primeiro parceiro'}
       </p>
       {!filters.search && (
        <Button onClick={onCreatePartner}>
         <Plus className="h-4 w-4 mr-2" />
         Criar Primeiro Parceiro
        </Button>
       )}
      </div>
     ) : (
      <Table>
       <TableHeader>
        <TableRow>
         <TableHead>Nome</TableHead>
         <TableHead>Contato</TableHead>
         <TableHead>Tipo de Parceria</TableHead>
         <TableHead>Valor</TableHead>
         <TableHead>Status</TableHead>
         <TableHead className="text-right">Ações</TableHead>
        </TableRow>
       </TableHeader>
       <TableBody>
        {partners.map((partner) => (
         <TableRow key={partner.id}>
          <TableCell>
           <div>
            <div className="font-medium text-muted-foreground">
             {partner.fullName}
            </div>
            <div className="text-sm text-muted-foreground">
             {partner.document}
            </div>
           </div>
          </TableCell>
          
          <TableCell>
           <div>
            <div className="text-sm text-muted-foreground">
             {partner.email}
            </div>
            <div className="text-sm text-muted-foreground">
             {partner.phone}
            </div>
           </div>
          </TableCell>

          <TableCell>
           <Badge 
            variant="secondary"
            className={PARTNERSHIP_TYPE_COLORS[partner.partnershipType]}
           >
            {PARTNERSHIP_TYPE_LABELS[partner.partnershipType]}
           </Badge>
          </TableCell>

          <TableCell>
           <div className="text-sm font-medium">
            {formatPartnershipValue(partner)}
           </div>
          </TableCell>

          <TableCell>
           <Badge variant={partner.active ? 'default' : 'secondary'}>
            {partner.active ? 'Ativo' : 'Inativo'}
           </Badge>
          </TableCell>

          <TableCell className="text-right">
           <div className="flex items-center justify-end space-x-2">
            <Button
             size="sm"
             variant="ghost"
             onClick={() => onViewPartner(partner)}
            >
             <Eye className="h-4 w-4" />
            </Button>
            <Button
             size="sm"
             variant="ghost"
             onClick={() => onEditPartner(partner)}
            >
             <Edit className="h-4 w-4" />
            </Button>
            <Button
             size="sm"
             variant="ghost"
             onClick={() => handleDeletePartner(partner)}
             className="text-red-600 hover:"
            >
             <Trash2 className="h-4 w-4" />
            </Button>
           </div>
          </TableCell>
         </TableRow>
        ))}
       </TableBody>
      </Table>
     )}
    </CardContent>
   </Card>

   {/* Pagination */}
   {totalPages > 1 && (
    <div className="flex items-center justify-between">
     <p className="text-sm text-muted-foreground">
      Página {filters.page} de {totalPages} ({partnersData?.total} parceiros)
     </p>
     <div className="flex space-x-2">
      <Button
       variant="outline"
       size="sm"
       onClick={() => handlePageChange(filters.page! - 1)}
       disabled={filters.page === 1}
      >
       Anterior
      </Button>
      <Button
       variant="outline"
       size="sm"
       onClick={() => handlePageChange(filters.page! + 1)}
       disabled={filters.page === totalPages}
      >
       Próxima
      </Button>
     </div>
    </div>
   )}
  </div>
 )
}
