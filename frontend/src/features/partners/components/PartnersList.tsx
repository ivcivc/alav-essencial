import React, { useState, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/ui/table'
import { usePartners, useDeletePartner, useUpdatePartner } from '@/hooks/usePartners'
import { useToast } from '@/hooks/useToast'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal'
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
  search: '',
  active: true
 })
 const [deleteModal, setDeleteModal] = useState<{
  open: boolean
  partner: Partner | null
 }>({ open: false, partner: null })
 const [toggleModal, setToggleModal] = useState<{
  open: boolean
  partner: Partner | null
  action: 'activate' | 'deactivate'
 }>({ open: false, partner: null, action: 'activate' })

 const { toast } = useToast()
 const { data: partnersData, isLoading, error } = usePartners(filters)
 const deletePartnerMutation = useDeletePartner()
 const updatePartnerMutation = useUpdatePartner()

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

 const handleSearch = useCallback((query: string) => {
  setFilters(prev => ({ ...prev, search: query, page: 1 }))
 }, [])

 const handlePartnershipTypeChange = useCallback((partnershipType: string) => {
  setFilters(prev => ({
   ...prev,
   partnershipType: partnershipType === 'all' ? undefined : partnershipType,
   page: 1,
  }))
 }, [])

 const handleActiveChange = useCallback((active: string) => {
  setFilters(prev => ({
   ...prev,
   active: active === 'all' ? undefined : active === 'true',
   page: 1,
  }))
 }, [])

 const handleDeletePartner = (partner: Partner) => {
  setDeleteModal({ open: true, partner })
 }

 const handleConfirmDelete = async () => {
  if (!deleteModal.partner) return

  try {
   await deletePartnerMutation.mutateAsync(deleteModal.partner.id)
   toast({
    title: "Sucesso!",
    description: "Parceiro excluído com sucesso.",
    variant: "success",
   })
   setDeleteModal({ open: false, partner: null })
  } catch (error) {
   toast({
    title: "Erro",
    description: "Erro ao excluir parceiro.",
    variant: "destructive",
   })
  }
 }

 const handleToggleActive = (partner: Partner) => {
  const action = partner.active ? 'deactivate' : 'activate'
  setToggleModal({ open: true, partner, action })
 }

 const handleConfirmToggle = async () => {
  if (!toggleModal.partner) return

  try {
   await updatePartnerMutation.mutateAsync({
    id: toggleModal.partner.id,
    data: { active: !toggleModal.partner.active }
   })
   toast({
    title: "Sucesso!",
    description: `Parceiro ${toggleModal.partner.active ? 'inativado' : 'ativado'} com sucesso.`,
    variant: "success",
   })
   setToggleModal({ open: false, partner: null, action: 'activate' })
  } catch (error) {
   toast({
    title: "Erro",
    description: `Erro ao ${toggleModal.partner.active ? 'inativar' : 'ativar'} parceiro.`,
    variant: "destructive",
   })
  }
 }

 if (error) {
  return (
   <Card>
    <CardContent className="p-6">
     <div className="text-center">
      Erro ao carregar parceiros. Tente novamente.
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <div className="space-y-6">
   {/* Header */}
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
     <h1 className="text-2xl font-bold">Parceiros</h1>
     <p className="text-muted-foreground">Gerencie os parceiros da clínica</p>
    </div>
    <div className="flex gap-2">
     <Button onClick={onCreatePartner}>
      <Plus className="h-4 w-4 mr-2" />
      Novo Parceiro
     </Button>
    </div>
   </div>

   {/* Search + Filters */}
   <Card>
    <CardContent className="p-4">
     <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
       <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
       <Input
        placeholder="Buscar por nome, email ou documento..."
        value={filters.search || ''}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
       />
      </div>
      <div className="flex gap-2">
       <Button
        variant={filters.active === true ? "default" : "outline"}
        size="sm"
        onClick={() => setFilters(prev => ({ ...prev, active: true, page: 1 }))}
       >
        Ativos
       </Button>
       <Button
        variant={filters.active === false ? "default" : "outline"}
        size="sm"
        onClick={() => setFilters(prev => ({ ...prev, active: false, page: 1 }))}
       >
        Inativos
       </Button>
       <Button
        variant={filters.active === undefined ? "default" : "outline"}
        size="sm"
        onClick={() => setFilters(prev => ({ ...prev, active: undefined, page: 1 }))}
       >
        Todos
       </Button>
      </div>
      
      <Select onValueChange={handlePartnershipTypeChange}>
       <SelectTrigger className="w-full md:w-48">
        <SelectValue placeholder="Tipo de Parceria" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todos os Tipos</SelectItem>
        <SelectItem value="SUBLEASE">Sublocação</SelectItem>
        <SelectItem value="PERCENTAGE">Porcentagem</SelectItem>
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
    <CardHeader>
     <CardTitle>
      Lista de Parceiros
      {partnersData && (
       <span className="text-sm font-normal text-muted-foreground ml-2">
        ({partnersData.total} {partnersData.total === 1 ? 'parceiro' : 'parceiros'})
       </span>
      )}
     </CardTitle>
    </CardHeader>
    <CardContent>
     {isLoading ? (
      <div className="text-center py-8">
       <div className="animate-spin rounded-full h-8 w-8 border-border mx-auto"></div>
       <p className="mt-2 text-muted-foreground">Carregando parceiros...</p>
      </div>
     ) : !partnersData?.partners.length ? (
      <div className="text-center py-8">
       <p className="text-muted-foreground">Nenhum parceiro encontrado.</p>
       <Button onClick={onCreatePartner} className="mt-4">
        <Plus className="h-4 w-4 mr-2" />
        Cadastrar Primeiro Parceiro
       </Button>
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
        {partnersData.partners.map((partner) => (
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
           <StatusBadge active={partner.active} />
          </TableCell>
          <TableCell className="text-right">
           <div className="flex justify-end gap-2">
            <Button
             variant="ghost"
             size="sm"
             onClick={() => onViewPartner(partner)}
            >
             <Eye className="h-4 w-4" />
            </Button>
            <Button
             variant="ghost"
             size="sm"
             onClick={() => onEditPartner(partner)}
            >
             <Edit className="h-4 w-4" />
            </Button>
            <Button
             variant="ghost"
             size="sm"
             onClick={() => handleToggleActive(partner)}
            >
             {partner.active ? (
              <ToggleRight className="h-4 w-4 text-green-600" />
             ) : (
              <ToggleLeft className="h-4 w-4 text-gray-400" />
             )}
            </Button>
            <Button
             variant="ghost"
             size="sm"
             onClick={() => handleDeletePartner(partner)}
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

   <ConfirmDeleteModal
    open={deleteModal.open}
    onOpenChange={(open) => setDeleteModal(prev => ({ ...prev, open }))}
    onConfirm={handleConfirmDelete}
    itemName={deleteModal.partner?.fullName || ''}
    itemType="parceiro"
    isLoading={deletePartnerMutation.isPending}
    warnings={[
     "Todos os dados do parceiro serão removidos permanentemente",
     "Agendamentos associados podem ser afetados"
    ]}
   />

   <ConfirmDeleteModal
    open={toggleModal.open}
    onOpenChange={(open) => setToggleModal({ open, partner: toggleModal.partner, action: toggleModal.action })}
    onConfirm={handleConfirmToggle}
    itemName={toggleModal.partner?.fullName || ''}
    itemType="parceiro"
    isLoading={updatePartnerMutation.isPending}
    title={toggleModal.action === 'activate' ? 'Ativar Parceiro' : 'Inativar Parceiro'}
    description={`Tem certeza que deseja ${toggleModal.action === 'activate' ? 'ativar' : 'inativar'} este parceiro?`}
    confirmText={toggleModal.action === 'activate' ? 'Ativar' : 'Inativar'}
    warnings={[
     `O parceiro será ${toggleModal.action === 'activate' ? 'ativado' : 'inativado'} no sistema`,
     "Esta ação pode ser revertida a qualquer momento"
    ]}
   />
  </div>
 )
}