import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { FilterIcon, CalendarIcon, XIcon } from 'lucide-react'

interface ReportFiltersProps {
 dateRange: {
  startDate: string
  endDate: string
 }
 filters: {
  partnerId: string
  patientId: string
  roomId: string
  serviceId: string
  status: string
  type: string
  bankAccountId: string
  category: string
  partnershipType: string
 }
 onDateRangeChange: (dateRange: { startDate: string; endDate: string }) => void
 onFilterChange: (filters: any) => void
}

export function ReportFilters({ dateRange, filters, onDateRangeChange, onFilterChange }: ReportFiltersProps) {
 const handleClearFilters = () => {
  onFilterChange({
   partnerId: '',
   patientId: '',
   roomId: '',
   serviceId: '',
   status: 'all',
   type: 'all',
   bankAccountId: '',
   category: 'all',
   partnershipType: 'all'
  })
 }

 const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
  value !== '' && 
  !(key === 'status' && value === 'all') && 
  !(key === 'type' && value === 'all') && 
  !(key === 'category' && value === 'all') && 
  !(key === 'partnershipType' && value === 'all')
 )

 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <FilterIcon className="h-5 w-5" />
     Filtros de Relatório
    </CardTitle>
   </CardHeader>
   <CardContent className="space-y-6">
    {/* Filtros de Data */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <div className="space-y-2">
      <Label htmlFor="startDate" className="flex items-center gap-2">
       <CalendarIcon className="h-4 w-4" />
       Data Inicial
      </Label>
      <Input
       id="startDate"
       type="date"
       value={dateRange.startDate}
       onChange={(e) => onDateRangeChange({ ...dateRange, startDate: e.target.value })}
      />
     </div>
     <div className="space-y-2">
      <Label htmlFor="endDate" className="flex items-center gap-2">
       <CalendarIcon className="h-4 w-4" />
       Data Final
      </Label>
      <Input
       id="endDate"
       type="date"
       value={dateRange.endDate}
       onChange={(e) => onDateRangeChange({ ...dateRange, endDate: e.target.value })}
      />
     </div>
    </div>

    {/* Filtros Avançados */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
     <div className="space-y-2">
      <Label htmlFor="status">Status</Label>
      <Select value={filters.status} onValueChange={(value) => onFilterChange({ status: value })}>
       <SelectTrigger>
        <SelectValue placeholder="Todos os status" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todos os status</SelectItem>
        <SelectItem value="SCHEDULED">Agendado</SelectItem>
        <SelectItem value="CONFIRMED">Confirmado</SelectItem>
        <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
        <SelectItem value="COMPLETED">Concluído</SelectItem>
        <SelectItem value="CANCELLED">Cancelado</SelectItem>
       </SelectContent>
      </Select>
     </div>

     <div className="space-y-2">
      <Label htmlFor="type">Tipo de Consulta</Label>
      <Select value={filters.type} onValueChange={(value) => onFilterChange({ type: value })}>
       <SelectTrigger>
        <SelectValue placeholder="Todos os tipos" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todos os tipos</SelectItem>
        <SelectItem value="NEW">Nova</SelectItem>
        <SelectItem value="RETURN">Retorno</SelectItem>
       </SelectContent>
      </Select>
     </div>

     <div className="space-y-2">
      <Label htmlFor="partnershipType">Tipo de Parceria</Label>
      <Select value={filters.partnershipType} onValueChange={(value) => onFilterChange({ partnershipType: value })}>
       <SelectTrigger>
        <SelectValue placeholder="Todos os tipos" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todos os tipos</SelectItem>
        <SelectItem value="SUBLEASE">Sublocação</SelectItem>
        <SelectItem value="PERCENTAGE">Porcentagem</SelectItem>
        <SelectItem value="PERCENTAGE_WITH_PRODUCTS">Porcentagem com Produtos</SelectItem>
       </SelectContent>
      </Select>
     </div>

     <div className="space-y-2">
      <Label htmlFor="category">Categoria Financeira</Label>
      <Select value={filters.category} onValueChange={(value) => onFilterChange({ category: value })}>
       <SelectTrigger>
        <SelectValue placeholder="Todas as categorias" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todas as categorias</SelectItem>
        <SelectItem value="consultas">Consultas</SelectItem>
        <SelectItem value="sessoes">Sessões</SelectItem>
        <SelectItem value="produtos">Produtos</SelectItem>
        <SelectItem value="aluguel">Aluguel</SelectItem>
        <SelectItem value="marketing">Marketing</SelectItem>
        <SelectItem value="materiais">Materiais</SelectItem>
        <SelectItem value="repasses">Repasses</SelectItem>
       </SelectContent>
      </Select>
     </div>

     <div className="space-y-2">
      <Label htmlFor="partnerId">ID do Parceiro</Label>
      <Input
       id="partnerId"
       placeholder="ID do parceiro"
       value={filters.partnerId}
       onChange={(e) => onFilterChange({ partnerId: e.target.value })}
      />
     </div>

     <div className="space-y-2">
      <Label htmlFor="patientId">ID do Paciente</Label>
      <Input
       id="patientId"
       placeholder="ID do paciente"
       value={filters.patientId}
       onChange={(e) => onFilterChange({ patientId: e.target.value })}
      />
     </div>
    </div>

    {/* Botões de Ação */}
    <div className="flex items-center justify-between pt-4 border-t">
     <div className="text-sm text-muted-foreground">
      {hasActiveFilters && (
       <span className="flex items-center gap-1">
        <FilterIcon className="h-4 w-4" />
        Filtros ativos aplicados
       </span>
      )}
     </div>
     {hasActiveFilters && (
      <Button variant="outline" size="sm" onClick={handleClearFilters}>
       <XIcon className="h-4 w-4 mr-2" />
       Limpar Filtros
      </Button>
     )}
    </div>
   </CardContent>
  </Card>
 )
}
