import React from 'react'
import { Edit, Package, Wrench, Eye, AlertTriangle } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { ProductServiceWithRelations, Category, ServiceType } from '../../../types'

interface ProductsListProps {
 products: ProductServiceWithRelations[]
 categories: Category[]
 isLoading: boolean
 onEdit: (productId: string) => void
}

export const ProductsList: React.FC<ProductsListProps> = ({
 products,
 categories,
 isLoading,
 onEdit
}) => {
 const getCategoryName = (categoryId: string) => {
  const category = categories.find(c => c.id === categoryId)
  return category?.name || 'Sem categoria'
 }

 const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
   style: 'currency',
   currency: 'BRL'
  }).format(price)
 }

 const getStockStatus = (product: ProductServiceWithRelations) => {
  if (product.type === ServiceType.SERVICE) return null
  
  const stock = product.stockLevel || 0
  const minStock = product.minStockLevel || 0
  
  if (stock === 0) {
   return { status: 'out', label: 'Sem estoque', color: 'destructive' as const }
  } else if (stock <= minStock) {
   return { status: 'low', label: 'Estoque baixo', color: 'secondary' as const }
  }
  
  return { status: 'ok', label: 'Em estoque', color: 'default' as const }
 }

 if (isLoading) {
  return (
   <Card>
    <CardContent className="p-6">
     <div className="flex items-center justify-center">
      <div className="text-muted-foreground">Carregando produtos e serviços...</div>
     </div>
    </CardContent>
   </Card>
  )
 }

 if (products.length === 0) {
  return (
   <Card>
    <CardContent className="p-6">
     <div className="text-center">
      <Package className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-2 text-sm font-semibold text-muted-foreground">Nenhum produto/serviço encontrado</h3>
      <p className="mt-1 text-sm text-muted-foreground">
       Comece criando um novo produto ou serviço.
      </p>
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <Card>
   <CardHeader>
    <CardTitle>Lista de Produtos e Serviços</CardTitle>
    <CardDescription>
     {products.length} item{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
    </CardDescription>
   </CardHeader>
   <CardContent>
    <div className="rounded-md border">
     <Table>
      <TableHeader>
       <TableRow>
        <TableHead>Nome</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Categoria</TableHead>
        <TableHead>Preço</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Estoque</TableHead>
        <TableHead className="text-right">Ações</TableHead>
       </TableRow>
      </TableHeader>
      <TableBody>
       {products.map((product) => {
        const stockStatus = getStockStatus(product)
        
        return (
         <TableRow key={product.id}>
          <TableCell>
           <div>
            <div className="font-medium">{product.name}</div>
            {product.internalCode && (
             <div className="text-sm text-muted-foreground">
              Código: {product.internalCode}
             </div>
            )}
            {product.description && (
             <div className="text-sm text-muted-foreground max-w-xs truncate">
              {product.description}
             </div>
            )}
           </div>
          </TableCell>
          
          <TableCell>
           <Badge 
            variant={product.type === ServiceType.PRODUCT ? 'success' : 'info'}
            className={product.type === ServiceType.PRODUCT ? 'badge-product' : 'badge-service'}
           >
            {product.type === ServiceType.PRODUCT ? (
             <>
              <Package className="h-3 w-3 mr-1" />
              Produto
             </>
            ) : (
             <>
              <Wrench className="h-3 w-3 mr-1" />
              Serviço
             </>
            )}
           </Badge>
          </TableCell>
          
          <TableCell>
           <div className="text-sm">
            {getCategoryName(product.categoryId)}
           </div>
          </TableCell>
          
          <TableCell>
           <div className="font-medium">
            {formatPrice(product.salePrice)}
           </div>
           {product.costPrice && (
            <div className="text-sm text-muted-foreground">
             Custo: {formatPrice(product.costPrice)}
            </div>
           )}
          </TableCell>
          
          <TableCell>
           <div className="flex flex-col gap-1">
            <Badge 
             variant={product.active ? 'success' : 'secondary'}
             className={product.active ? 'badge-active' : 'badge-inactive'}
            >
             {product.active ? 'Ativo' : 'Inativo'}
            </Badge>
            {product.type === ServiceType.SERVICE && (
             <Badge 
              variant={product.availableForBooking ? 'info' : 'warning'}
              className={product.availableForBooking ? 'badge-available' : 'badge-unavailable'}
             >
              {product.availableForBooking ? 'Agendável' : 'Não agendável'}
             </Badge>
            )}
           </div>
          </TableCell>
          
          <TableCell>
           {product.type === ServiceType.PRODUCT ? (
            <div className="flex flex-col gap-1">
             {stockStatus && (
              <Badge 
               variant={
                stockStatus.status === 'ok' ? 'success' : 
                stockStatus.status === 'low' ? 'warning' : 'destructive'
               }
               className={
                stockStatus.status === 'ok' ? 'badge-stock-ok' : 
                stockStatus.status === 'low' ? 'badge-stock-low' : 'badge-stock-out'
               }
              >
               {stockStatus.status === 'out' && <AlertTriangle className="h-3 w-3 mr-1" />}
               {stockStatus.status === 'low' && <AlertTriangle className="h-3 w-3 mr-1" />}
               {stockStatus.label}
              </Badge>
             )}
             <div className="text-sm text-muted-foreground">
              Qtd: {product.stockLevel || 0}
              {product.minStockLevel && ` (Min: ${product.minStockLevel})`}
             </div>
            </div>
           ) : (
            <div className="text-sm text-muted-foreground">
             {product.durationMinutes ? `${product.durationMinutes} min` : 'N/A'}
            </div>
           )}
          </TableCell>
          
          <TableCell className="text-right">
           <div className="flex justify-end gap-2">
            <Button
             variant="outline"
             size="sm"
             onClick={() => onEdit(product.id)}
            >
             <Edit className="h-4 w-4" />
            </Button>
           </div>
          </TableCell>
         </TableRow>
        )
       })}
      </TableBody>
     </Table>
    </div>
   </CardContent>
  </Card>
 )
}