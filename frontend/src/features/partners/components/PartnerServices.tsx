import React, { useState, useEffect } from 'react'
import { Check, Plus, X, Search, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { usePartnerServices, useUpdatePartnerServices } from '@/hooks/usePartners'
import { useProducts } from '@/hooks/useProducts'
import { ProductService } from '@/types/entities'

interface PartnerServicesProps {
 partnerId: string
}

export function PartnerServicesComponent({ partnerId }: PartnerServicesProps) {
 const [isDialogOpen, setIsDialogOpen] = useState(false)
 const [searchTerm, setSearchTerm] = useState('')
 const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

 const { data: partnerServices, isLoading: isLoadingPartnerServices } = usePartnerServices(partnerId)
 const { data: allProducts, isLoading: isLoadingProducts } = useProducts({
  active: true,
  limit: 100 // Get more products for selection
 })
 const updatePartnerServices = useUpdatePartnerServices()

 // Filter only services (not products)
 const allServices = allProducts?.products?.filter(p => p.type === 'SERVICE') || []

 // Get currently associated service IDs
 const currentServiceIds = partnerServices?.map(ps => ps.productServiceId) || []

 // Initialize selected services when dialog opens
 useEffect(() => {
  if (isDialogOpen && partnerServices) {
   setSelectedServiceIds(currentServiceIds)
  }
 }, [isDialogOpen, partnerServices])

 // Filter services based on search term
 const filteredServices = allServices.filter(service =>
  service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  service.description?.toLowerCase().includes(searchTerm.toLowerCase())
 )

 const handleServiceToggle = (serviceId: string) => {
  setSelectedServiceIds(prev =>
   prev.includes(serviceId)
    ? prev.filter(id => id !== serviceId)
    : [...prev, serviceId]
  )
 }

 const handleSaveServices = () => {
  updatePartnerServices.mutate(
   { partnerId, serviceIds: selectedServiceIds },
   {
    onSuccess: () => {
     setIsDialogOpen(false)
     setSearchTerm('')
    },
   }
  )
 }

 const getAssociatedServices = () => {
  if (!partnerServices || !allServices) return []
  
  return partnerServices
   .map(ps => allServices.find(s => s.id === ps.productServiceId))
   .filter(Boolean) as ProductService[]
 }

 const associatedServices = getAssociatedServices()

 const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
   style: 'currency',
   currency: 'BRL',
  }).format(price)
 }

 if (isLoadingPartnerServices) {
  return (
   <Card>
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <Package className="h-5 w-5" />
      Serviços Associados
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="text-center py-8">Carregando serviços...</div>
    </CardContent>
   </Card>
  )
 }

 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center justify-between">
     <div className="flex items-center gap-2">
      <Package className="h-5 w-5" />
      Serviços Associados
     </div>
     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
       <Button size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Gerenciar Serviços
       </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
       <DialogHeader>
        <DialogTitle>Selecionar Serviços do Parceiro</DialogTitle>
       </DialogHeader>
       
       <div className="space-y-4">
        {/* Search */}
        <div className="relative">
         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
         <Input
          placeholder="Buscar serviços..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
         />
        </div>

        {/* Services List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
         {isLoadingProducts ? (
          <div className="text-center py-8">Carregando serviços...</div>
         ) : filteredServices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
           {searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço disponível'}
          </div>
         ) : (
          filteredServices.map((service) => {
           const isSelected = selectedServiceIds.includes(service.id)
           
           return (
            <div
             key={service.id}
             className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              isSelected
               ? 'bg-blue-50 border-blue-200'
               : 'bg-card border-border hover:bg-card'
             }`}
             onClick={() => handleServiceToggle(service.id)}
            >
             <Checkbox
              checked={isSelected}
              onChange={() => handleServiceToggle(service.id)}
              className="mt-0.5"
             />
             
             <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
               <div>
                <h4 className="font-medium text-muted-foreground">
                 {service.name}
                </h4>
                {service.description && (
                 <p className="text-sm text-muted-foreground mt-1">
                  {service.description}
                 </p>
                )}
                <div className="flex items-center space-x-4 mt-2">
                 <span className="text-sm font-medium ">
                  {formatPrice(service.salePrice)}
                 </span>
                 {service.durationMinutes && (
                  <span className="text-xs text-muted-foreground">
                   {service.durationMinutes} min
                  </span>
                 )}
                 {service.category && (
                  <Badge variant="outline" className="text-xs">
                   {service.category.name}
                  </Badge>
                 )}
                </div>
               </div>
              </div>
             </div>
            </div>
           )
          })
         )}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between pt-4 border-t">
         <span className="text-sm text-muted-foreground">
          {selectedServiceIds.length} serviços selecionados
         </span>
         <div className="space-x-2">
          <Button
           variant="outline"
           onClick={() => {
            setIsDialogOpen(false)
            setSearchTerm('')
            setSelectedServiceIds(currentServiceIds) // Reset to current
           }}
          >
           Cancelar
          </Button>
          <Button
           onClick={handleSaveServices}
           disabled={updatePartnerServices.isPending}
          >
           {updatePartnerServices.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
         </div>
        </div>
       </div>
      </DialogContent>
     </Dialog>
    </CardTitle>
   </CardHeader>
   <CardContent>
    {associatedServices.length > 0 ? (
     <div className="space-y-3">
      {associatedServices.map((service) => (
       <div
        key={service.id}
        className="flex items-start justify-between p-4 bg-card rounded-lg"
       >
        <div className="flex-1">
         <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-muted-foreground">{service.name}</h4>
          <div className="text-right">
           <div className="font-medium ">
            {formatPrice(service.salePrice)}
           </div>
           {service.partnerPrice && (
            <div className="text-sm text-muted-foreground">
             Parceiro: {formatPrice(service.partnerPrice)}
            </div>
           )}
          </div>
         </div>
         
         {service.description && (
          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
         )}
         
         <div className="flex items-center space-x-4">
          {service.category && (
           <Badge variant="outline" className="text-xs">
            {service.category.name}
           </Badge>
          )}
          {service.durationMinutes && (
           <span className="text-xs text-muted-foreground">
            Duração: {service.durationMinutes} min
           </span>
          )}
          {service.internalCode && (
           <span className="text-xs text-muted-foreground font-mono">
            {service.internalCode}
           </span>
          )}
         </div>
        </div>
       </div>
      ))}
      
      {/* Summary */}
      <div className="pt-4 border-t">
       <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Total de serviços: {associatedServices.length}</span>
        <span>
         Valor médio: {formatPrice(
          associatedServices.reduce((sum, s) => sum + s.salePrice, 0) / associatedServices.length
         )}
        </span>
       </div>
      </div>
     </div>
    ) : (
     <div className="text-center py-8 text-muted-foreground">
      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <p>Nenhum serviço associado</p>
      <p className="text-sm">Clique em "Gerenciar Serviços" para associar</p>
     </div>
    )}
   </CardContent>
  </Card>
 )
}
