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
  SCHEDULED: 'appointment-scheduled shadow-lg font-semibold border',
  CONFIRMED: 'appointment-confirmed shadow-lg font-semibold border',
  IN_PROGRESS: 'appointment-progress shadow-lg font-semibold border',
  COMPLETED: 'appointment-completed shadow-lg font-semibold border',
  CANCELLED: 'appointment-cancelled shadow-lg font-semibold border',
  NO_SHOW: 'appointment-noshow shadow-lg font-semibold border',
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
              className="grid grid-cols-12 gap-2 min-h-[60px] border-b border-gray-100 dark:border-gray-700 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              onClick={() => onTimeSlotClick?.(currentDate, time)}
            >
              <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {time}
              </div>
              <div className="col-span-10 space-y-1">
                {timeAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all shadow-sm hover:shadow-md ${STATUS_COLORS[appointment.status]}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onAppointmentClick?.(appointment)
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">{appointment.patient?.fullName}</div>
                      <Badge variant="outline" className="text-xs border-white/30 text-white/90">
                        {TYPE_LABELS[appointment.type]}
                      </Badge>
                    </div>
                    <div className="text-xs flex items-center gap-3">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {appointment.partner?.fullName}
                      </span>
                      {appointment.room && (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {appointment.room.name}
                        </span>
                      )}
                    </div>
                    {appointment.productService && (
                      <div className="text-xs text-white/80 mt-1">
                        {appointment.productService.name}
                      </div>
                    )}
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
      <div className="overflow-x-auto">
        <div 
          className="grid grid-cols-8 min-w-[800px] calendar-grid"
          style={{ backgroundColor: 'var(--calendar-bg, white)' }}
        >
          {/* Header com horários */}
          <div className="p-3 bg-gray-100 dark:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-600">
            <Clock className="w-4 h-4" />
          </div>
          {weekDays.map(day => (
            <div 
              key={day.toISOString()} 
              className="p-3 text-center border-b border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors bg-gray-100 dark:bg-gray-700 last:border-r-0"
              onClick={() => onDateClick?.(day)}
            >
              <div className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                {format(day, 'EEE', { locale: ptBR })}
              </div>
              <div className={`text-lg font-bold mt-1 ${isSameDay(day, new Date()) ? 'bg-blue-500 dark:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-900 dark:text-gray-100'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}

          {/* Slots de horário */}
          {HOUR_SLOTS.map(time => (
            <React.Fragment key={time}>
              <div className="p-3 text-sm text-gray-700 dark:text-gray-400 border-r border-b border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 font-medium flex items-center">
                {time}
              </div>
              {weekDays.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const dayAppointments = appointmentsByDate[dateKey] || []
                const timeAppointments = dayAppointments.filter(apt => apt.startTime === time)

                return (
                  <div 
                    key={`${day.toISOString()}-${time}`}
                    className="p-1 border-r border-b border-gray-200 dark:border-gray-600 min-h-[50px] hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors last:border-r-0"
                    style={{ backgroundColor: 'var(--calendar-bg, white)' }}
                    onClick={() => onTimeSlotClick?.(day, time)}
                  >
                    {timeAppointments.map(appointment => (
                      <div
                        key={appointment.id}
                        className={`text-xs p-2 rounded-md mb-1 cursor-pointer transition-all shadow-sm hover:shadow-md ${STATUS_COLORS[appointment.status]} ${
                          appointment.isEncaixe ? 'ring-2 ring-orange-400 dark:ring-orange-500' : ''
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
      <div 
        className="grid grid-cols-7 calendar-grid"
        style={{ backgroundColor: 'var(--calendar-bg, white)' }}
      >
        {/* Header dos dias da semana */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="p-3 text-center font-medium text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 last:border-r-0">
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
                !isCurrentMonth ? 'text-gray-400' : ''
              } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
              style={{ 
                backgroundColor: isToday 
                  ? '#eff6ff' 
                  : !isCurrentMonth 
                    ? 'var(--calendar-bg-muted, #f9fafb)' 
                    : 'var(--calendar-bg, white)' 
              }}
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
                  <div className="text-xs text-white/70 font-medium">
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
    // FORÇA FUNDO BRANCO: CSS Variables + Inline Styles
    <Card 
      className="border border-gray-200 dark:border-gray-700"
      style={{ backgroundColor: 'var(--calendar-bg, white)' }}
    >
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {getDateTitle()}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Seletor de visualização */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['day', 'week', 'month'] as CalendarView[]).map((viewType) => (
                <Button
                  key={viewType}
                  variant={view === viewType ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView(viewType)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    view === viewType 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {viewType === 'day' ? 'Dia' : viewType === 'week' ? 'Semana' : 'Mês'}
                </Button>
              ))}
            </div>

            {/* Navegação */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
                className="h-8 w-8 p-0 border-gray-400 text-gray-800 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="h-8 px-3 text-xs font-medium border-gray-400 text-gray-800 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Hoje
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
                className="h-8 w-8 p-0 border-gray-400 text-gray-800 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
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
