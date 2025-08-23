import React, { useState } from 'react'
import { Search, Plus, Edit, Eye, Trash2, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/ui/table'
import { useRooms, useDeleteRoom } from '@/hooks/useRooms'
import { useToast } from '@/hooks/useToast'
import { Room } from '@/types/entities'

interface RoomsListProps {
 onCreateRoom: () => void
 onEditRoom: (room: Room) => void
 onViewRoom: (room: Room) => void
}

export const RoomsList: React.FC<RoomsListProps> = ({
 onCreateRoom,
 onEditRoom,
 onViewRoom
}) => {
 const [searchQuery, setSearchQuery] = useState('')
 const [currentPage, setCurrentPage] = useState(1)
 const [showInactive, setShowInactive] = useState(false)

 const { toast } = useToast()
 const deleteRoomMutation = useDeleteRoom()

 const {
  data: roomsData,
  isLoading,
  error,
  refetch
 } = useRooms({
  page: currentPage,
  limit: 10,
  q: searchQuery || undefined,
  active: showInactive ? undefined : true
 })

 const handleSearch = (query: string) => {
  setSearchQuery(query)
  setCurrentPage(1) // Reset to first page when searching
 }

 const handleDeleteRoom = async (room: Room) => {
  if (window.confirm(`Tem certeza que deseja remover a sala "${room.name}"?`)) {
   try {
    await deleteRoomMutation.mutateAsync(room.id)
    toast({
     title: 'Sala removida',
     description: `A sala "${room.name}" foi removida com sucesso.`,
    })
   } catch (error) {
    toast({
     title: 'Erro ao remover sala',
     description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
     variant: 'destructive',
    })
   }
  }
 }

 const handlePageChange = (page: number) => {
  setCurrentPage(page)
 }

 if (error) {
  return (
   <Alert variant="destructive">
    <AlertDescription>
     Erro ao carregar salas. Tente novamente.
     <Button
      variant="outline"
      size="sm"
      onClick={() => refetch()}
      className="ml-2"
     >
      Tentar novamente
     </Button>
    </AlertDescription>
   </Alert>
  )
 }

 return (
  <div className="space-y-6">
   {/* Header */}
   <div className="flex justify-between items-center">
    <div>
     <h1 className="text-2xl font-bold">Gestão de Salas</h1>
     <p className="text-muted-foreground">
      Gerencie os consultórios e salas da clínica
     </p>
    </div>
    <Button onClick={onCreateRoom}>
     <Plus className="h-4 w-4 mr-2" />
     Nova Sala
    </Button>
   </div>

   {/* Search and Filters */}
   <Card>
    <CardHeader>
     <CardTitle className="text-lg">Filtros</CardTitle>
    </CardHeader>
    <CardContent>
     <div className="flex gap-4 items-center">
      <div className="flex-1 relative">
       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
       <Input
        placeholder="Buscar salas por nome, descrição ou recursos..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
       />
      </div>
      <Button
       variant={showInactive ? "default" : "outline"}
       onClick={() => setShowInactive(!showInactive)}
       size="sm"
      >
       {showInactive ? 'Mostrar Ativas' : 'Mostrar Inativas'}
      </Button>
     </div>
    </CardContent>
   </Card>

   {/* Rooms Table */}
   <Card>
    <CardHeader>
     <CardTitle className="flex items-center justify-between">
      <span>
       Salas {roomsData && `(${roomsData.total} ${roomsData.total === 1 ? 'sala' : 'salas'})`}
      </span>
      {isLoading && (
       <div className="text-sm text-muted-foreground">Carregando...</div>
      )}
     </CardTitle>
    </CardHeader>
    <CardContent>
     {roomsData?.rooms.length === 0 ? (
      <div className="text-center py-8">
       <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
       <h3 className="text-lg font-medium text-muted-foreground mb-2">
        {searchQuery ? 'Nenhuma sala encontrada' : 'Nenhuma sala cadastrada'}
       </h3>
       <p className="text-muted-foreground mb-4">
        {searchQuery 
         ? 'Tente ajustar os filtros de busca.'
         : 'Comece criando a primeira sala da clínica.'
        }
       </p>
       {!searchQuery && (
        <Button onClick={onCreateRoom}>
         <Plus className="h-4 w-4 mr-2" />
         Criar Primeira Sala
        </Button>
       )}
      </div>
     ) : (
      <>
       <Table>
        <TableHeader>
         <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Recursos</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
         </TableRow>
        </TableHeader>
        <TableBody>
         {roomsData?.rooms.map((room) => (
          <TableRow key={room.id}>
           <TableCell className="font-medium">
            {room.name}
           </TableCell>
           <TableCell>
            <div className="max-w-xs truncate">
             {room.description || '-'}
            </div>
           </TableCell>
           <TableCell>
            <div className="flex flex-wrap gap-1">
             {room.resources?.slice(0, 3).map((resource, index) => (
              <Badge key={index} variant="info" className="text-xs badge-available">
               {resource}
              </Badge>
             ))}
             {room.resources && room.resources.length > 3 && (
              <Badge variant="info" className="text-xs badge-available">
               +{room.resources.length - 3}
              </Badge>
             )}
             {(!room.resources || room.resources.length === 0) && (
              <span className="text-muted-foreground text-sm">Nenhum</span>
             )}
            </div>
           </TableCell>
           <TableCell>
            <Badge
             variant={room.active ? "success" : "secondary"}
             className={`flex items-center gap-1 w-fit ${room.active ? 'badge-active' : 'badge-inactive'}`}
            >
             {room.active ? (
              <CheckCircle className="h-3 w-3" />
             ) : (
              <XCircle className="h-3 w-3" />
             )}
             {room.active ? 'Ativa' : 'Inativa'}
            </Badge>
           </TableCell>
           <TableCell className="text-right">
            <div className="flex justify-end gap-2">
             <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewRoom(room)}
             >
              <Eye className="h-4 w-4" />
             </Button>
             <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditRoom(room)}
             >
              <Edit className="h-4 w-4" />
             </Button>
             <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteRoom(room)}
              disabled={deleteRoomMutation.isPending}
              className="text-red-600 hover:"
             >
              <Trash2 className="h-4 w-4" />
             </Button>
            </div>
           </TableCell>
          </TableRow>
         ))}
        </TableBody>
       </Table>

       {/* Pagination */}
       {roomsData && roomsData.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
         <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
         >
          Anterior
         </Button>
         
         <div className="flex items-center gap-2">
          {Array.from({ length: roomsData.totalPages }, (_, i) => i + 1)
           .filter(page => 
            page === 1 || 
            page === roomsData.totalPages || 
            Math.abs(page - currentPage) <= 1
           )
           .map((page, index, array) => (
            <React.Fragment key={page}>
             {index > 0 && array[index - 1] !== page - 1 && (
              <span className="text-muted-foreground">...</span>
             )}
             <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
             >
              {page}
             </Button>
            </React.Fragment>
           ))
          }
         </div>

         <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === roomsData.totalPages}
         >
          Próxima
         </Button>
        </div>
       )}
      </>
     )}
    </CardContent>
   </Card>
  </div>
 )
}