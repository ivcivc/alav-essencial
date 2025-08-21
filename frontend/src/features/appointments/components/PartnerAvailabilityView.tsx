import React, { useMemo } from 'react'
import { format, addMinutes, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { usePartners, usePartnerAvailability, usePartnerBlockedDates } from '../../../hooks/usePartners'
import { useAppointmentsByDateRange } from '../../../hooks/useAppointments'
import { Partner, Appointment } from '../../../types/entities'
import { Users, Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface PartnerAvailabilityViewProps {
  selectedDate: Date
  onPartnerClick?: (partner: Partner) => void
  onTimeSlotClick?: (partnerId: string, time: string) => void
  selectedPartnerId?: string
}

// Função para verificar se um horário está dentro da disponibilidade
const isTimeInAvailability = (
  time: string,
  availability: any[],
  date: Date
): boolean => {
  const dayOfWeek = date.getDay() // 0 = domingo, 1 = segunda, etc.
  const dayAvailability = availability.find(avail => avail.dayOfWeek === dayOfWeek && avail.active)
  
  if (!dayAvailability) return false
  
  const timeMinutes = timeToMinutes(time)
  const startMinutes = timeToMinutes(dayAvailability.startTime)
  const endMinutes = timeToMinutes(dayAvailability.endTime)
  
  // Verificar se está dentro do horário de trabalho
  if (timeMinutes < startMinutes || timeMinutes >= endMinutes) return false
  
  // Verificar se não está no horário de intervalo
  if (dayAvailability.breakStart && dayAvailability.breakEnd) {
    const breakStartMinutes = timeToMinutes(dayAvailability.breakStart)
    const breakEndMinutes = timeToMinutes(dayAvailability.breakEnd)
    
    if (timeMinutes >= breakStartMinutes && timeMinutes < breakEndMinutes) {
      return false
    }
  }
  
  return true
}

// Função para converter horário para minutos
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Função para formatar nome do médico
const formatDoctorName = (fullName: string): string => {
  const nameParts = fullName.split(' ')
  const firstName = nameParts[0]?.replace(/^Dr\.?\s?|^Dra\.?\s?/i, '') || ''
  const secondName = nameParts[1] || ''
  
  // Detectar se já tem Dr/Dra no nome
  const hasTitle = /^Dr\.?\s?|^Dra\.?\s?/i.test(fullName)
  
  if (hasTitle) {
    // Se já tem título, manter apenas primeiro e segundo nome
    return `${firstName}${secondName ? ` ${secondName}` : ''}`
  } else {
    // Se não tem título, adicionar Dr./Dra. baseado no gênero (assumir Dr. como padrão)
    const title = fullName.toLowerCase().includes('dra') || 
                 firstName.toLowerCase().endsWith('a') ? 'Dra.' : 'Dr.'
    return `${title} ${firstName}${secondName ? ` ${secondName}` : ''}`
  }
}

// Função para verificar se uma data/hora está bloqueada
const isTimeBlocked = (
  time: string,
  date: Date,
  blockedDates: any[]
): boolean => {
  const dateStr = format(date, 'yyyy-MM-dd')
  
  return blockedDates.some(blocked => {
    const blockedDateStr = format(new Date(blocked.blockedDate), 'yyyy-MM-dd')
    
    if (blockedDateStr !== dateStr || !blocked.active) return false
    
    // Se não tem horário específico, o dia todo está bloqueado
    if (!blocked.startTime || !blocked.endTime) return true
    
    const timeMinutes = timeToMinutes(time)
    const startMinutes = timeToMinutes(blocked.startTime)
    const endMinutes = timeToMinutes(blocked.endTime)
    
    return timeMinutes >= startMinutes && timeMinutes < endMinutes
  })
}

const HOUR_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 7 // Horário de 07:00 às 20:00
  return `${hour.toString().padStart(2, '0')}:00`
})

type SlotStatus = 'available' | 'busy' | 'blocked' | 'unavailable'

const SLOT_COLORS: Record<SlotStatus, string> = {
  available: 'bg-green-100 border-green-300 hover:bg-green-200 cursor-pointer',
  busy: 'bg-red-100 border-red-300',
  blocked: 'bg-yellow-100 border-yellow-300',
  unavailable: 'bg-gray-100 border-gray-300'
}

const SLOT_ICONS: Record<SlotStatus, React.ReactNode> = {
  available: <CheckCircle className="w-4 h-4 text-green-600" />,
  busy: <XCircle className="w-4 h-4 text-red-600" />,
  blocked: <AlertCircle className="w-4 h-4 text-yellow-600" />,
  unavailable: <XCircle className="w-4 h-4 text-gray-400" />
}

const SLOT_LABELS: Record<SlotStatus, string> = {
  available: 'Disponível',
  busy: 'Ocupado',
  blocked: 'Bloqueado',
  unavailable: 'Indisponível'
}

export function PartnerAvailabilityView({
  selectedDate,
  onPartnerClick,
  onTimeSlotClick,
  selectedPartnerId
}: PartnerAvailabilityViewProps) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  
  const { data: partnersData } = usePartners({ active: true })
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointmentsByDateRange(dateStr, dateStr)

  const partners = partnersData?.partners || []

  // Buscar availability para todos os parceiros
  const partnerAvailabilityQueries = partners.map(partner => 
    usePartnerAvailability(partner.id)
  )

  // Buscar blocked dates para todos os parceiros  
  const partnerBlockedDatesQueries = partners.map(partner =>
    usePartnerBlockedDates(partner.id, dateStr, dateStr)
  )

  // Combinar dados dos parceiros com availability e blocked dates
  const partnersWithRelations = useMemo(() => {
    return partners.map((partner, index) => ({
      ...partner,
      availability: partnerAvailabilityQueries[index]?.data || [],
      blockedDates: partnerBlockedDatesQueries[index]?.data || []
    }))
  }, [partners, partnerAvailabilityQueries, partnerBlockedDatesQueries])

  // Agrupar agendamentos por parceiro e horário
  const appointmentsByPartnerAndTime = useMemo(() => {
    const grouped: Record<string, Record<string, Appointment[]>> = {}
    
    partnersWithRelations.forEach(partner => {
      grouped[partner.id] = {}
      HOUR_SLOTS.forEach(time => {
        grouped[partner.id][time] = []
      })
    })

    appointments.forEach(appointment => {
      if (grouped[appointment.partnerId] && grouped[appointment.partnerId][appointment.startTime]) {
        grouped[appointment.partnerId][appointment.startTime].push(appointment)
      }
    })

    return grouped
  }, [appointments, partnersWithRelations])

  // Calcular status de cada slot para cada parceiro
  const partnerSlotStatus = useMemo(() => {
    const status: Record<string, Record<string, SlotStatus>> = {}
    
    partnersWithRelations.forEach(partner => {
      status[partner.id] = {}
      
      HOUR_SLOTS.forEach(time => {
        const hasAppointment = appointmentsByPartnerAndTime[partner.id]?.[time]?.length > 0
        
        if (hasAppointment) {
          status[partner.id][time] = 'busy'
        } else if (partner.blockedDates && isTimeBlocked(time, selectedDate, partner.blockedDates)) {
          status[partner.id][time] = 'blocked'
        } else if (partner.availability && isTimeInAvailability(time, partner.availability, selectedDate)) {
          status[partner.id][time] = 'available'
        } else {
          status[partner.id][time] = 'unavailable'
        }
      })
    })
    
    return status
  }, [partnersWithRelations, appointmentsByPartnerAndTime, selectedDate])

  // Calcular estatísticas de disponibilidade
  const partnerStats = useMemo(() => {
    const stats: Record<string, {
      available: number
      busy: number
      blocked: number
      unavailable: number
      total: number
      availabilityRate: number
    }> = {}

    partnersWithRelations.forEach(partner => {
      const slotCounts = { available: 0, busy: 0, blocked: 0, unavailable: 0 }
      
      HOUR_SLOTS.forEach(time => {
        const slotStatus = partnerSlotStatus[partner.id]?.[time]
        if (slotStatus) {
          slotCounts[slotStatus]++
        }
      })

      const total = HOUR_SLOTS.length
      const availabilityRate = (slotCounts.available / total) * 100

      stats[partner.id] = {
        ...slotCounts,
        total,
        availabilityRate
      }
    })

    return stats
  }, [partnerSlotStatus, partnersWithRelations, selectedDate, dateStr])

  const filteredPartners = selectedPartnerId 
    ? partnersWithRelations.filter(p => p.id === selectedPartnerId)
    : partnersWithRelations

  const getAvailabilityColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600'
    if (rate >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (appointmentsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando disponibilidade dos parceiros...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Disponibilidade dos Profissionais
          <Badge variant="outline" className="ml-2">
            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Cabeçalho com estatísticas */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map(partner => {
            const stats = partnerStats[partner.id]
            if (!stats) return null

            return (
              <div 
                key={partner.id} 
                className={`bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedPartnerId === partner.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onPartnerClick?.(partner)}
              >
                <div className="font-medium text-sm mb-1">{partner.fullName}</div>
                <div className={`text-lg font-bold ${getAvailabilityColor(stats.availabilityRate)}`}>
                  {stats.availabilityRate.toFixed(0)}% disponível
                </div>
                <div className="text-xs text-gray-600">
                  {stats.available}/{stats.total} slots livres
                </div>
                
                {/* Indicadores de status */}
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    {stats.available}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    {stats.busy}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    {stats.blocked}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabela de disponibilidade */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            {/* Cabeçalho */}
            <thead>
              <tr>
                <th className="p-3 text-left font-medium text-sm text-gray-600 bg-gray-50 border border-gray-200 w-[150px]">
                  Horário
                </th>
                {filteredPartners.map(partner => (
                  <th 
                    key={partner.id}
                    className="p-3 text-center font-medium text-sm bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 min-w-[120px]"
                    onClick={() => onPartnerClick?.(partner)}
                  >
                    <div className="font-medium">
                      {formatDoctorName(partner.fullName)}
                    </div>
                    <div className="text-xs text-gray-500 font-normal">
                      {partner.partnershipType === 'SUBLEASE' ? 'Sublocação' : 
                       partner.partnershipType === 'PERCENTAGE' ? 'Porcentagem' : 
                       'Porcentagem + Produtos'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Corpo da tabela */}
            <tbody>
              {HOUR_SLOTS.map(time => (
                <tr key={time}>
                  {/* Coluna do horário */}
                  <td className="p-3 text-sm text-gray-600 font-medium bg-gray-50 border border-gray-200">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {time}
                    </div>
                  </td>

                  {/* Colunas dos profissionais */}
                  {filteredPartners.map(partner => {
                    const slotStatus = partnerSlotStatus[partner.id]?.[time] || 'unavailable'
                    const appointment = appointmentsByPartnerAndTime[partner.id]?.[time]?.[0]

                    return (
                      <td 
                        key={`${partner.id}-${time}`}
                        className={`p-2 border border-gray-200 transition-colors ${SLOT_COLORS[slotStatus]} h-[60px]`}
                        onClick={() => {
                          if (slotStatus === 'available') {
                            onTimeSlotClick?.(partner.id, time)
                          } else if (appointment) {
                            // Abrir detalhes do agendamento
                          }
                        }}
                        title={`${SLOT_LABELS[slotStatus]} - ${partner.fullName} às ${time}`}
                      >
                        <div className="flex items-center justify-center h-full">
                          {slotStatus === 'busy' && appointment ? (
                            <div className="text-center w-full">
                              <div className="text-xs font-medium truncate leading-tight">
                                {appointment.patient?.fullName}
                              </div>
                              <div className="text-xs text-gray-600 leading-tight mt-0.5">
                                {appointment.startTime} - {appointment.endTime}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="flex justify-center mb-1">
                                {SLOT_ICONS[slotStatus]}
                              </div>
                              <div className="text-xs leading-tight">
                                {SLOT_LABELS[slotStatus]}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legenda */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium mb-2">Legenda:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {Object.entries(SLOT_LABELS).map(([status, label]) => (
              <div key={status} className="flex items-center gap-2">
                {SLOT_ICONS[status as SlotStatus]}
                <span>{label}</span>
              </div>
            ))}
          </div>
          
          {!selectedPartnerId && (
            <div className="mt-2 text-xs text-gray-600">
              💡 Clique em um profissional para ver apenas sua disponibilidade
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
