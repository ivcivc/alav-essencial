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
     <h1 className="text-3xl font-bold text-muted-foreground dark:text-muted-foreground">Agendamentos</h1>
     <p className="text-muted-foreground dark:text-muted-foreground mt-1">
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
       className={getActiveFiltersCount() > 0 ? 'border-primary text-primary bg-primary/10' : ''}
      >
       <Filter className="w-4 h-4 mr-2" />
       Filtros
       {getActiveFiltersCount() > 0 && (
        <Badge variant="info" className="ml-2 badge-available">
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
    <CardHeader className="pb-4">
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
       <CardTitle className="text-xl font-bold flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Visualização
       </CardTitle>
       <p className="text-sm text-muted-foreground mt-1">
        Escolha como visualizar os agendamentos da clínica
       </p>
      </div>
      
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full sm:w-auto">
       <TabsList className="grid w-full grid-cols-3">
        {(['calendar', 'rooms', 'partners'] as ViewMode[]).map((mode) => (
         <TabsTrigger 
          key={mode} 
          value={mode} 
          className="flex items-center gap-2"
         >
          {getViewModeIcon(mode)}
          <span className="hidden sm:inline">{getViewModeLabel(mode)}</span>
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
      onDateChange={setSelectedDate}
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
    <Card className="bg-card  border border-border ">
     <CardHeader>
      <CardTitle className="text-lg text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
       <MapPin className="w-5 h-5 text-green-600 dark:" />
       Legenda de Ocupação das Salas
      </CardTitle>
     </CardHeader>
     <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
       <div className="flex items-center gap-3 p-3 bg-card  rounded-lg border border-border ">
        <div className="w-4 h-4 rounded-full " />
        <span className="font-medium text-muted-foreground dark:text-muted-foreground">Baixa ocupação (&lt; 40%)</span>
       </div>
       <div className="flex items-center gap-3 p-3 bg-card  rounded-lg border border-border ">
        <div className="w-4 h-4 rounded-full " />
        <span className="font-medium text-muted-foreground dark:text-muted-foreground">Média ocupação (40-70%)</span>
       </div>
       <div className="flex items-center gap-3 p-3 bg-card  rounded-lg border border-border ">
        <div className="w-4 h-4 rounded-full " />
        <span className="font-medium text-muted-foreground dark:text-muted-foreground">Alta ocupação (&gt; 70%)</span>
       </div>
      </div>
     </CardContent>
    </Card>
   )}

   {viewMode === 'partners' && (
    <Card className="bg-card  border border-border ">
     <CardHeader>
      <CardTitle className="text-lg text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
       <Users className="w-5 h-5 text-purple-600 dark:" />
       Legenda de Disponibilidade dos Profissionais
      </CardTitle>
     </CardHeader>
     <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
       <div className="flex items-center gap-3 p-3 bg-card  rounded-lg border border-border ">
        <div className="w-4 h-4 rounded-full " />
        <span className="font-medium text-muted-foreground dark:text-muted-foreground">Horários disponíveis para agendamento</span>
       </div>
       <div className="flex items-center gap-3 p-3 bg-card  rounded-lg border border-border ">
        <div className="w-4 h-4 rounded-full " />
        <span className="font-medium text-muted-foreground dark:text-muted-foreground">Horários ocupados com agendamentos</span>
       </div>
       <div className="flex items-center gap-3 p-3 bg-card  rounded-lg border border-border ">
        <div className="w-4 h-4 rounded-full " />
        <span className="font-medium text-muted-foreground dark:text-muted-foreground">Horários bloqueados pelo profissional</span>
       </div>
       <div className="flex items-center gap-3 p-3 bg-card  rounded-lg border border-border ">
        <div className="w-4 h-4 rounded-full bg-card" />
        <span className="font-medium text-muted-foreground dark:text-muted-foreground">Horários fora do expediente</span>
       </div>
      </div>
      <div className="mt-4 p-3 bg-muted border border-border rounded-lg">
       <p className="text-primary dark:text-primary font-medium flex items-center gap-2">
        <Calendar className="w-4 h-4" />
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
