import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Checkbox } from '../../../components/ui/checkbox'
import { ServiceType } from '../../../types'
import { 
  useCategory, 
  useCreateCategory, 
  useUpdateCategory 
} from '../../../hooks/useProducts'

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.nativeEnum(ServiceType),
  description: z.string().optional(),
  active: z.boolean().optional()
})

type CategoryFormData = z.infer<typeof categoryFormSchema>

interface CategoryFormProps {
  categoryId?: string | null
  onSuccess: () => void
  onCancel: () => void
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  categoryId,
  onSuccess,
  onCancel
}) => {
  const isEditing = !!categoryId
  
  const { data: categoryData } = useCategory(categoryId || '')
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      type: ServiceType.PRODUCT,
      description: '',
      active: true
    }
  })

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form

  // Load category data for editing
  useEffect(() => {
    if (isEditing && categoryData?.data) {
      const category = categoryData.data
      setValue('name', category.name)
      setValue('type', category.type)
      setValue('description', category.description || '')
      setValue('active', category.active)
    }
  }, [isEditing, categoryData, setValue])

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const cleanData = {
        ...data,
        description: data.description || undefined
      }

      if (isEditing && categoryId) {
        await updateCategory.mutateAsync({ id: categoryId, data: cleanData })
      } else {
        await createCategory.mutateAsync(cleanData)
      }
      
      onSuccess()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Nome da categoria"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo *</Label>
        <Select
          value={watch('type')}
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

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descrição da categoria (opcional)"
          rows={3}
        />
      </div>

      {isEditing && (
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
      )}

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