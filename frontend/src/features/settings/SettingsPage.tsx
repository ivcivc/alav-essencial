import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Separator } from '../../components/ui/separator'
import { Badge } from '../../components/ui/badge'
import { 
 SettingsIcon, 
 ClockIcon, 
 CalendarIcon, 
 BellIcon, 
 SaveIcon,
 AlertCircleIcon,
 InfoIcon
} from 'lucide-react'

import { useClinicSettings, useUpdateClinicSettings } from '../../hooks/useSettings'
import { ClinicHoursForm } from './components/ClinicHoursForm'
import { AppointmentRulesForm } from './components/AppointmentRulesForm'
import { NotificationSettingsForm } from './components/NotificationSettingsForm'
import type { ClinicSettings } from '../../services/settings'

export function SettingsPage() {
 const { data: settings, isLoading, error } = useClinicSettings()
 const updateSettings = useUpdateClinicSettings()
 
 const [formData, setFormData] = useState<Partial<ClinicSettings>>({})
 const [hasChanges, setHasChanges] = useState(false)
 const [activeTab, setActiveTab] = useState('general')

 // Sincronizar dados do servidor com o form
 useEffect(() => {
  if (settings) {
   setFormData(settings)
   setHasChanges(false)
  }
 }, [settings])

 const handleFieldChange = (field: keyof ClinicSettings, value: any) => {
  setFormData(prev => ({
   ...prev,
   [field]: value
  }))
  setHasChanges(true)
 }

 const handleSave = async () => {
  if (!hasChanges) return
  
  try {
   await updateSettings.mutateAsync(formData)
   setHasChanges(false)
  } catch (error) {
   console.error('Erro ao salvar configurações:', error)
  }
 }

 const handleReset = () => {
  if (settings) {
   setFormData(settings)
   setHasChanges(false)
  }
 }

 if (isLoading) {
  return (
   <div className="container mx-auto py-6">
    <div className="flex items-center justify-center h-64">
     <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8  border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando configurações...</p>
     </div>
    </div>
   </div>
  )
 }

 if (error) {
  return (
   <div className="container mx-auto py-6">
    <Card>
     <CardContent className="pt-6">
      <div className="flex items-center justify-center h-32">
       <div className="text-center">
        <AlertCircleIcon className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-destructive">Erro ao carregar configurações</p>
       </div>
      </div>
     </CardContent>
    </Card>
   </div>
  )
 }

 return (
  <div className="container mx-auto py-6 space-y-6">
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
     <p className="text-muted-foreground">
      Gerencie as configurações gerais da clínica
     </p>
    </div>
    <div className="flex items-center space-x-2">
     {hasChanges && (
      <Badge variant="secondary" className="flex items-center gap-1">
       <InfoIcon className="h-3 w-3" />
       Alterações não salvas
      </Badge>
     )}
     <Button
      variant="outline"
      onClick={handleReset}
      disabled={!hasChanges || updateSettings.isPending}
     >
      Cancelar
     </Button>
     <Button
      onClick={handleSave}
      disabled={!hasChanges || updateSettings.isPending}
      className="flex items-center gap-2"
     >
      <SaveIcon className="h-4 w-4" />
      {updateSettings.isPending ? 'Salvando...' : 'Salvar'}
     </Button>
    </div>
   </div>

   <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
    <TabsList className="grid w-full grid-cols-4">
     <TabsTrigger value="general" className="flex items-center gap-2">
      <SettingsIcon className="h-4 w-4" />
      Geral
     </TabsTrigger>
     <TabsTrigger value="hours" className="flex items-center gap-2">
      <ClockIcon className="h-4 w-4" />
      Horários
     </TabsTrigger>
     <TabsTrigger value="appointments" className="flex items-center gap-2">
      <CalendarIcon className="h-4 w-4" />
      Agendamentos
     </TabsTrigger>
     <TabsTrigger value="notifications" className="flex items-center gap-2">
      <BellIcon className="h-4 w-4" />
      Notificações
     </TabsTrigger>
    </TabsList>

    {/* Configurações Gerais */}
    <TabsContent value="general" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle>Informações da Clínica</CardTitle>
       <CardDescription>
        Configure as informações básicas da clínica
       </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
       <div className="space-y-2">
        <Label htmlFor="clinicName">Nome da Clínica</Label>
        <Input
         id="clinicName"
         value={formData.name || ''}
         onChange={(e) => handleFieldChange('name', e.target.value)}
         placeholder="Digite o nome da clínica"
        />
       </div>
      </CardContent>
     </Card>
    </TabsContent>

    {/* Horários de Funcionamento */}
    <TabsContent value="hours" className="space-y-6">
     <ClinicHoursForm
      hours={formData.hours || []}
      onChange={(hours) => handleFieldChange('hours', hours)}
     />
    </TabsContent>

    {/* Regras de Agendamento */}
    <TabsContent value="appointments" className="space-y-6">
     <AppointmentRulesForm
      settings={formData}
      onChange={handleFieldChange}
     />
    </TabsContent>

    {/* Configurações de Notificações */}
    <TabsContent value="notifications" className="space-y-6">
     <NotificationSettingsForm />
    </TabsContent>
   </Tabs>
  </div>
 )
}

