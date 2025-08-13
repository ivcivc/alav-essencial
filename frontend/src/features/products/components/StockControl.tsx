import React, { useState } from 'react'
import { Package, AlertTriangle, Plus, Minus, RotateCcw } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Badge } from '../../../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { ProductServiceWithRelations } from '../../../types'
import { useUpdateStock } from '../../../hooks/useProducts'

interface StockControlProps {
  products: ProductServiceWithRelations[]
  lowStockProducts: ProductServiceWithRelations[]
  stockReport?: {
    totalProducts: number
    lowStockProducts: number
    outOfStockProducts: number
    totalStockValue: number
    averageStockLevel: number
  }
}

interface StockUpdateModalProps {
  product: ProductServiceWithRelations
  isOpen: boolean
  onClose: () => void
}

const StockUpdateModal: React.FC<StockUpdateModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const [operation, setOperation] = useState<'add' | 'subtract' | 'set'>('add')
  const [quantity, setQuantity] = useState<number>(1)
  const updateStock = useUpdateStock()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await updateStock.mutateAsync({
        id: product.id,
        data: { operation, quantity }
      })
      onClose()
      setQuantity(1)
      setOperation('add')
    } catch (error) {
      console.error('Error updating stock:', error)
    }
  }

  const getNewStockLevel = () => {
    const currentStock = product.stockLevel || 0
    switch (operation) {
      case 'add':
        return currentStock + quantity
      case 'subtract':
        return Math.max(0, currentStock - quantity)
      case 'set':
        return quantity
      default:
        return currentStock
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Estoque</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{product.name}</h4>
            <p className="text-sm text-muted-foreground">
              Estoque atual: {product.stockLevel || 0} unidades
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="operation">Operação</Label>
              <Select
                value={operation}
                onValueChange={(value) => setOperation(value as 'add' | 'subtract' | 'set')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar ao estoque
                    </div>
                  </SelectItem>
                  <SelectItem value="subtract">
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4" />
                      Remover do estoque
                    </div>
                  </SelectItem>
                  <SelectItem value="set">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Definir estoque
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Digite a quantidade"
              />
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Novo estoque:</strong> {getNewStockLevel()} unidades
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateStock.isPending}>
                {updateStock.isPending ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const StockControl: React.FC<StockControlProps> = ({
  products,
  lowStockProducts,
  stockReport
}) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductServiceWithRelations | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const handleUpdateStock = (product: ProductServiceWithRelations) => {
    setSelectedProduct(product)
    setShowUpdateModal(true)
  }

  const getStockStatus = (product: ProductServiceWithRelations) => {
    const stock = product.stockLevel || 0
    const minStock = product.minStockLevel || 0
    
    if (stock === 0) {
      return { status: 'out', label: 'Sem estoque', color: 'destructive' as const }
    } else if (stock <= minStock) {
      return { status: 'low', label: 'Estoque baixo', color: 'secondary' as const }
    }
    
    return { status: 'ok', label: 'Em estoque', color: 'default' as const }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Produtos com Estoque Baixo
            </CardTitle>
            <CardDescription className="text-yellow-700">
              {lowStockProducts.length} produto{lowStockProducts.length !== 1 ? 's' : ''} 
              {lowStockProducts.length === 1 ? ' precisa' : ' precisam'} de reposição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((product) => {
                const stockStatus = getStockStatus(product)
                return (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Estoque: {product.stockLevel || 0}
                        {product.minStockLevel && ` (Min: ${product.minStockLevel})`}
                      </p>
                      <Badge variant={stockStatus.color} className="mt-1">
                        {stockStatus.label}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStock(product)}
                    >
                      Repor
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Controle de Estoque</CardTitle>
          <CardDescription>
            Gerencie o estoque de todos os produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Produtos aparecerão aqui quando forem criados.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Estoque Atual</TableHead>
                    <TableHead>Estoque Mínimo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor Unitário</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product)
                    const stockValue = (product.stockLevel || 0) * (product.costPrice || product.salePrice)
                    
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
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-medium">
                            {product.stockLevel || 0}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-muted-foreground">
                            {product.minStockLevel || 0}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={stockStatus.color}>
                            {stockStatus.status === 'out' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {stockStatus.status === 'low' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {formatPrice(product.costPrice || product.salePrice)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-medium">
                            {formatPrice(stockValue)}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStock(product)}
                          >
                            Atualizar
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Update Modal */}
      {selectedProduct && (
        <StockUpdateModal
          product={selectedProduct}
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false)
            setSelectedProduct(null)
          }}
        />
      )}
    </div>
  )
}