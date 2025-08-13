import React, { useState } from 'react'
import { Calendar, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRoomAvailability } from '@/hooks/useRooms'
import { Room } from '@/types/entities'

interface RoomAvailabilityProps {
  room: Room
}

export const RoomAvailability: React.FC<RoomAvailabilityProps> = ({ room }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0] // Format: YYYY-MM-DD
  })

  const {
    data: availability,
    isLoading,
    error,
    refetch
  } = useRoomAvailability(room.id, selectedDate)

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  const formatTimeSlot = (slot: string) => {
    const [start, end] = slot.split('-')
    return `${start} - ${end}`
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const endHour = minute === 30 ? hour + 1 : hour
        const endMinute = minute === 30 ? 0 : 30
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
        slots.push(`${startTime}-${endTime}`)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()
  const occupiedSlots = availability?.occupiedSlots || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Disponibilidade da Sala
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="date">Data para Consulta</Label>
          <div className="flex gap-2">
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-auto"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Room Status */}
        <div className="flex items-center gap-2">
          <Badge
            variant={room.active ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {room.active ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {room.active ? 'Sala Ativa' : 'Sala Inativa'}
          </Badge>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              Erro ao carregar disponibilidade. Tente novamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando disponibilidade...</span>
          </div>
        )}

        {/* Availability Display */}
        {availability && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                Disponibilidade para {new Date(selectedDate).toLocaleDateString('pt-BR')}
              </h3>
              <Badge
                variant={availability.available ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {availability.available ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {availability.available ? 'Disponível' : 'Indisponível'}
              </Badge>
            </div>

            {!room.active && (
              <Alert>
                <AlertDescription>
                  Esta sala está inativa e não pode ser utilizada para agendamentos.
                </AlertDescription>
              </Alert>
            )}

            {room.active && availability.available && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Horários de funcionamento: 08:00 - 18:00</span>
                </div>

                {/* Occupied Slots */}
                {occupiedSlots.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Horários Ocupados:</h4>
                    <div className="flex flex-wrap gap-2">
                      {occupiedSlots.map((slot, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {formatTimeSlot(slot)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Slots */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    Horários Disponíveis:
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((slot, index) => {
                      const isOccupied = occupiedSlots.includes(slot)
                      return (
                        <Badge
                          key={index}
                          variant={isOccupied ? "secondary" : "outline"}
                          className={`text-xs justify-center ${
                            isOccupied 
                              ? 'bg-red-100 text-red-800 border-red-200' 
                              : 'bg-green-100 text-green-800 border-green-200'
                          }`}
                        >
                          {formatTimeSlot(slot)}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                {occupiedSlots.length === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Todos os horários estão disponíveis para esta data.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}