import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Textarea } from '../../../components/ui/textarea'
import { AppointmentForm } from './AppointmentForm'
import { usePatients } from '../../../hooks/usePatients'
import { usePartners } from '../../../hooks/usePartners'
import { useProducts } from '../../../hooks/useProducts'
import { CreateAppointmentData, AppointmentType } from '../../../types/entities'
import { Clock, User, Briefcase, Calendar, Plus, Bell, CheckCircle, X } from 'lucide-react'

interface WaitingListItem {
  id: string
  patientId: string
  patient?: {
    fullName: string
    phone?: string
    email?: string
  }
  partnerId?: string
  partner?: {
    fullName: string
  }
  productServiceId?: string
  productService?: {
    name: string
    durationMinutes?: number
  }
  type: AppointmentType
  preferredDates: string[] // Array de datas preferenciais
  preferredTimes: string[] // Array de horários preferenciais
  observations?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: string
  notified?: boolean
}

interface WaitingListProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Mock data para demonstração
const mockWaitingList: WaitingListItem[] = [
  {
    id: '1',
    patientId: 'patient-1',
    patient: {
      fullName: 'Maria Silva Santos',
      phone: '(11) 99999-9999',
      email: 'maria@email.com'
    },
    partnerId: 'partner-1',
    partner: {
      fullName: 'Dr. Ricardo Almeida'
    },
    productServiceId: 'service-1',
    productService: {
      name: 'Consulta Cardiológica',
      durationMinutes: 30
    },
    type: 'CONSULTATION',
    preferredDates: ['2025-08-15', '2025-08-16', '2025-08-17'],
    preferredTimes: ['09:00', '10:00', '14:00'],
    observations: 'Paciente com disponibilidade apenas manhã e tarde',
    priority: 'HIGH',
    createdAt: '2025-08-14T10:00:00Z',
    notified: false
  },
  {
    id: '2',
    patientId: 'patient-2',
    patient: {
      fullName: 'João Carlos Oliveira',
      phone: '(11) 88888-8888'
    },
    productServiceId: 'service-2',
    productService: {
      name: 'Exame de Ultrassom',
      durationMinutes: 45
    },
    type: 'EXAM',
    preferredDates: ['2025-08-16', '2025-08-19'],
    preferredTimes: ['08:00', '09:00', '10:00'],
    priority: 'MEDIUM',
    createdAt: '2025-08-14T14:30:00Z',
    notified: true
  }
]

const PRIORITY_CONFIG = {
  LOW: { label: 'Baixa', color: 'bg-gray-100 text-gray-800', icon: Clock },
  MEDIUM: { label: 'Média', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  HIGH: { label: 'Alta', color: 'bg-red-100 text-red-800', icon: Bell },
}

const TYPE_LABELS = {
  CONSULTATION: 'Consulta',
  EXAM: 'Exame',
  PROCEDURE: 'Procedimento',
  RETURN: 'Retorno',
}

export function WaitingList({ open, onOpenChange }: WaitingListProps) {
  const [isOpen, setIsOpen] = useState(open || false)
  const [waitingList, setWaitingList] = useState<WaitingListItem[]>(mockWaitingList)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState<WaitingListItem | null>(null)
  const [newItem, setNewItem] = useState({
    patientId: '',
    partnerId: '',
    productServiceId: '',
    type: 'CONSULTATION' as AppointmentType,
    preferredDates: [''],
    preferredTimes: [''],
    observations: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH'
  })

  const { data: patientsData } = usePatients({ active: true })
  const { data: partnersData } = usePartners({ active: true })
  const { data: servicesData } = useProducts({ type: 'SERVICE', active: true })

  const patients = patientsData?.patients || []
  const partners = partnersData?.partners || []
  const services = servicesData?.productServices || []

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
    if (!open) {
      setShowAddForm(false)
      setShowScheduleForm(false)
      setSelectedItem(null)
    }
  }

  const handleAddToWaitingList = () => {
    const patient = patients.find(p => p.id === newItem.patientId)
    const partner = partners.find(p => p.id === newItem.partnerId)
    const service = services.find(s => s.id === newItem.productServiceId)

    const item: WaitingListItem = {
      id: `waiting-${Date.now()}`,
      patientId: newItem.patientId,
      patient: patient ? {
        fullName: patient.fullName,
        phone: patient.phone,
        email: patient.email
      } : undefined,
      partnerId: newItem.partnerId || undefined,
      partner: partner ? {
        fullName: partner.fullName
      } : undefined,
      productServiceId: newItem.productServiceId,
      productService: service ? {
        name: service.name,
        durationMinutes: service.durationMinutes
      } : undefined,
      type: newItem.type,
      preferredDates: newItem.preferredDates.filter(d => d),
      preferredTimes: newItem.preferredTimes.filter(t => t),
      observations: newItem.observations,
      priority: newItem.priority,
      createdAt: new Date().toISOString(),
      notified: false
    }

    setWaitingList(prev => [...prev, item])
    setShowAddForm(false)
    setNewItem({
      patientId: '',
      partnerId: '',
      productServiceId: '',
      type: 'CONSULTATION',
      preferredDates: [''],
      preferredTimes: [''],
      observations: '',
      priority: 'MEDIUM'
    })
  }

  const handleScheduleFromWaitingList = (item: WaitingListItem) => {
    setSelectedItem(item)
    setShowScheduleForm(true)
  }

  const handleRemoveFromWaitingList = (itemId: string) => {
    setWaitingList(prev => prev.filter(item => item.id !== itemId))
  }

  const handleNotifyPatient = (itemId: string) => {
    setWaitingList(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, notified: true }
          : item
      )
    )
    // Aqui você adicionaria a lógica real de notificação
    console.log('Notificar paciente via WhatsApp/SMS')
  }

  const sortedWaitingList = [...waitingList].sort((a, b) => {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  return (
    <>
      <Dialog open={isOpen && !showScheduleForm} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Lista de Espera
            {waitingList.length > 0 && (
              <Badge variant="secondary">{waitingList.length}</Badge>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Lista de Espera
                <Badge variant="secondary">{waitingList.length} pacientes</Badge>
              </DialogTitle>
              
              <Button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar à Lista
              </Button>
            </div>
          </DialogHeader>

          {showAddForm ? (
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-medium">Adicionar Paciente à Lista de Espera</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Paciente *</Label>
                  <Select
                    value={newItem.patientId}
                    onValueChange={(value) => setNewItem(prev => ({ ...prev, patientId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Serviço *</Label>
                  <Select
                    value={newItem.productServiceId}
                    onValueChange={(value) => setNewItem(prev => ({ ...prev, productServiceId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Profissional (opcional)</Label>
                  <Select
                    value={newItem.partnerId}
                    onValueChange={(value) => setNewItem(prev => ({ ...prev, partnerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer profissional</SelectItem>
                      {partners.map(partner => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={newItem.priority}
                    onValueChange={(value) => setNewItem(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={newItem.observations}
                  onChange={(e) => setNewItem(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Preferências de horário, observações especiais..."
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAddToWaitingList}
                  disabled={!newItem.patientId || !newItem.productServiceId}
                >
                  Adicionar à Lista
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedWaitingList.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum paciente na lista de espera</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Paciente
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedWaitingList.map((item) => {
                    const priorityConfig = PRIORITY_CONFIG[item.priority]
                    
                    return (
                      <Card key={item.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-medium">{item.patient?.fullName}</div>
                                <div className="text-sm text-gray-600">
                                  {TYPE_LABELS[item.type]} • {item.productService?.name}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={priorityConfig.color}>
                                {priorityConfig.label}
                              </Badge>
                              {item.notified && (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Notificado
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          {item.partner && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="w-4 h-4" />
                              <span>Profissional preferido: {item.partner.fullName}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Aguardando desde: {format(new Date(item.createdAt), "d 'de' MMMM", { locale: ptBR })}
                            </span>
                          </div>

                          {item.observations && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {item.observations}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {item.patient?.phone && (
                                <span className="text-sm text-gray-600">
                                  📱 {item.patient.phone}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {!item.notified && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleNotifyPatient(item.id)}
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                  <Bell className="w-3 h-3 mr-1" />
                                  Notificar
                                </Button>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleScheduleFromWaitingList(item)}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <Calendar className="w-3 h-3 mr-1" />
                                Agendar
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveFromWaitingList(item.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Agendamento a partir da Lista de Espera */}
      {showScheduleForm && selectedItem && (
        <AppointmentForm
          open={showScheduleForm}
          onOpenChange={setShowScheduleForm}
          initialData={{
            patientId: selectedItem.patientId,
            partnerId: selectedItem.partnerId,
            productServiceId: selectedItem.productServiceId,
            type: selectedItem.type,
            observations: selectedItem.observations
          }}
          onSuccess={() => {
            handleRemoveFromWaitingList(selectedItem.id)
            setShowScheduleForm(false)
            setSelectedItem(null)
          }}
        />
      )}
    </>
  )
}
