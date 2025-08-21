import React, { useState, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameMonth, isSameDay, addMonths, subMonths, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { QuickActions } from './QuickActions'
import { useAppointmentsByDateRange } from '../../../hooks/useAppointments'
import { Appointment, AppointmentStatus, AppointmentType } from '../../../types/entities'
import { ChevronLeft, ChevronRight, Calendar, Clock, User, MapPin } from 'lucide-react'

type CalendarView = 'day' | 'week' | 'month'

interface AppointmentCalendarProps {
  onAppointmentClick?: (appointment: Appointment) => void
  onDateClick?: (date: Date) => void
  onTimeSlotClick?: (date: Date, time: string) => void
  onAppointmentEdit?: (appointment: Appointment) => void
  filters?: {
    partnerId?: string
    roomId?: string
    status?: AppointmentStatus
    type?: AppointmentType
  }
}

const HOUR_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 7 // Horário de 07:00 às 20:00
  return `${hour.toString().padStart(2, '0')}:00`
})

const STATUS_COLORS = {
  SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  NO_SHOW: 'bg-orange-100 text-orange-800 border-orange-200',
}

const STATUS_LABELS = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
}

const TYPE_LABELS = {
  CONSULTATION: 'Consulta',
  EXAM: 'Exame',
  PROCEDURE: 'Procedimento',
  RETURN: 'Retorno',
}

export function AppointmentCalendar({
  onAppointmentClick,
  onDateClick,
  onTimeSlotClick,
  onAppointmentEdit,
  filters = {}
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('week')

  // Calcular período baseado na visualização
  const { startDate, endDate } = useMemo(() => {
    switch (view) {
      case 'day':
        return {
          startDate: format(currentDate, 'yyyy-MM-dd'),
          endDate: format(currentDate, 'yyyy-MM-dd')
        }
      case 'week':
        return {
          startDate: format(startOfWeek(currentDate, { locale: ptBR }), 'yyyy-MM-dd'),
          endDate: format(endOfWeek(currentDate, { locale: ptBR }), 'yyyy-MM-dd')
        }
      case 'month':
        return {
          startDate: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(currentDate), 'yyyy-MM-dd')
        }
    }
  }, [currentDate, view])

  const { data: appointments = [], isLoading } = useAppointmentsByDateRange(startDate, endDate)

  // Filtrar agendamentos baseado nos filtros
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      if (filters.partnerId && appointment.partnerId !== filters.partnerId) return false
      if (filters.roomId && appointment.roomId !== filters.roomId) return false
      if (filters.status && appointment.status !== filters.status) return false
      if (filters.type && appointment.type !== filters.type) return false
      return true
    })
  }, [appointments, filters])

  // Agrupar agendamentos por data
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {}
    filteredAppointments.forEach(appointment => {
      // Usar apenas a parte da data, ignorando horário e timezone
      const dateKey = appointment.date.split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(appointment)
    })

    
    return grouped
  }, [filteredAppointments])

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      switch (view) {
        case 'day':
          return direction === 'prev' ? addDays(prev, -1) : addDays(prev, 1)
        case 'week':
          return direction === 'prev' ? addDays(prev, -7) : addDays(prev, 7)
        case 'month':
          return direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
      }
    })
  }

  const getDateTitle = () => {
    switch (view) {
      case 'day':
        return format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
      case 'week':
        const weekStart = startOfWeek(currentDate, { locale: ptBR })
        const weekEnd = endOfWeek(currentDate, { locale: ptBR })
        return `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, 'd MMM yyyy', { locale: ptBR })}`
      case 'month':
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })
    }
  }

  const renderDayView = () => {
    const dateKey = format(currentDate, 'yyyy-MM-dd')
    const dayAppointments = appointmentsByDate[dateKey] || []


    return (
      <div className="space-y-2">
        {HOUR_SLOTS.map(time => {
          const timeAppointments = dayAppointments.filter(apt => apt.startTime === time)
          
          return (
            <div 
              key={time} 
              className="grid grid-cols-12 gap-2 min-h-[60px] border-b border-gray-100 py-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => onTimeSlotClick?.(currentDate, time)}
            >
              <div className="col-span-2 text-sm text-gray-600 font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {time}
              </div>
              <div className="col-span-10 space-y-1">
                {timeAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className={`p-2 rounded border cursor-pointer transition-colors ${STATUS_COLORS[appointment.status]} hover:opacity-80`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onAppointmentClick?.(appointment)
                    }}
                  >
                    <div className="font-medium text-sm">{appointment.patient?.fullName}</div>
                    <div className="text-xs flex items-center gap-2">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {appointment.partner?.fullName}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {appointment.room?.name}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {TYPE_LABELS[appointment.type]}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { locale: ptBR })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
      <div className="grid grid-cols-8 gap-1">
        {/* Header com horários */}
        <div className="p-2"></div>
        {weekDays.map(day => (
          <div 
            key={day.toISOString()} 
            className="p-2 text-center border-b cursor-pointer hover:bg-gray-50"
            onClick={() => onDateClick?.(day)}
          >
            <div className="font-medium">{format(day, 'EEE', { locale: ptBR })}</div>
            <div className={`text-lg ${isSameDay(day, new Date()) ? 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}

        {/* Slots de horário */}
        {HOUR_SLOTS.map(time => (
          <React.Fragment key={time}>
            <div className="p-2 text-sm text-gray-600 border-r">
              {time}
            </div>
            {weekDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const dayAppointments = appointmentsByDate[dateKey] || []
              const timeAppointments = dayAppointments.filter(apt => apt.startTime === time)

              return (
                <div 
                  key={`${day.toISOString()}-${time}`}
                  className="p-1 border-r border-b min-h-[50px] hover:bg-gray-50 cursor-pointer"
                  onClick={() => onTimeSlotClick?.(day, time)}
                >
                  {timeAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className={`text-xs p-1 rounded mb-1 cursor-pointer ${STATUS_COLORS[appointment.status]} ${
                        appointment.isEncaixe ? 'border-2 border-orange-400 shadow-sm' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onAppointmentClick?.(appointment)
                      }}
                      title={`${appointment.isEncaixe ? '📌 ENCAIXE - ' : ''}${appointment.patient?.fullName} - ${appointment.partner?.fullName}`}
                    >
                      <div className="truncate font-medium">
                        {appointment.isEncaixe && '📌 '}
                        {appointment.patient?.fullName}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    )
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { locale: ptBR })
    const calendarEnd = endOfWeek(monthEnd, { locale: ptBR })

    const calendarDays = []
    let currentDay = calendarStart

    while (currentDay <= calendarEnd) {
      calendarDays.push(currentDay)
      currentDay = addDays(currentDay, 1)
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Header dos dias da semana */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="p-3 text-center font-medium text-gray-600 border-b">
            {day}
          </div>
        ))}

        {/* Dias do calendário */}
        {calendarDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayAppointments = appointmentsByDate[dateKey] || []
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, new Date())

          return (
            <div 
              key={day.toISOString()}
              className={`p-2 min-h-[100px] border cursor-pointer hover:bg-gray-50 ${
                !isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''
              } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
              onClick={() => onDateClick?.(day)}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map(appointment => (
                  <div
                    key={appointment.id}
                    className={`text-xs p-1 rounded cursor-pointer ${STATUS_COLORS[appointment.status]}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onAppointmentClick?.(appointment)
                    }}
                    title={`${appointment.startTime} - ${appointment.patient?.fullName}`}
                  >
                    <div className="truncate">{appointment.startTime} {appointment.patient?.fullName}</div>
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayAppointments.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando calendário...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {getDateTitle()}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Seletor de visualização */}
            <div className="flex border rounded-md">
              {(['day', 'week', 'month'] as CalendarView[]).map((viewType) => (
                <Button
                  key={viewType}
                  variant={view === viewType ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView(viewType)}
                  className="rounded-none first:rounded-l-md last:rounded-r-md"
                >
                  {viewType === 'day' ? 'Dia' : viewType === 'week' ? 'Semana' : 'Mês'}
                </Button>
              ))}
            </div>

            {/* Navegação */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoje
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </CardContent>
    </Card>
  )
}
