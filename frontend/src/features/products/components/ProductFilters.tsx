import React from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Badge } from '../../../components/ui/badge'
import { ServiceType, Category } from '../../../types'

interface ProductFiltersProps {
 filters: {
  type?: ServiceType
  categoryId?: string
  active?: boolean
  availableForBooking?: boolean
 }
 onFiltersChange: (filters: any) => void
 categories: Category[]
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
 filters,
 onFiltersChange,
 categories
}) => {
 const updateFilter = (key: string, value: any) => {
  onFiltersChange({
   ...filters,
   [key]: value === 'all' ? undefined : value
  })
 }

 const clearFilters = () => {
  onFiltersChange({
   type: undefined,
   categoryId: undefined,
   active: true,
   availableForBooking: undefined
  })
 }

 const getActiveFiltersCount = () => {
  let count = 0
  if (filters.type) count++
  if (filters.categoryId) count++
  if (filters.active === false) count++
  if (filters.availableForBooking !== undefined) count++
  return count
 }

 const getCategoryName = (categoryId: string) => {
  const category = categories.find(c => c.id === categoryId)
  return category?.name || 'Categoria desconhecida'
 }

 const activeFiltersCount = getActiveFiltersCount()

 return (
  <div className="flex flex-col md:flex-row gap-4">
   <div className="flex flex-wrap gap-2">
    {/* Type Filter */}
    <Select
     value={filters.type || 'all'}
     onValueChange={(value) => updateFilter('type', value)}
    >
     <SelectTrigger className="w-[140px]">
      <SelectValue placeholder="Tipo" />
     </SelectTrigger>
     <SelectContent>
      <SelectItem value="all">Todos os tipos</SelectItem>
      <SelectItem value={ServiceType.PRODUCT}>Produtos</SelectItem>
      <SelectItem value={ServiceType.SERVICE}>Serviços</SelectItem>
     </SelectContent>
    </Select>

    {/* Category Filter */}
    <Select
     value={filters.categoryId || 'all'}
     onValueChange={(value) => updateFilter('categoryId', value)}
    >
     <SelectTrigger className="w-[160px]">
      <SelectValue placeholder="Categoria" />
     </SelectTrigger>
     <SelectContent>
      <SelectItem value="all">Todas as categorias</SelectItem>
      {categories.map((category) => (
       <SelectItem key={category.id} value={category.id}>
        {category.name}
       </SelectItem>
      ))}
     </SelectContent>
    </Select>

    {/* Status Filter */}
    <Select
     value={filters.active === undefined ? 'all' : filters.active.toString()}
     onValueChange={(value) => updateFilter('active', value === 'all' ? undefined : value === 'true')}
    >
     <SelectTrigger className="w-[120px]">
      <SelectValue placeholder="Status" />
     </SelectTrigger>
     <SelectContent>
      <SelectItem value="all">Todos</SelectItem>
      <SelectItem value="true">Ativos</SelectItem>
      <SelectItem value="false">Inativos</SelectItem>
     </SelectContent>
    </Select>

    {/* Bookable Filter (only for services) */}
    {(!filters.type || filters.type === ServiceType.SERVICE) && (
     <Select
      value={filters.availableForBooking === undefined ? 'all' : filters.availableForBooking.toString()}
      onValueChange={(value) => updateFilter('availableForBooking', value === 'all' ? undefined : value === 'true')}
     >
      <SelectTrigger className="w-[140px]">
       <SelectValue placeholder="Agendável" />
      </SelectTrigger>
      <SelectContent>
       <SelectItem value="all">Todos</SelectItem>
       <SelectItem value="true">Agendáveis</SelectItem>
       <SelectItem value="false">Não agendáveis</SelectItem>
      </SelectContent>
     </Select>
    )}
   </div>

   {/* Active Filters and Clear Button */}
   {activeFiltersCount > 0 && (
    <div className="flex items-center gap-2">
     <Button
      variant="outline"
      size="sm"
      onClick={clearFilters}
      className="h-9"
     >
      <X className="h-4 w-4 mr-1" />
      Limpar ({activeFiltersCount})
     </Button>
    </div>
   )}

   {/* Active Filters Display */}
   {activeFiltersCount > 0 && (
    <div className="flex flex-wrap gap-2 items-center">
     {filters.type && (
      <Badge variant="secondary" className="gap-1">
       Tipo: {filters.type === ServiceType.PRODUCT ? 'Produto' : 'Serviço'}
       <button
        onClick={() => updateFilter('type', undefined)}
        className="ml-1 hover:bg-card rounded-full p-0.5"
       >
        <X className="h-3 w-3" />
       </button>
      </Badge>
     )}
     
     {filters.categoryId && (
      <Badge variant="secondary" className="gap-1">
       Categoria: {getCategoryName(filters.categoryId)}
       <button
        onClick={() => updateFilter('categoryId', undefined)}
        className="ml-1 hover:bg-card rounded-full p-0.5"
       >
        <X className="h-3 w-3" />
       </button>
      </Badge>
     )}
     
     {filters.active === false && (
      <Badge variant="secondary" className="gap-1">
       Status: Inativos
       <button
        onClick={() => updateFilter('active', true)}
        className="ml-1 hover:bg-card rounded-full p-0.5"
       >
        <X className="h-3 w-3" />
       </button>
      </Badge>
     )}
     
     {filters.availableForBooking !== undefined && (
      <Badge variant="secondary" className="gap-1">
       {filters.availableForBooking ? 'Agendáveis' : 'Não agendáveis'}
       <button
        onClick={() => updateFilter('availableForBooking', undefined)}
        className="ml-1 hover:bg-card rounded-full p-0.5"
       >
        <X className="h-3 w-3" />
       </button>
      </Badge>
     )}
    </div>
   )}
  </div>
 )
}