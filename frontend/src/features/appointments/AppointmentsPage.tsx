import React, { useState } from 'react'
import { AppointmentCalendar } from './components/AppointmentCalendar'
import { AppointmentFilters } from './components/AppointmentFilters'
import { RoomTimeline } from './components/RoomTimeline'
import { PartnerAvailabilityView } from './components/PartnerAvailabilityView'
import { AppointmentForm } from './components/AppointmentForm'
import { AppointmentDetailsModal } from './components/AppointmentDetailsModal'
import { WaitingList } from './components/WaitingList'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { Appointment, AppointmentStatus, AppointmentType, Partner } from '../../types/entities'
import { Calendar, Users, MapPin, Plus, Filter, Clock } from 'lucide-react'

type ViewMode = 'calendar' | 'rooms' | 'partners'

interface AppointmentFilters {
  partnerId?: string
  roomId?: string
  productServiceId?: string
  status?: AppointmentStatus
  type?: AppointmentType
}

export function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<AppointmentFilters>({})
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [appointmentFormData, setAppointmentFormData] = useState<{
    date?: Date
    partnerId?: string
    time?: string
  }>({})

  // Handlers para eventos
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleTimeSlotClick = (dateOrRoomId: Date | string, time?: string) => {
    if (dateOrRoomId instanceof Date) {
      // Clique em slot de tempo do calendário
      setAppointmentFormData({
        date: dateOrRoomId,
        time
      })
    } else {
      // Clique em slot de sala (roomId)
      setAppointmentFormData({
        date: selectedDate,
        time
      })
    }
    setShowAppointmentForm(true)
  }

  const handlePartnerClick = (partner: Partner) => {
    if (selectedPartnerId === partner.id) {
      setSelectedPartnerId(undefined) // Desselecionar se já estava selecionado
    } else {
      setSelectedPartnerId(partner.id)
      setFilters(prev => ({ ...prev, partnerId: partner.id }))
    }
  }

  const handlePartnerTimeSlotClick = (partnerId: string, time: string) => {
    setAppointmentFormData({
      date: selectedDate,
      partnerId,
      time
    })
    setShowAppointmentForm(true)
  }

  const handleNewAppointmentClick = () => {
    setAppointmentFormData({})
    setShowAppointmentForm(true)
  }

  const clearFilters = () => {
    setFilters({})
    setSelectedPartnerId(undefined)
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== undefined && value !== '').length
  }

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'calendar':
        return <Calendar className="w-4 h-4" />
      case 'rooms':
        return <MapPin className="w-4 h-4" />
      case 'partners':
        return <Users className="w-4 h-4" />
    }
  }

  const getViewModeLabel = (mode: ViewMode) => {
    switch (mode) {
      case 'calendar':
        return 'Calendário'
      case 'rooms':
        return 'Salas'
      case 'partners':
        return 'Profissionais'
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie agendamentos, visualize disponibilidade e organize a agenda da clínica
          </p>
        </div>
        
                  <div className="flex items-center gap-3">
            {/* Lista de espera */}
            <WaitingList />
            
            {/* Botão de filtros */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={getActiveFiltersCount() > 0 ? 'border-blue-500 text-blue-600' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
            
            {/* Botão de novo agendamento */}
            <Button onClick={handleNewAppointmentClick}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
      </div>

      {/* Filtros (condicional) */}
      {showFilters && (
        <AppointmentFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
        />
      )}

      {/* Seletor de modo de visualização */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Visualização</CardTitle>
            
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <TabsList>
                {(['calendar', 'rooms', 'partners'] as ViewMode[]).map((mode) => (
                  <TabsTrigger key={mode} value={mode} className="flex items-center gap-2">
                    {getViewModeIcon(mode)}
                    {getViewModeLabel(mode)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
      </Card>

      {/* Conteúdo principal baseado no modo de visualização */}
      <div className="space-y-6">
        {viewMode === 'calendar' && (
          <AppointmentCalendar
            onAppointmentClick={handleAppointmentClick}
            onDateClick={handleDateClick}
            onTimeSlotClick={(date, time) => handleTimeSlotClick(date, time)}
            filters={filters}
          />
        )}

        {viewMode === 'rooms' && (
          <RoomTimeline
            selectedDate={selectedDate}
            onAppointmentClick={handleAppointmentClick}
            onTimeSlotClick={(roomId, time) => handleTimeSlotClick(roomId, time)}
          />
        )}

        {viewMode === 'partners' && (
          <PartnerAvailabilityView
            selectedDate={selectedDate}
            onPartnerClick={handlePartnerClick}
            onTimeSlotClick={handlePartnerTimeSlotClick}
            selectedPartnerId={selectedPartnerId}
          />
        )}
      </div>

      {/* Informações adicionais baseadas no modo de visualização */}
      {viewMode === 'rooms' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações das Salas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
                <span>Salas com baixa ocupação (&lt; 40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded" />
                <span>Salas com média ocupação (40-70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border border-red-300 rounded" />
                <span>Salas com alta ocupação (&gt; 70%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'partners' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dicas de Disponibilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• <strong>Verde:</strong> Horários disponíveis para agendamento</p>
              <p>• <strong>Vermelho:</strong> Horários ocupados com agendamentos</p>
              <p>• <strong>Amarelo:</strong> Horários bloqueados pelo profissional</p>
              <p>• <strong>Cinza:</strong> Horários fora do expediente</p>
              <p className="mt-3 text-blue-600">
                💡 Clique em um horário verde para criar um novo agendamento
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modais */}
      <AppointmentForm
        open={showAppointmentForm}
        onOpenChange={setShowAppointmentForm}
        initialDate={appointmentFormData.date}
        initialPartnerId={appointmentFormData.partnerId}
        initialTime={appointmentFormData.time}
        onSuccess={() => {
          setShowAppointmentForm(false)
          setAppointmentFormData({})
        }}
      />

      <AppointmentDetailsModal
        appointment={selectedAppointment || undefined}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />
    </div>
  )
}
