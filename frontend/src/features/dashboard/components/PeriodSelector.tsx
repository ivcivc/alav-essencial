import React, { useState } from 'react'
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'

export interface DateRange {
 startDate: string
 endDate: string
 label?: string
}

interface PeriodSelectorProps {
 selectedPeriod: DateRange
 onPeriodChange: (period: DateRange) => void
 className?: string
}

type PresetType = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'last30Days' | 'last90Days' | 'custom'

const PERIOD_PRESETS: Record<PresetType, { label: string; getValue: () => DateRange }> = {
 today: {
  label: 'Hoje',
  getValue: () => {
   const today = new Date()
   return {
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(today, 'yyyy-MM-dd'),
    label: 'Hoje'
   }
  }
 },
 yesterday: {
  label: 'Ontem',
  getValue: () => {
   const yesterday = subDays(new Date(), 1)
   return {
    startDate: format(yesterday, 'yyyy-MM-dd'),
    endDate: format(yesterday, 'yyyy-MM-dd'),
    label: 'Ontem'
   }
  }
 },
 thisWeek: {
  label: 'Esta Semana',
  getValue: () => {
   const now = new Date()
   return {
    startDate: format(startOfWeek(now, { locale: ptBR }), 'yyyy-MM-dd'),
    endDate: format(endOfWeek(now, { locale: ptBR }), 'yyyy-MM-dd'),
    label: 'Esta Semana'
   }
  }
 },
 lastWeek: {
  label: 'Semana Passada',
  getValue: () => {
   const lastWeek = subDays(new Date(), 7)
   return {
    startDate: format(startOfWeek(lastWeek, { locale: ptBR }), 'yyyy-MM-dd'),
    endDate: format(endOfWeek(lastWeek, { locale: ptBR }), 'yyyy-MM-dd'),
    label: 'Semana Passada'
   }
  }
 },
 thisMonth: {
  label: 'Este Mês',
  getValue: () => {
   const now = new Date()
   return {
    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
    label: 'Este Mês'
   }
  }
 },
 lastMonth: {
  label: 'Mês Passado',
  getValue: () => {
   const lastMonth = new Date()
   lastMonth.setMonth(lastMonth.getMonth() - 1)
   return {
    startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
    label: 'Mês Passado'
   }
  }
 },
 thisYear: {
  label: 'Este Ano',
  getValue: () => {
   const now = new Date()
   return {
    startDate: format(startOfYear(now), 'yyyy-MM-dd'),
    endDate: format(endOfYear(now), 'yyyy-MM-dd'),
    label: 'Este Ano'
   }
  }
 },
 last30Days: {
  label: 'Últimos 30 Dias',
  getValue: () => {
   const now = new Date()
   const thirtyDaysAgo = subDays(now, 30)
   return {
    startDate: format(thirtyDaysAgo, 'yyyy-MM-dd'),
    endDate: format(now, 'yyyy-MM-dd'),
    label: 'Últimos 30 Dias'
   }
  }
 },
 last90Days: {
  label: 'Últimos 90 Dias',
  getValue: () => {
   const now = new Date()
   const ninetyDaysAgo = subDays(now, 90)
   return {
    startDate: format(ninetyDaysAgo, 'yyyy-MM-dd'),
    endDate: format(now, 'yyyy-MM-dd'),
    label: 'Últimos 90 Dias'
   }
  }
 },
 custom: {
  label: 'Personalizado',
  getValue: () => {
   const now = new Date()
   return {
    startDate: format(now, 'yyyy-MM-dd'),
    endDate: format(now, 'yyyy-MM-dd'),
    label: 'Personalizado'
   }
  }
 }
}

export function PeriodSelector({ selectedPeriod, onPeriodChange, className }: PeriodSelectorProps) {
 const [selectedPreset, setSelectedPreset] = useState<PresetType>('thisMonth')
 const [showCustomInputs, setShowCustomInputs] = useState(false)
 const [customStartDate, setCustomStartDate] = useState('')
 const [customEndDate, setCustomEndDate] = useState('')

 const handlePresetChange = (preset: PresetType) => {
  setSelectedPreset(preset)
  
  if (preset === 'custom') {
   setShowCustomInputs(true)
   return
  }
  
  const period = PERIOD_PRESETS[preset].getValue()
  onPeriodChange(period)
  setShowCustomInputs(false)
 }

 const handleCustomDateApply = () => {
  if (customStartDate && customEndDate) {
   const startDate = new Date(customStartDate)
   const endDate = new Date(customEndDate)
   
   if (startDate <= endDate) {
    const period: DateRange = {
     startDate: customStartDate,
     endDate: customEndDate,
     label: `${format(startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`
    }
    onPeriodChange(period)
    setShowCustomInputs(false)
   }
  }
 }

 const formatPeriodDisplay = (period: DateRange) => {
  if (period.label) {
   return period.label
  }
  
  const startDate = new Date(period.startDate)
  const endDate = new Date(period.endDate)
  
  if (period.startDate === period.endDate) {
   return format(startDate, 'dd/MM/yyyy', { locale: ptBR })
  }
  
  return `${format(startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`
 }

 return (
  <div className={className}>
   <div className="flex flex-col gap-3">
    <div className="flex items-center gap-3">
     {/* Seletor de Preset */}
     <Select value={selectedPreset} onValueChange={(value) => handlePresetChange(value as PresetType)}>
      <SelectTrigger className="w-[180px]">
       <CalendarIcon className="w-4 h-4 mr-2" />
       <SelectValue />
      </SelectTrigger>
      <SelectContent>
       {Object.entries(PERIOD_PRESETS).map(([key, preset]) => (
        <SelectItem key={key} value={key}>
         {preset.label}
        </SelectItem>
       ))}
      </SelectContent>
     </Select>

     {/* Período Selecionado */}
     <Badge variant="outline" className="px-3 py-1">
      {formatPeriodDisplay(selectedPeriod)}
     </Badge>
    </div>

    {/* Inputs Personalizados */}
    {showCustomInputs && (
     <Card className="p-4">
      <CardContent className="p-0">
       <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
         <div>
          <label className="text-sm font-medium mb-2 block">Data Inicial</label>
          <Input
           type="date"
           value={customStartDate}
           onChange={(e) => setCustomStartDate(e.target.value)}
           className="w-full"
          />
         </div>
         <div>
          <label className="text-sm font-medium mb-2 block">Data Final</label>
          <Input
           type="date"
           value={customEndDate}
           onChange={(e) => setCustomEndDate(e.target.value)}
           min={customStartDate}
           className="w-full"
          />
         </div>
        </div>
        
        <div className="flex gap-2">
         <Button size="sm" onClick={handleCustomDateApply} disabled={!customStartDate || !customEndDate}>
          Aplicar
         </Button>
         <Button 
          size="sm" 
          variant="outline" 
          onClick={() => {
           setShowCustomInputs(false)
           setSelectedPreset('thisMonth')
           onPeriodChange(PERIOD_PRESETS.thisMonth.getValue())
          }}
         >
          Cancelar
         </Button>
        </div>
       </div>
      </CardContent>
     </Card>
    )}
   </div>
  </div>
 )
}
