import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'
import { Badge } from '../../../components/ui/badge'
import { ClockIcon, AlertCircleIcon } from 'lucide-react'
import { settingsService, type ClinicHours } from '../../../services/settings'

interface ClinicHoursFormProps {
 hours: ClinicHours[]
 onChange: (hours: ClinicHours[]) => void
}

export function ClinicHoursForm({ hours, onChange }: ClinicHoursFormProps) {
 const handleDayChange = (dayIndex: number, field: keyof ClinicHours, value: any) => {
  const newHours = [...hours]
  if (!newHours[dayIndex]) {
   newHours[dayIndex] = { dayOfWeek: dayIndex, isOpen: false }
  }
  newHours[dayIndex] = { ...newHours[dayIndex], [field]: value }
  onChange(newHours)
 }

 const handleToggleDay = (dayIndex: number, isOpen: boolean) => {
  handleDayChange(dayIndex, 'isOpen', isOpen)
  
  // Se estiver abrindo o dia e não tiver horários, definir padrão
  if (isOpen && (!hours[dayIndex]?.openTime || !hours[dayIndex]?.closeTime)) {
   const defaultHours = settingsService.getDefaultHours()[dayIndex]
   if (defaultHours.openTime && defaultHours.closeTime) {
    handleDayChange(dayIndex, 'openTime', defaultHours.openTime)
    handleDayChange(dayIndex, 'closeTime', defaultHours.closeTime)
    handleDayChange(dayIndex, 'lunchBreakStart', defaultHours.lunchBreakStart)
    handleDayChange(dayIndex, 'lunchBreakEnd', defaultHours.lunchBreakEnd)
   }
  }
 }

 const validateTime = (time: string): boolean => {
  return settingsService.isValidTimeFormat(time)
 }

 const isTimeValid = (dayHours: ClinicHours): boolean => {
  if (!dayHours.isOpen) return true
  
  if (!dayHours.openTime || !dayHours.closeTime) return false
  if (!validateTime(dayHours.openTime) || !validateTime(dayHours.closeTime)) return false
  
  // Verificar se horário de abertura é antes do fechamento
  const openMinutes = timeToMinutes(dayHours.openTime)
  const closeMinutes = timeToMinutes(dayHours.closeTime)
  
  if (openMinutes >= closeMinutes) return false
  
  // Verificar intervalo de almoço se definido
  if (dayHours.lunchBreakStart && dayHours.lunchBreakEnd) {
   if (!validateTime(dayHours.lunchBreakStart) || !validateTime(dayHours.lunchBreakEnd)) return false
   
   const lunchStartMinutes = timeToMinutes(dayHours.lunchBreakStart)
   const lunchEndMinutes = timeToMinutes(dayHours.lunchBreakEnd)
   
   if (lunchStartMinutes >= lunchEndMinutes) return false
   if (lunchStartMinutes < openMinutes || lunchEndMinutes > closeMinutes) return false
  }
  
  return true
 }

 const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
 }

 const resetToDefault = () => {
  const defaultHours = settingsService.getDefaultHours()
  onChange(defaultHours)
 }

 // Garantir que temos horários para todos os dias
 const completeHours = Array.from({ length: 7 }, (_, index) => 
  hours.find(h => h.dayOfWeek === index) || { dayOfWeek: index, isOpen: false }
 )

 return (
  <Card>
   <CardHeader>
    <div className="flex items-center justify-between">
     <div>
      <CardTitle className="flex items-center gap-2">
       <ClockIcon className="h-5 w-5" />
       Horários de Funcionamento
      </CardTitle>
      <CardDescription>
       Configure os horários de funcionamento da clínica para cada dia da semana
      </CardDescription>
     </div>
     <Button variant="outline" onClick={resetToDefault}>
      Restaurar Padrão
     </Button>
    </div>
   </CardHeader>
   <CardContent className="space-y-6">
    {completeHours.map((dayHours) => {
     const isValid = isTimeValid(dayHours)
     const dayName = settingsService.getDayName(dayHours.dayOfWeek)
     
     return (
      <div key={dayHours.dayOfWeek} className="space-y-4">
       <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
         <Label className="text-base font-medium min-w-[80px]">
          {dayName}
         </Label>
         <Switch
          checked={dayHours.isOpen}
          onCheckedChange={(checked) => handleToggleDay(dayHours.dayOfWeek, checked)}
         />
         {dayHours.isOpen && (
          <Badge variant={isValid ? "default" : "destructive"}>
           {isValid ? "Configurado" : "Inválido"}
          </Badge>
         )}
        </div>
        {!isValid && dayHours.isOpen && (
         <div className="flex items-center text-destructive text-sm">
          <AlertCircleIcon className="h-4 w-4 mr-1" />
          Horários inválidos
         </div>
        )}
       </div>

       {dayHours.isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ml-4 p-4 border rounded-lg bg-muted/20">
         <div className="space-y-2">
          <Label htmlFor={`open-${dayHours.dayOfWeek}`} className="text-sm">
           Abertura
          </Label>
          <Input
           id={`open-${dayHours.dayOfWeek}`}
           type="time"
           value={dayHours.openTime || ''}
           onChange={(e) => handleDayChange(dayHours.dayOfWeek, 'openTime', e.target.value)}
           className={!validateTime(dayHours.openTime || '') ? 'border-destructive' : ''}
          />
         </div>

         <div className="space-y-2">
          <Label htmlFor={`close-${dayHours.dayOfWeek}`} className="text-sm">
           Fechamento
          </Label>
          <Input
           id={`close-${dayHours.dayOfWeek}`}
           type="time"
           value={dayHours.closeTime || ''}
           onChange={(e) => handleDayChange(dayHours.dayOfWeek, 'closeTime', e.target.value)}
           className={!validateTime(dayHours.closeTime || '') ? 'border-destructive' : ''}
          />
         </div>

         <div className="space-y-2">
          <Label htmlFor={`lunch-start-${dayHours.dayOfWeek}`} className="text-sm">
           Início Almoço
          </Label>
          <Input
           id={`lunch-start-${dayHours.dayOfWeek}`}
           type="time"
           value={dayHours.lunchBreakStart || ''}
           onChange={(e) => handleDayChange(dayHours.dayOfWeek, 'lunchBreakStart', e.target.value)}
           placeholder="Opcional"
          />
         </div>

         <div className="space-y-2">
          <Label htmlFor={`lunch-end-${dayHours.dayOfWeek}`} className="text-sm">
           Fim Almoço
          </Label>
          <Input
           id={`lunch-end-${dayHours.dayOfWeek}`}
           type="time"
           value={dayHours.lunchBreakEnd || ''}
           onChange={(e) => handleDayChange(dayHours.dayOfWeek, 'lunchBreakEnd', e.target.value)}
           placeholder="Opcional"
          />
         </div>
        </div>
       )}
      </div>
     )
    })}

    <div className="pt-4 border-t">
     <div className="flex items-start space-x-2 text-sm text-muted-foreground">
      <AlertCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>
       <p className="font-medium">Dicas:</p>
       <ul className="list-disc list-inside space-y-1 mt-1">
        <li>O horário de almoço é opcional e será considerado como período fechado</li>
        <li>Horários inválidos impedirão agendamentos nesse dia</li>
        <li>Use o formato 24h (ex: 14:30 para 2:30 PM)</li>
       </ul>
      </div>
     </div>
    </div>
   </CardContent>
  </Card>
 )
}

