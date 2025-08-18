import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, isAfter, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, CalendarX, Trash2, Clock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { usePartnerBlockedDates, useCreatePartnerBlockedDate } from '@/hooks/usePartners'

// Validation Schema
const blockedDateSchema = z.object({
  blockedDate: z.string().min(1, 'Data é obrigatória'),
  isFullDay: z.boolean().default(false),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().optional(),
}).refine((data) => {
  // If not full day, both start and end time are required
  if (!data.isFullDay && (!data.startTime || !data.endTime)) {
    return false
  }
  
  // If times are provided, validate them
  if (data.startTime && data.endTime && data.startTime >= data.endTime) {
    return false
  }
  
  return true
}, {
  message: 'Horários inválidos ou obrigatórios não preenchidos',
})

type BlockedDateFormData = z.infer<typeof blockedDateSchema>

interface PartnerBlockedDatesProps {
  partnerId: string
}

export function PartnerBlockedDatesComponent({ partnerId }: PartnerBlockedDatesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({})

  // Get next 3 months of blocked dates
  const today = new Date()
  const threeMonthsLater = new Date()
  threeMonthsLater.setMonth(today.getMonth() + 3)

  const { data: blockedDates, isLoading } = usePartnerBlockedDates(
    partnerId,
    format(today, 'yyyy-MM-dd'),
    format(threeMonthsLater, 'yyyy-MM-dd')
  )
  const createBlockedDate = useCreatePartnerBlockedDate()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BlockedDateFormData>({
    resolver: zodResolver(blockedDateSchema),
    defaultValues: {
      isFullDay: false,
    },
  })

  const isFullDay = watch('isFullDay')
  const selectedDate = watch('blockedDate')

  const handleCreateBlockedDate = (data: BlockedDateFormData) => {
    const submitData = {
      blockedDate: data.blockedDate,
      startTime: data.isFullDay ? undefined : data.startTime,
      endTime: data.isFullDay ? undefined : data.endTime,
      reason: data.reason,
    }

    createBlockedDate.mutate(
      { partnerId, data: submitData },
      {
        onSuccess: () => {
          setIsDialogOpen(false)
          reset()
        },
      }
    )
  }

  const formatBlockedDate = (blockedDate: any) => {
    try {
      return format(new Date(blockedDate.blockedDate), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })
    } catch {
      return blockedDate.blockedDate
    }
  }

  const isDateInPast = (date: string) => {
    return !isAfter(new Date(date), startOfDay(new Date()))
  }

  const getBlockedDateType = (blockedDate: any) => {
    if (!blockedDate.startTime || !blockedDate.endTime) {
      return { type: 'full', label: 'Dia Completo', variant: 'destructive' as const }
    }
    return { 
      type: 'partial', 
      label: `${blockedDate.startTime} - ${blockedDate.endTime}`, 
      variant: 'secondary' as const 
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarX className="h-5 w-5" />
            Datas Bloqueadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Carregando datas bloqueadas...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarX className="h-5 w-5" />
            Datas Bloqueadas
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => reset()}>
                <Plus className="h-4 w-4 mr-2" />
                Bloquear Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Bloquear Data/Horário</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(handleCreateBlockedDate)} className="space-y-4">
                <div>
                  <Label htmlFor="blockedDate">Data</Label>
                  <Input
                    id="blockedDate"
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    {...register('blockedDate')}
                  />
                  {errors.blockedDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.blockedDate.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFullDay"
                    checked={isFullDay}
                    onCheckedChange={(checked) => setValue('isFullDay', !!checked)}
                  />
                  <Label htmlFor="isFullDay" className="text-sm font-normal">
                    Bloquear dia completo
                  </Label>
                </div>

                {!isFullDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Hora Início</Label>
                      <Input
                        id="startTime"
                        type="time"
                        {...register('startTime')}
                      />
                      {errors.startTime && (
                        <p className="text-sm text-red-500 mt-1">{errors.startTime.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="endTime">Hora Fim</Label>
                      <Input
                        id="endTime"
                        type="time"
                        {...register('endTime')}
                      />
                      {errors.endTime && (
                        <p className="text-sm text-red-500 mt-1">{errors.endTime.message}</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="reason">Motivo (opcional)</Label>
                  <Textarea
                    id="reason"
                    {...register('reason')}
                    placeholder="Descreva o motivo do bloqueio..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      reset()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createBlockedDate.isPending}>
                    {createBlockedDate.isPending ? 'Bloqueando...' : 'Bloquear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {blockedDates && blockedDates.length > 0 ? (
          <div className="space-y-3">
            {blockedDates
              .sort((a, b) => new Date(a.blockedDate).getTime() - new Date(b.blockedDate).getTime())
              .map((blockedDate) => {
                const { type, label, variant } = getBlockedDateType(blockedDate)
                const isPast = isDateInPast(blockedDate.blockedDate)
                
                return (
                  <div
                    key={blockedDate.id}
                    className={`flex items-start justify-between p-4 rounded-lg border ${
                      isPast ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className={`font-medium ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                            {formatBlockedDate(blockedDate)}
                          </span>
                        </div>
                        <Badge variant={isPast ? 'outline' : variant}>
                          {type === 'full' ? (
                            <CalendarX className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {label}
                        </Badge>
                        {isPast && (
                          <Badge variant="outline" className="text-gray-500">
                            Passado
                          </Badge>
                        )}
                      </div>
                      
                      {blockedDate.reason && (
                        <p className={`text-sm ${isPast ? 'text-gray-500' : 'text-gray-600'}`}>
                          <strong>Motivo:</strong> {blockedDate.reason}
                        </p>
                      )}
                    </div>

                    {!isPast && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )
              })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CalendarX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma data bloqueada</p>
            <p className="text-sm">Clique em "Bloquear Data" para adicionar</p>
          </div>
        )}

        {/* Summary */}
        {blockedDates && blockedDates.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total de bloqueios: {blockedDates.length}</span>
              <span>
                Próximos 3 meses: {blockedDates.filter(d => !isDateInPast(d.blockedDate)).length}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
