import React, { useState } from 'react'
import { Plus, Search, Filter, Package, ShoppingCart, AlertTriangle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { ProductsList } from './components/ProductsList'
import { ProductForm } from './components/ProductForm'
import { CategoryForm } from './components/CategoryForm'
import { StockControl } from './components/StockControl'
import { ProductFilters } from './components/ProductFilters'
import { useProducts, useCategories, useLowStockProducts, useStockReport } from '../../hooks/useProducts'
import { ServiceType } from '../../types'

export const ProductsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('products')
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: undefined as ServiceType | undefined,
    categoryId: undefined as string | undefined,
    active: true,
    availableForBooking: undefined as boolean | undefined
  })
  const [searchQuery, setSearchQuery] = useState('')

  // Data fetching
  const { data: productsData, isLoading: productsLoading } = useProducts({
    ...filters,
    q: searchQuery || undefined,
    page: 1,
    limit: 20
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    active: true,
    page: 1,
    limit: 100
  })

  const { data: lowStockData } = useLowStockProducts()
  const { data: stockReportData } = useStockReport()

  const handleEditProduct = (productId: string) => {
    setEditingProduct(productId)
    setShowProductForm(true)
  }

  const handleEditCategory = (categoryId: string) => {
    setEditingCategory(categoryId)
    setShowCategoryForm(true)
  }

  const handleCloseProductForm = () => {
    setShowProductForm(false)
    setEditingProduct(null)
  }

  const handleCloseCategoryForm = () => {
    setShowCategoryForm(false)
    setEditingCategory(null)
  }

  const products = productsData?.productServices || []
  const categories = categoriesData?.categories || []
  const lowStockProducts = lowStockData?.data || []
  const stockReport = stockReportData?.data

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produtos e Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de produtos e serviços da clínica
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
              </DialogHeader>
              <CategoryForm
                categoryId={editingCategory}
                onSuccess={handleCloseCategoryForm}
                onCancel={handleCloseCategoryForm}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto/Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Produto/Serviço' : 'Novo Produto/Serviço'}
                </DialogTitle>
              </DialogHeader>
              <ProductForm
                productId={editingProduct}
                onSuccess={handleCloseProductForm}
                onCancel={handleCloseProductForm}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stockReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockReport.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stockReport.lowStockProducts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stockReport.outOfStockProducts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(stockReport.totalStockValue)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos e serviços..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Produtos e Serviços</TabsTrigger>
          <TabsTrigger value="stock">Controle de Estoque</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <ProductsList
            products={products}
            categories={categories}
            isLoading={productsLoading}
            onEdit={handleEditProduct}
          />
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <StockControl
            products={products.filter(p => p.type === ServiceType.PRODUCT)}
            lowStockProducts={lowStockProducts}
            stockReport={stockReport}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                    <Badge variant={category.type === ServiceType.PRODUCT ? 'default' : 'secondary'}>
                      {category.type === ServiceType.PRODUCT ? 'Produto' : 'Serviço'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Status: {category.active ? 'Ativo' : 'Inativo'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCategory(category.id)}
                    >
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}