import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Checkbox } from '../../../components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Plus } from 'lucide-react'
import { ServiceType } from '../../../types'
import { 
  useProduct, 
  useCreateProduct, 
  useUpdateProduct, 
  useCategories,
  useCreateCategory 
} from '../../../hooks/useProducts'

const productFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.nativeEnum(ServiceType),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  internalCode: z.string().optional(),
  description: z.string().optional(),
  salePrice: z.number().min(0, 'Preço deve ser maior que zero'),
  costPrice: z.number().min(0).optional(),
  partnerPrice: z.number().min(0).optional(),
  // Service specific fields
  durationMinutes: z.number().min(1).optional(),
  availableForBooking: z.boolean().optional(),
  requiresSpecialPrep: z.boolean().optional(),
  specialPrepDetails: z.string().optional(),
  // Product specific fields
  stockLevel: z.number().min(0).optional(),
  minStockLevel: z.number().min(0).optional(),
  // General fields
  active: z.boolean().optional(),
  observations: z.string().optional()
})

type ProductFormData = z.infer<typeof productFormSchema>

interface ProductFormProps {
  productId?: string | null
  onSuccess: () => void
  onCancel: () => void
}

export const ProductForm: React.FC<ProductFormProps> = ({
  productId,
  onSuccess,
  onCancel
}) => {
  const isEditing = !!productId
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [tempCategories, setTempCategories] = useState<any[]>([])
  
  const { data: productData } = useProduct(productId || '')
  const { data: categoriesData, refetch: refetchCategories } = useCategories({ active: true, limit: 100 })
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const createCategory = useCreateCategory()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      type: ServiceType.PRODUCT,
      categoryId: '',
      internalCode: '',
      description: '',
      salePrice: 0,
      costPrice: 0,
      partnerPrice: 0,
      durationMinutes: 30,
      availableForBooking: true,
      requiresSpecialPrep: false,
      specialPrepDetails: '',
      stockLevel: 0,
      minStockLevel: 0,
      active: true,
      observations: ''
    }
  })

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form
  const watchedType = watch('type')
  const watchedRequiresSpecialPrep = watch('requiresSpecialPrep')

  // Load product data for editing
  useEffect(() => {
    console.log('🔍 ProductForm useEffect: Checking product data', {
      isEditing,
      productData,
      hasDataProperty: !!productData?.data,
      hasDirectData: !!productData && 'id' in productData
    })

    if (isEditing && productData) {
      // Check if data is in productData.data or directly in productData
      const product = productData.data || productData
      
      if (product && product.id) {
        console.log('🔍 ProductForm: Loading product data into form', product)
        
        setValue('name', product.name)
        setValue('type', product.type)
        setValue('categoryId', product.categoryId)
        setValue('internalCode', product.internalCode || '')
        setValue('description', product.description || '')
        setValue('salePrice', product.salePrice)
        setValue('costPrice', product.costPrice || 0)
        setValue('partnerPrice', product.partnerPrice || 0)
        setValue('durationMinutes', product.durationMinutes || 30)
        setValue('availableForBooking', product.availableForBooking)
        setValue('requiresSpecialPrep', product.requiresSpecialPrep)
        setValue('specialPrepDetails', product.specialPrepDetails || '')
        setValue('stockLevel', product.stockLevel || 0)
        setValue('minStockLevel', product.minStockLevel || 0)
        setValue('active', product.active)
        setValue('observations', product.observations || '')
        
        console.log('🔍 ProductForm: Form values set successfully')
      }
    }
  }, [isEditing, productData, setValue])

  // Clear temp categories when fetched data updates
  useEffect(() => {
    if (categoriesData?.categories && tempCategories.length > 0) {
      // Remove temp categories that are now in the fetched data
      setTempCategories(prev => prev.filter(temp => 
        !categoriesData.categories.some(fetched => fetched.id === temp.id)
      ))
    }
  }, [categoriesData, tempCategories.length])

  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const response = await createCategory.mutateAsync({
        name: newCategoryName.trim(),
        type: watchedType,
        description: newCategoryDescription.trim() || undefined
      })

      if (response.data) {
        // Add the new category to temp list immediately
        setTempCategories(prev => [...prev, response.data])
        
        // Force refetch categories to ensure the new category appears
        await refetchCategories()
        
        // Set the new category as selected
        setValue('categoryId', response.data.id)
        
        // Close dialog and reset form
        setShowNewCategoryDialog(false)
        setNewCategoryName('')
        setNewCategoryDescription('')
      }
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Clean up data based on type
      const cleanData = {
        ...data,
        costPrice: data.costPrice || undefined,
        partnerPrice: data.partnerPrice || undefined,
        internalCode: data.internalCode || undefined,
        description: data.description || undefined,
        observations: data.observations || undefined,
        // Service specific
        durationMinutes: watchedType === ServiceType.SERVICE ? data.durationMinutes : undefined,
        availableForBooking: watchedType === ServiceType.SERVICE ? data.availableForBooking : false,
        requiresSpecialPrep: watchedType === ServiceType.SERVICE ? data.requiresSpecialPrep : false,
        specialPrepDetails: watchedType === ServiceType.SERVICE && data.requiresSpecialPrep 
          ? data.specialPrepDetails : undefined,
        // Product specific
        stockLevel: watchedType === ServiceType.PRODUCT ? data.stockLevel : undefined,
        minStockLevel: watchedType === ServiceType.PRODUCT ? data.minStockLevel : undefined
      }

      if (isEditing && productId) {
        await updateProduct.mutateAsync({ id: productId, data: cleanData })
      } else {
        await createProduct.mutateAsync(cleanData)
      }
      
      onSuccess()
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  // Combine fetched categories with temporary ones
  // A API retorna categories diretamente, não data.categories
  const fetchedCategories = categoriesData?.categories || []
  const allCategories = [...fetchedCategories, ...tempCategories.filter(temp => 
    !fetchedCategories.some(fetched => fetched.id === temp.id)
  )]
  const categories = allCategories

  // DEBUG: Log para verificar dados do produto
  console.log('🔍 ProductForm useProduct Status:', {
    isEditing,
    productId,
    productData,
    hasProductData: !!productData?.data,
    productDataContent: productData?.data
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="pricing">Preços</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados principais do produto ou serviço
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Nome do produto/serviço"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={watchedType}
                    onValueChange={(value) => setValue('type', value as ServiceType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ServiceType.PRODUCT}>Produto</SelectItem>
                      <SelectItem value={ServiceType.SERVICE}>Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categoria *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={watch('categoryId')}
                      onValueChange={(value) => setValue('categoryId', value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue 
                          placeholder={
                            categories.filter(cat => cat.type === watchedType).length === 0
                              ? "Nenhuma categoria disponível"
                              : "Selecione a categoria"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(cat => cat.type === watchedType)
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        {categories.filter(cat => cat.type === watchedType).length === 0 && (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Nenhuma categoria encontrada
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    
                    <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Nova Categoria</DialogTitle>
                          <DialogDescription>
                            Criar uma nova categoria para {watchedType === ServiceType.PRODUCT ? 'produtos' : 'serviços'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="newCategoryName">Nome da Categoria *</Label>
                            <Input
                              id="newCategoryName"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="Nome da categoria"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newCategoryDescription">Descrição</Label>
                            <Textarea
                              id="newCategoryDescription"
                              value={newCategoryDescription}
                              onChange={(e) => setNewCategoryDescription(e.target.value)}
                              placeholder="Descrição da categoria (opcional)"
                              rows={3}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowNewCategoryDialog(false)
                              setNewCategoryName('')
                              setNewCategoryDescription('')
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="button" 
                            onClick={handleCreateNewCategory}
                            disabled={!newCategoryName.trim() || createCategory.isPending}
                          >
                            {createCategory.isPending ? 'Criando...' : 'Criar'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {errors.categoryId && (
                    <p className="text-sm text-red-600">{errors.categoryId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internalCode">Código Interno</Label>
                  <Input
                    id="internalCode"
                    {...register('internalCode')}
                    placeholder="Código interno (opcional)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Descrição do produto/serviço"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preços</CardTitle>
              <CardDescription>
                Configure os preços de venda, custo e parceiro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Preço de Venda *</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('salePrice', { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                  {errors.salePrice && (
                    <p className="text-sm text-red-600">{errors.salePrice.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costPrice">Preço de Custo</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('costPrice', { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partnerPrice">Preço do Parceiro</Label>
                  <Input
                    id="partnerPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('partnerPrice', { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          {watchedType === ServiceType.SERVICE && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Serviço</CardTitle>
                <CardDescription>
                  Configurações específicas para serviços
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="durationMinutes">Duração (minutos)</Label>
                    <Input
                      id="durationMinutes"
                      type="number"
                      min="1"
                      {...register('durationMinutes', { valueAsNumber: true })}
                      placeholder="30"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="availableForBooking"
                        checked={watch('availableForBooking')}
                        onCheckedChange={(checked) => setValue('availableForBooking', !!checked)}
                      />
                      <Label htmlFor="availableForBooking">Disponível para agendamento</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresSpecialPrep"
                      checked={watch('requiresSpecialPrep')}
                      onCheckedChange={(checked) => setValue('requiresSpecialPrep', !!checked)}
                    />
                    <Label htmlFor="requiresSpecialPrep">Requer preparo especial</Label>
                  </div>
                </div>

                {watchedRequiresSpecialPrep && (
                  <div className="space-y-2">
                    <Label htmlFor="specialPrepDetails">Detalhes do preparo especial</Label>
                    <Textarea
                      id="specialPrepDetails"
                      {...register('specialPrepDetails')}
                      placeholder="Descreva os preparos especiais necessários"
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {watchedType === ServiceType.PRODUCT && (
            <Card>
              <CardHeader>
                <CardTitle>Controle de Estoque</CardTitle>
                <CardDescription>
                  Configurações de estoque para produtos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stockLevel">Quantidade em Estoque</Label>
                    <Input
                      id="stockLevel"
                      type="number"
                      min="0"
                      {...register('stockLevel', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minStockLevel">Estoque Mínimo</Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      min="0"
                      {...register('minStockLevel', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={watch('active')}
                    onCheckedChange={(checked) => setValue('active', !!checked)}
                  />
                  <Label htmlFor="active">Ativo</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  {...register('observations')}
                  placeholder="Observações adicionais"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}