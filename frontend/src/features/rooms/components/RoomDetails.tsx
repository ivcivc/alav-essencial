import React from 'react'
import { MapPin, Calendar, CheckCircle, XCircle, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRoom } from '@/hooks/useRooms'
import { RoomAvailability } from './RoomAvailability'

interface RoomDetailsProps {
  roomId: string
}

export const RoomDetails: React.FC<RoomDetailsProps> = ({ roomId }) => {
  const {
    data: room,
    isLoading,
    error
  } = useRoom(roomId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando detalhes da sala...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar detalhes da sala. Tente novamente.
        </AlertDescription>
      </Alert>
    )
  }

  if (!room) {
    return (
      <Alert>
        <AlertDescription>
          Sala não encontrada.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Room Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{room.name}</h1>
            <Badge
              variant={room.active ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {room.active ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {room.active ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
          {room.description && (
            <p className="text-gray-600">{room.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Informações da Sala
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Nome</h3>
              <p className="text-gray-600">{room.name}</p>
            </div>

            {room.description && (
              <div className="space-y-2">
                <h3 className="font-medium">Descrição</h3>
                <p className="text-gray-600">{room.description}</p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-medium">Status</h3>
              <Badge
                variant={room.active ? "default" : "secondary"}
                className="flex items-center gap-1 w-fit"
              >
                {room.active ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {room.active ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Data de Criação</h3>
              <p className="text-gray-600">
                {new Date(room.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {room.updatedAt !== room.createdAt && (
              <div className="space-y-2">
                <h3 className="font-medium">Última Atualização</h3>
                <p className="text-gray-600">
                  {new Date(room.updatedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recursos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {room.resources && room.resources.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {room.resources.map((resource, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {resource}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                Nenhum recurso específico cadastrado para esta sala.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Room Availability */}
      <RoomAvailability room={room} />

      {/* Recent Appointments */}
      {room.appointments && room.appointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agendamentos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {room.appointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.startTime}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: {appointment.status}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {appointment.type === 'NEW' ? 'Nova consulta' : 'Retorno'}
                  </Badge>
                </div>
              ))}
              
              {room.appointments.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  E mais {room.appointments.length - 5} agendamentos...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Associated Services */}
      {room.productServiceRooms && room.productServiceRooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Serviços Associados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Esta sala está associada a {room.productServiceRooms.length} serviço(s).
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}