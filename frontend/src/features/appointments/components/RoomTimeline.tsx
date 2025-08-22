import React, { useMemo, useState } from 'react'
import { format, parseISO, startOfDay, endOfDay, addDays, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { useAppointmentsByDateRange } from '../../../hooks/useAppointments'
import { useRooms } from '../../../hooks/useRooms'
import { Appointment, AppointmentStatus } from '../../../types/entities'
import { MapPin, Clock, User, Calendar, Plus, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { AppointmentForm } from './AppointmentForm'

interface RoomTimelineProps {
  selectedDate: Date
  onAppointmentClick?: (appointment: Appointment) => void
  onTimeSlotClick?: (roomId: string, time: string) => void
  onDateChange?: (date: Date) => void
}

const HOUR_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 7 // Horário de 07:00 às 20:00
  return `${hour.toString().padStart(2, '0')}:00`
})

const STATUS_COLORS = {
  SCHEDULED: 'badge-available',
  CONFIRMED: 'badge-active',
  IN_PROGRESS: 'badge-unavailable',
  COMPLETED: 'badge-inactive',
  CANCELLED: 'badge-stock-out',
  NO_SHOW: 'badge-unavailable',
}

const STATUS_VARIANTS = {
  SCHEDULED: 'info',
  CONFIRMED: 'success',
  IN_PROGRESS: 'warning',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
  NO_SHOW: 'warning',
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
  onTimeSlotClick,
  onDateChange
}: RoomTimelineProps) {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ roomId: string; time: string } | null>(null)
  const [showMultipleAppointments, setShowMultipleAppointments] = useState(false)
  const [multipleAppointments, setMultipleAppointments] = useState<Appointment[]>([])
  const [multipleAppointmentsPosition, setMultipleAppointmentsPosition] = useState<{ x: number; y: number } | null>(null)
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  
  const { data: roomsData, isLoading: roomsLoading } = useRooms({ active: true })
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointmentsByDateRange(dateStr, dateStr)

  // Filtrar apenas salas ativas
  const activeRooms = roomsData?.rooms || []
  
  // Estado de carregamento combinado
  const isLoading = roomsLoading || appointmentsLoading

  // Debug removido - funcionando corretamente

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

  const handleTimeSlotClick = (roomId: string, time: string) => {
    console.log('🎯 Clique no slot de agendamento:', { roomId, time })
    setSelectedTimeSlot({ roomId, time })
    setShowAppointmentForm(true)
  }

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1)
    onDateChange?.(newDate)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Timeline de Ocupação das Salas
            </CardTitle>
            
            {/* Navegação de data */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDateNavigation('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Badge variant="outline" className="px-3 py-1 text-sm">
                <CalendarDays className="w-4 h-4 mr-1" />
                {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
              </Badge>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDateNavigation('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Resumo de ocupação das salas */}
          {activeRooms.length === 0 ? (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200">
                {isLoading ? 'Carregando salas...' : 'Nenhuma sala ativa encontrada. Verifique se há salas cadastradas e ativas.'}
              </p>
            </div>
          ) : (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activeRooms.map(room => {
              const stats = roomStats[room.id]
              if (!stats) return null

              return (
                <div key={room.id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{room.name}</div>
                    <div className={`text-lg font-bold ${getOccupancyColor(stats.occupancyRate)}`}>
                      {stats.occupancyRate.toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {stats.occupied}/{stats.total} horários ocupados
                  </div>
                  
                  {/* Mini timeline visual */}
                  <div className="flex gap-0.5 mb-2">
                    {HOUR_SLOTS.slice(0, 8).map(time => {
                      const hasAppointment = appointmentsByRoomAndTime[room.id]?.[time]?.length > 0
                      return (
                        <div
                          key={time}
                          className={`w-2 h-2 rounded-sm ${
                            hasAppointment ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          title={`${time} - ${hasAppointment ? 'Ocupado' : 'Livre'}`}
                        />
                      )
                    })}
                  </div>
                  
                  {/* Indicadores de status */}
                  <div className="flex gap-1">
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
          )}

          {/* Timeline principal melhorada */}
          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
            {/* Cabeçalho das salas com scroll horizontal */}
            <div className="overflow-x-auto">
              <div className="min-w-fit">
                <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex">
                    <div className="w-20 p-3 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 font-medium text-sm text-gray-700 dark:text-gray-300 sticky left-0 z-10">
                      Horário
                    </div>
                    {activeRooms.map(room => (
                      <div 
                        key={room.id} 
                        className="w-40 p-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0 text-center font-medium text-sm flex-shrink-0 bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{room.name}</div>
                        {room.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {room.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linhas de horários */}
                <div className="max-h-96 overflow-y-auto">
                  {HOUR_SLOTS.map((time, index) => (
                    <div key={time} className={`flex border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}`}>
                      {/* Coluna de horário - sticky */}
                      <div className="w-20 p-3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center font-medium text-sm text-gray-700 dark:text-gray-300 sticky left-0 z-10">
                        <Clock className="w-3 h-3 mr-1.5" />
                        {time}
                      </div>

                      {/* Colunas das salas com largura fixa */}
                      {activeRooms.map(room => {
                        const timeSlotAppointments = appointmentsByRoomAndTime[room.id]?.[time] || []
                        const hasAppointment = timeSlotAppointments.length > 0

                        return (
                          <div 
                            key={`${room.id}-${time}`}
                            className={`w-40 p-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0 min-h-[70px] cursor-pointer transition-all duration-200 flex-shrink-0 ${
                              hasAppointment 
                                ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-l-2 border-l-blue-400 dark:border-l-blue-500' 
                                : 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-l-2 hover:border-l-green-400 dark:hover:border-l-green-500'
                            }`}
                            onClick={(e) => {
                              if (timeSlotAppointments.length === 1) {
                                onAppointmentClick?.(timeSlotAppointments[0])
                              } else if (timeSlotAppointments.length === 0) {
                                handleTimeSlotClick(room.id, time)
                              } else {
                                // Múltiplos agendamentos - mostrar popup de seleção
                                const rect = e.currentTarget.getBoundingClientRect()
                                setMultipleAppointments(timeSlotAppointments)
                                setMultipleAppointmentsPosition({
                                  x: rect.left + rect.width / 2,
                                  y: rect.top
                                })
                                setShowMultipleAppointments(true)
                              }
                            }}
                          >
                            {timeSlotAppointments.length > 0 ? (
                              <div className="space-y-1">
                                {timeSlotAppointments.slice(0, 1).map(appointment => (
                                  <div key={appointment.id} className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <Badge 
                                        variant={STATUS_VARIANTS[appointment.status] as any}
                                        className={`w-2 h-2 p-0 rounded-full ${STATUS_COLORS[appointment.status]}`}
                                        title={STATUS_LABELS[appointment.status]}
                                      />
                                      <span className="font-medium text-xs truncate dark:text-gray-100">
                                        {appointment.isEncaixe && '📌 '}
                                        {appointment.patient?.fullName}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                      <User className="w-3 h-3" />
                                      <span className="truncate">
                                        {appointment.partner?.fullName?.split(' ')[0]}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {appointment.productService?.name}
                                    </div>
                                  </div>
                                ))}
                                {timeSlotAppointments.length > 1 && (
                                  <div className="text-xs text-orange-600 font-medium bg-orange-50 px-1 rounded">
                                    +{timeSlotAppointments.length - 1} encaixe(s)
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                  <Plus className="w-4 h-4 mx-auto mb-1" />
                                  <div className="text-xs">Agendar</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legenda e estatísticas */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Legenda */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-3">Status dos Agendamentos:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span>{STATUS_LABELS[status as AppointmentStatus]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estatísticas do dia */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium mb-3">Resumo do Dia:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Total de agendamentos:</span>
                  <span className="font-semibold">{appointments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Salas ativas:</span>
                  <span className="font-semibold">{activeRooms.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Horários disponíveis:</span>
                  <span className="font-semibold">
                    {activeRooms.length * HOUR_SLOTS.length - appointments.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popup de seleção para múltiplos agendamentos */}
      {showMultipleAppointments && multipleAppointmentsPosition && (
        <>
          {/* Backdrop para fechar o popup */}
          <div 
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setShowMultipleAppointments(false)}
          />
          
          {/* Popup */}
          <div 
            className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-64"
            style={{
              left: `${multipleAppointmentsPosition.x - 128}px`, // 128px = metade da largura mínima
              top: `${multipleAppointmentsPosition.y - 10}px`
            }}
          >
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
              Múltiplos agendamentos encontrados:
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {multipleAppointments.map(appointment => (
                <button
                  key={appointment.id}
                  className="w-full text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    setShowMultipleAppointments(false)
                    onAppointmentClick?.(appointment)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-2 h-2 rounded-full ${STATUS_COLORS[appointment.status]}`}
                      title={STATUS_LABELS[appointment.status]}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">
                        {appointment.isEncaixe && '📌 '}
                        {appointment.patient?.fullName}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {appointment.partner?.fullName} • {appointment.productService?.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {appointment.startTime} - {appointment.endTime}
                        {appointment.isEncaixe && ' (Encaixe)'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Opção para criar novo agendamento */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <button
                className="w-full text-left p-2 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-green-700 dark:text-green-400"
                onClick={() => {
                  setShowMultipleAppointments(false)
                  // Assumir que temos os dados do primeiro slot para pegar sala e horário
                  const firstAppointment = multipleAppointments[0]
                  if (firstAppointment) {
                    handleTimeSlotClick(firstAppointment.roomId!, firstAppointment.startTime)
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Novo encaixe neste horário</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de agendamento */}
      {showAppointmentForm && selectedTimeSlot && (
        <AppointmentForm
          open={showAppointmentForm}
          onOpenChange={(open) => {
            console.log('🔄 Modal state change:', open)
            setShowAppointmentForm(open)
            if (!open) {
              setSelectedTimeSlot(null)
            }
          }}
          initialData={{
            roomId: selectedTimeSlot.roomId,
            date: format(selectedDate, 'yyyy-MM-dd'),
            startTime: selectedTimeSlot.time
          }}
          onSuccess={(appointment) => {
            console.log('✅ Agendamento criado com sucesso:', appointment)
            setShowAppointmentForm(false)
            setSelectedTimeSlot(null)
          }}
        />
      )}
    </>
  )
}
