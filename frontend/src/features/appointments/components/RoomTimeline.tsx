import React, { useMemo } from 'react'
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { useAppointmentsByDateRange } from '../../../hooks/useAppointments'
import { useRooms } from '../../../hooks/useRooms'
import { Appointment, AppointmentStatus } from '../../../types/entities'
import { MapPin, Clock, User, Calendar } from 'lucide-react'

interface RoomTimelineProps {
  selectedDate: Date
  onAppointmentClick?: (appointment: Appointment) => void
  onTimeSlotClick?: (roomId: string, time: string) => void
}

const HOUR_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 7 // Horário de 07:00 às 20:00
  return `${hour.toString().padStart(2, '0')}:00`
})

const STATUS_COLORS = {
  SCHEDULED: 'bg-blue-500',
  CONFIRMED: 'bg-green-500',
  IN_PROGRESS: 'bg-yellow-500',
  COMPLETED: 'bg-gray-500',
  CANCELLED: 'bg-red-500',
  NO_SHOW: 'bg-orange-500',
}

const STATUS_LABELS = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
}

export function RoomTimeline({
  selectedDate,
  onAppointmentClick,
  onTimeSlotClick
}: RoomTimelineProps) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  
  const { data: rooms = [] } = useRooms({ active: true })
  const { data: appointments = [], isLoading } = useAppointmentsByDateRange(dateStr, dateStr)

  // Filtrar apenas salas ativas e que tenham appointments ou estejam disponíveis
  const activeRooms = rooms.data?.rooms || []

  // Agrupar agendamentos por sala e horário
  const appointmentsByRoomAndTime = useMemo(() => {
    const grouped: Record<string, Record<string, Appointment[]>> = {}
    
    // Inicializar estrutura para todas as salas ativas
    activeRooms.forEach(room => {
      grouped[room.id] = {}
      HOUR_SLOTS.forEach(time => {
        grouped[room.id][time] = []
      })
    })

    // Agrupar agendamentos
    appointments.forEach(appointment => {
      if (grouped[appointment.roomId] && grouped[appointment.roomId][appointment.startTime]) {
        grouped[appointment.roomId][appointment.startTime].push(appointment)
      }
    })

    return grouped
  }, [appointments, activeRooms])

  // Calcular estatísticas de ocupação para cada sala
  const roomStats = useMemo(() => {
    const stats: Record<string, {
      total: number
      occupied: number
      occupancyRate: number
      byStatus: Record<AppointmentStatus, number>
    }> = {}

    activeRooms.forEach(room => {
      const roomAppointments = appointments.filter(apt => apt.roomId === room.id)
      const totalSlots = HOUR_SLOTS.length
      const occupiedSlots = new Set(roomAppointments.map(apt => apt.startTime)).size
      
      const byStatus: Record<AppointmentStatus, number> = {
        SCHEDULED: 0,
        CONFIRMED: 0,
        IN_PROGRESS: 0,
        COMPLETED: 0,
        CANCELLED: 0,
        NO_SHOW: 0,
      }

      roomAppointments.forEach(apt => {
        byStatus[apt.status]++
      })

      stats[room.id] = {
        total: totalSlots,
        occupied: occupiedSlots,
        occupancyRate: (occupiedSlots / totalSlots) * 100,
        byStatus
      }
    })

    return stats
  }, [appointments, activeRooms])

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'text-red-600'
    if (rate >= 60) return 'text-yellow-600'
    if (rate >= 40) return 'text-blue-600'
    return 'text-green-600'
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando timeline das salas...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Timeline de Ocupação das Salas
          <Badge variant="outline" className="ml-2">
            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Cabeçalho com estatísticas */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeRooms.map(room => {
            const stats = roomStats[room.id]
            if (!stats) return null

            return (
              <div key={room.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-1">{room.name}</div>
                <div className={`text-lg font-bold ${getOccupancyColor(stats.occupancyRate)}`}>
                  {stats.occupancyRate.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600">
                  {stats.occupied}/{stats.total} slots ocupados
                </div>
                
                {/* Indicadores de status */}
                <div className="flex gap-1 mt-2">
                  {Object.entries(stats.byStatus).map(([status, count]) => {
                    if (count === 0) return null
                    return (
                      <div
                        key={status}
                        className={`w-2 h-2 rounded-full ${STATUS_COLORS[status as AppointmentStatus]}`}
                        title={`${STATUS_LABELS[status as AppointmentStatus]}: ${count}`}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Timeline principal */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Cabeçalho com nomes das salas */}
            <div className="grid grid-cols-12 gap-1 mb-2">
              <div className="col-span-2 p-2 font-medium text-sm text-gray-600">
                Horário
              </div>
              {activeRooms.map(room => (
                <div 
                  key={room.id} 
                  className="col-span-2 p-2 text-center font-medium text-sm bg-gray-50 rounded"
                >
                  {room.name}
                  {room.description && (
                    <div className="text-xs text-gray-500 truncate">
                      {room.description}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Grid de horários */}
            {HOUR_SLOTS.map(time => (
              <div key={time} className="grid grid-cols-12 gap-1 mb-1">
                {/* Coluna do horário */}
                <div className="col-span-2 p-2 text-sm text-gray-600 font-medium flex items-center border-r">
                  <Clock className="w-4 h-4 mr-1" />
                  {time}
                </div>

                {/* Colunas das salas */}
                {activeRooms.map(room => {
                  const timeSlotAppointments = appointmentsByRoomAndTime[room.id]?.[time] || []
                  const hasAppointment = timeSlotAppointments.length > 0

                  return (
                    <div 
                      key={`${room.id}-${time}`}
                      className={`col-span-2 p-2 min-h-[60px] border rounded cursor-pointer transition-colors ${
                        hasAppointment 
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => {
                        if (timeSlotAppointments.length === 1) {
                          onAppointmentClick?.(timeSlotAppointments[0])
                        } else {
                          onTimeSlotClick?.(room.id, time)
                        }
                      }}
                    >
                      {timeSlotAppointments.length > 0 ? (
                        <div className="space-y-1">
                          {timeSlotAppointments.slice(0, 2).map(appointment => (
                            <div key={appointment.id} className="text-xs">
                              <div 
                                className={`w-2 h-2 rounded-full inline-block mr-1 ${STATUS_COLORS[appointment.status]}`}
                                title={STATUS_LABELS[appointment.status]}
                              />
                              <span className="font-medium truncate block">
                                {appointment.patient?.fullName}
                              </span>
                              <span className="text-gray-500 flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {appointment.partner?.fullName?.split(' ')[0]}
                              </span>
                            </div>
                          ))}
                          {timeSlotAppointments.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{timeSlotAppointments.length - 2} mais
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 text-center">
                          Disponível
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium mb-2">Legenda:</div>
          <div className="flex flex-wrap gap-4 text-xs">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span>{STATUS_LABELS[status as AppointmentStatus]}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
