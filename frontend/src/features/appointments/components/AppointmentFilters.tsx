import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { usePartners } from '../../../hooks/usePartners'
import { useRooms } from '../../../hooks/useRooms'
import { useProducts } from '../../../hooks/useProducts'
import { AppointmentStatus, AppointmentType } from '../../../types/entities'
import { Filter, X, Users, MapPin, Briefcase, Activity, Calendar } from 'lucide-react'

interface AppointmentFiltersProps {
 filters: {
  partnerId?: string
  roomId?: string
  productServiceId?: string
  status?: AppointmentStatus
  type?: AppointmentType
 }
 onFiltersChange: (filters: AppointmentFiltersProps['filters']) => void
 onClearFilters: () => void
}

const STATUS_OPTIONS = [
 { value: 'SCHEDULED', label: 'Agendado' },
 { value: 'CONFIRMED', label: 'Confirmado' },
 { value: 'IN_PROGRESS', label: 'Em andamento' },
 { value: 'COMPLETED', label: 'Concluído' },
 { value: 'CANCELLED', label: 'Cancelado' },
 { value: 'NO_SHOW', label: 'Não compareceu' },
]

const TYPE_OPTIONS = [
 { value: 'CONSULTATION', label: 'Consulta' },
 { value: 'EXAM', label: 'Exame' },
 { value: 'PROCEDURE', label: 'Procedimento' },
 { value: 'RETURN', label: 'Retorno' },
]

export function AppointmentFilters({
 filters,
 onFiltersChange,
 onClearFilters
}: AppointmentFiltersProps) {
 // Buscar dados para os selects
 const { data: partnersData } = usePartners({ active: true })
 const { data: roomsData } = useRooms({ active: true })
 const { data: servicesData } = useProducts({ type: 'SERVICE', active: true })

 const partners = partnersData?.partners || []
 const rooms = roomsData?.rooms || []
 const services = servicesData?.productServices || []

 const updateFilter = (key: keyof typeof filters, value: string | undefined) => {
  onFiltersChange({
   ...filters,
   [key]: (value === 'all' || !value) ? undefined : value
  })
 }

 const getActiveFiltersCount = () => {
  return Object.values(filters).filter(value => value !== undefined && value !== '').length
 }

 const getSelectedPartnerName = () => {
  if (!filters.partnerId) return undefined
  return partners.find(p => p.id === filters.partnerId)?.fullName
 }

 const getSelectedRoomName = () => {
  if (!filters.roomId) return undefined
  return rooms.find(r => r.id === filters.roomId)?.name
 }

 const getSelectedServiceName = () => {
  if (!filters.productServiceId) return undefined
  return services.find(s => s.id === filters.productServiceId)?.name
 }

 const getSelectedStatusLabel = () => {
  if (!filters.status) return undefined
  return STATUS_OPTIONS.find(s => s.value === filters.status)?.label
 }

 const getSelectedTypeLabel = () => {
  if (!filters.type) return undefined
  return TYPE_OPTIONS.find(t => t.value === filters.type)?.label
 }

 const activeFiltersCount = getActiveFiltersCount()

 return (
  <Card>
   <CardHeader>
    <div className="flex items-center justify-between">
     <CardTitle className="flex items-center gap-2">
      <Filter className="w-5 h-5" />
      Filtros
      {activeFiltersCount > 0 && (
       <Badge variant="secondary" className="ml-2">
        {activeFiltersCount}
       </Badge>
      )}
     </CardTitle>
     
     {activeFiltersCount > 0 && (
      <Button
       variant="outline"
       size="sm"
       onClick={onClearFilters}
       className="text-red-600 hover:"
      >
       <X className="w-4 h-4 mr-1" />
       Limpar
      </Button>
     )}
    </div>
   </CardHeader>
   
   <CardContent className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
     {/* Filtro por Profissional */}
     <div className="space-y-2">
      <Label htmlFor="partner-select" className="flex items-center gap-1">
       <Users className="w-4 h-4" />
       Profissional
      </Label>
      <Select
       value={filters.partnerId || 'all'}
       onValueChange={(value) => updateFilter('partnerId', value)}
      >
       <SelectTrigger id="partner-select">
        <SelectValue placeholder="Todos os profissionais" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todos os profissionais</SelectItem>
        {partners.map(partner => (
         <SelectItem key={partner.id} value={partner.id}>
          {partner.fullName}
         </SelectItem>
        ))}
       </SelectContent>
      </Select>
     </div>

     {/* Filtro por Sala */}
     <div className="space-y-2">
      <Label htmlFor="room-select" className="flex items-center gap-1">
       <MapPin className="w-4 h-4" />
       Sala
      </Label>
      <Select
       value={filters.roomId || 'all'}
       onValueChange={(value) => updateFilter('roomId', value)}
      >
       <SelectTrigger id="room-select">
        <SelectValue placeholder="Todas as salas" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todas as salas</SelectItem>
        {rooms.map(room => (
         <SelectItem key={room.id} value={room.id}>
          {room.name}
         </SelectItem>
        ))}
       </SelectContent>
      </Select>
     </div>

     {/* Filtro por Serviço */}
     <div className="space-y-2">
      <Label htmlFor="service-select" className="flex items-center gap-1">
       <Briefcase className="w-4 h-4" />
       Serviço
      </Label>
      <Select
       value={filters.productServiceId || 'all'}
       onValueChange={(value) => updateFilter('productServiceId', value)}
      >
       <SelectTrigger id="service-select">
        <SelectValue placeholder="Todos os serviços" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todos os serviços</SelectItem>
        {services.map(service => (
         <SelectItem key={service.id} value={service.id}>
          {service.name}
         </SelectItem>
        ))}
       </SelectContent>
      </Select>
     </div>

     {/* Filtro por Status */}
     <div className="space-y-2">
      <Label htmlFor="status-select" className="flex items-center gap-1">
       <Activity className="w-4 h-4" />
       Status
      </Label>
      <Select
       value={filters.status || 'all'}
       onValueChange={(value) => updateFilter('status', value as AppointmentStatus)}
      >
       <SelectTrigger id="status-select">
        <SelectValue placeholder="Todos os status" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todos os status</SelectItem>
        {STATUS_OPTIONS.map(status => (
         <SelectItem key={status.value} value={status.value}>
          {status.label}
         </SelectItem>
        ))}
       </SelectContent>
      </Select>
     </div>

     {/* Filtro por Tipo */}
     <div className="space-y-2">
      <Label htmlFor="type-select" className="flex items-center gap-1">
       <Calendar className="w-4 h-4" />
       Tipo
      </Label>
      <Select
       value={filters.type || 'all'}
       onValueChange={(value) => updateFilter('type', value as AppointmentType)}
      >
       <SelectTrigger id="type-select">
        <SelectValue placeholder="Todos os tipos" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todos os tipos</SelectItem>
        {TYPE_OPTIONS.map(type => (
         <SelectItem key={type.value} value={type.value}>
          {type.label}
         </SelectItem>
        ))}
       </SelectContent>
      </Select>
     </div>
    </div>

    {/* Mostrar filtros ativos */}
    {activeFiltersCount > 0 && (
     <div className="flex flex-wrap gap-2 pt-2 border-t">
      <span className="text-sm text-muted-foreground mr-2">Filtros ativos:</span>
      
      {filters.partnerId && (
       <Badge 
        variant="secondary" 
        className="cursor-pointer"
        onClick={() => updateFilter('partnerId', undefined)}
       >
        <Users className="w-3 h-3 mr-1" />
        {getSelectedPartnerName()}
        <X className="w-3 h-3 ml-1" />
       </Badge>
      )}
      
      {filters.roomId && (
       <Badge 
        variant="secondary" 
        className="cursor-pointer"
        onClick={() => updateFilter('roomId', undefined)}
       >
        <MapPin className="w-3 h-3 mr-1" />
        {getSelectedRoomName()}
        <X className="w-3 h-3 ml-1" />
       </Badge>
      )}
      
      {filters.productServiceId && (
       <Badge 
        variant="secondary" 
        className="cursor-pointer"
        onClick={() => updateFilter('productServiceId', undefined)}
       >
        <Briefcase className="w-3 h-3 mr-1" />
        {getSelectedServiceName()}
        <X className="w-3 h-3 ml-1" />
       </Badge>
      )}
      
      {filters.status && (
       <Badge 
        variant="secondary" 
        className="cursor-pointer"
        onClick={() => updateFilter('status', undefined)}
       >
        <Activity className="w-3 h-3 mr-1" />
        {getSelectedStatusLabel()}
        <X className="w-3 h-3 ml-1" />
       </Badge>
      )}
      
      {filters.type && (
       <Badge 
        variant="secondary" 
        className="cursor-pointer"
        onClick={() => updateFilter('type', undefined)}
       >
        <Calendar className="w-3 h-3 mr-1" />
        {getSelectedTypeLabel()}
        <X className="w-3 h-3 ml-1" />
       </Badge>
      )}
     </div>
    )}
   </CardContent>
  </Card>
 )
}
