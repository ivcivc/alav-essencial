import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/useToast'
import { Room } from '@/types/entities'
import { roomFormSchema, RoomFormData } from '@/types/schemas'
import { CreateRoomData, UpdateRoomData } from '@/services/rooms'

interface RoomFormProps {
 room?: Room
 onSubmit: (data: any) => Promise<void>
 onCancel?: () => void
 isLoading?: boolean
}

export const RoomForm: React.FC<RoomFormProps> = ({
 room,
 onSubmit,
 onCancel,
 isLoading = false
}) => {
 const { toast } = useToast()
 const [newResource, setNewResource] = useState('')

 const {
  register,
  handleSubmit,
  formState: { errors },
  setValue,
  watch,
  reset
 } = useForm<RoomFormData>({
  resolver: zodResolver(roomFormSchema),
  defaultValues: {
   name: room?.name || '',
   description: room?.description || '',
   resources: room?.resources || []
  }
 })

 const resources = watch('resources') || []

 const handleAddResource = () => {
  if (newResource.trim() && !resources.includes(newResource.trim())) {
   const updatedResources = [...resources, newResource.trim()]
   setValue('resources', updatedResources)
   setNewResource('')
  }
 }

 const handleRemoveResource = (resourceToRemove: string) => {
  const updatedResources = resources.filter(resource => resource !== resourceToRemove)
  setValue('resources', updatedResources)
 }

 const handleKeyPress = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
   e.preventDefault()
   handleAddResource()
  }
 }

 const onFormSubmit = async (data: RoomFormData) => {
  try {
   await onSubmit(data)
   toast({
    title: room ? 'Sala atualizada' : 'Sala criada',
    description: room 
     ? `A sala "${data.name}" foi atualizada com sucesso.`
     : `A sala "${data.name}" foi criada com sucesso.`,
   })
   if (!room) {
    reset()
   }
  } catch (error) {
   toast({
    title: 'Erro',
    description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
    variant: 'destructive',
   })
  }
 }

 return (
  <Card className="w-full max-w-2xl mx-auto">
   <CardHeader>
    <CardTitle>
     {room ? 'Editar Sala' : 'Nova Sala'}
    </CardTitle>
   </CardHeader>
   <CardContent>
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
     {/* Basic Information */}
     <div className="space-y-4">
      <div className="space-y-2">
       <Label htmlFor="name">Nome da Sala *</Label>
       <Input
        id="name"
        {...register('name')}
        placeholder="Ex: Consultório 1"
        className={errors.name ? 'border-red-500' : ''}
       />
       {errors.name && (
        <p className="text-sm ">{errors.name.message}</p>
       )}
      </div>

      <div className="space-y-2">
       <Label htmlFor="description">Descrição</Label>
       <Textarea
        id="description"
        {...register('description')}
        placeholder="Descrição da sala e suas características..."
        rows={3}
        className={errors.description ? 'border-red-500' : ''}
       />
       {errors.description && (
        <p className="text-sm ">{errors.description.message}</p>
       )}
      </div>
     </div>

     {/* Resources Section */}
     <div className="space-y-4">
      <Label>Recursos Disponíveis</Label>
      
      {/* Add Resource Input */}
      <div className="flex gap-2">
       <Input
        value={newResource}
        onChange={(e) => setNewResource(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ex: Maca, Armário, Luz focal..."
        className="flex-1"
       />
       <Button
        type="button"
        onClick={handleAddResource}
        disabled={!newResource.trim()}
        size="sm"
       >
        <Plus className="h-4 w-4" />
       </Button>
      </div>

      {/* Resources List */}
      {resources.length > 0 && (
       <div className="flex flex-wrap gap-2">
        {resources.map((resource, index) => (
         <Badge
          key={index}
          variant="secondary"
          className="flex items-center gap-1 px-3 py-1"
         >
          {resource}
          <button
           type="button"
           onClick={() => handleRemoveResource(resource)}
           className="ml-1 hover:"
          >
           <X className="h-3 w-3" />
          </button>
         </Badge>
        ))}
       </div>
      )}

      {resources.length === 0 && (
       <p className="text-sm text-muted-foreground">
        Nenhum recurso adicionado. Use o campo acima para adicionar recursos disponíveis na sala.
       </p>
      )}
     </div>

     {/* Form Actions */}
     <div className="flex justify-end gap-3 pt-4">
      {onCancel && (
       <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
       >
        Cancelar
       </Button>
      )}
      <Button
       type="submit"
       disabled={isLoading}
      >
       {isLoading ? 'Salvando...' : room ? 'Atualizar Sala' : 'Criar Sala'}
      </Button>
     </div>
    </form>
   </CardContent>
  </Card>
 )
}