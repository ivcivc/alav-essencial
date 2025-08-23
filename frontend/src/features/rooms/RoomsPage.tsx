import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoomsList } from './components/RoomsList'
import { RoomForm } from './components/RoomForm'
import { RoomDetails } from './components/RoomDetails'
import { useCreateRoom, useUpdateRoom } from '@/hooks/useRooms'
import { useToast } from '@/hooks/useToast'
import { Room } from '@/types/entities'
import { CreateRoomData, UpdateRoomData } from '@/services/rooms'

type ViewMode = 'list' | 'create' | 'edit' | 'view'

export const RoomsPage: React.FC = () => {
 const [viewMode, setViewMode] = useState<ViewMode>('list')
 const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

 const { toast } = useToast()
 const createRoomMutation = useCreateRoom()
 const updateRoomMutation = useUpdateRoom()

 const handleCreateRoom = () => {
  setSelectedRoom(null)
  setViewMode('create')
 }

 const handleEditRoom = (room: Room) => {
  setSelectedRoom(room)
  setViewMode('edit')
 }

 const handleViewRoom = (room: Room) => {
  setSelectedRoom(room)
  setViewMode('view')
 }

 const handleBackToList = () => {
  setSelectedRoom(null)
  setViewMode('list')
 }

 const handleSubmitCreate = async (data: CreateRoomData) => {
  try {
   await createRoomMutation.mutateAsync(data)
   setViewMode('list')
   toast({
    title: 'Sala criada',
    description: `A sala "${data.name}" foi criada com sucesso.`,
   })
  } catch (error) {
   // Error is handled in the form component
   throw error
  }
 }

 const handleSubmitUpdate = async (data: UpdateRoomData) => {
  if (!selectedRoom) return

  try {
   await updateRoomMutation.mutateAsync({
    id: selectedRoom.id,
    data
   })
   setViewMode('list')
   toast({
    title: 'Sala atualizada',
    description: `A sala "${data.name || selectedRoom.name}" foi atualizada com sucesso.`,
   })
  } catch (error) {
   // Error is handled in the form component
   throw error
  }
 }

 const renderContent = () => {
  switch (viewMode) {
   case 'create':
    return (
     <div className="space-y-6">
      <div className="flex items-center gap-4">
       <Button
        variant="ghost"
        size="sm"
        onClick={handleBackToList}
       >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
       </Button>
       <div>
        <h1 className="text-2xl font-bold">Nova Sala</h1>
        <p className="text-muted-foreground">Cadastre uma nova sala no sistema</p>
       </div>
      </div>
      <RoomForm
       onSubmit={handleSubmitCreate}
       onCancel={handleBackToList}
       isLoading={createRoomMutation.isPending}
      />
     </div>
    )

   case 'edit':
    return (
     <div className="space-y-6">
      <div className="flex items-center gap-4">
       <Button
        variant="ghost"
        size="sm"
        onClick={handleBackToList}
       >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
       </Button>
       <div>
        <h1 className="text-2xl font-bold">Editar Sala</h1>
        <p className="text-muted-foreground">
         Atualize as informações de {selectedRoom?.name}
        </p>
       </div>
      </div>
      <RoomForm
       room={selectedRoom!}
       onSubmit={handleSubmitUpdate}
       onCancel={handleBackToList}
       isLoading={updateRoomMutation.isPending}
      />
     </div>
    )

   case 'view':
    return (
     <div className="space-y-6">
      <div className="flex items-center gap-4">
       <Button
        variant="ghost"
        size="sm"
        onClick={handleBackToList}
       >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
       </Button>
       <Button
        variant="outline"
        size="sm"
        onClick={() => handleEditRoom(selectedRoom!)}
       >
        Editar Sala
       </Button>
      </div>
      <RoomDetails roomId={selectedRoom!.id} />
     </div>
    )

   default:
    return (
     <RoomsList
      onCreateRoom={handleCreateRoom}
      onEditRoom={handleEditRoom}
      onViewRoom={handleViewRoom}
     />
    )
  }
 }

 return (
  <div className="container mx-auto px-4 py-6">
   {renderContent()}
  </div>
 )
}