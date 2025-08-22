import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'
import { Badge } from '../../../components/ui/badge'
import { CalendarIcon, ClockIcon, MoveIcon, InfoIcon } from 'lucide-react'
import type { ClinicSettings } from '../../../services/settings'

interface AppointmentRulesFormProps {
  settings: Partial<ClinicSettings>
  onChange: (field: keyof ClinicSettings, value: any) => void
}

export function AppointmentRulesForm({ settings, onChange }: AppointmentRulesFormProps) {
  const formatDaysText = (days: number) => {
    if (days === 1) return '1 dia'
    return `${days} dias`
  }

  const formatHoursText = (hours: number) => {
    if (hours === 1) return '1 hora'
    return `${hours} horas`
  }

  return (
    <div className="space-y-6">
      {/* Regras de Antecedência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Regras de Antecedência
          </CardTitle>
          <CardDescription>
            Configure as regras de antecedência para agendamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="advanceBookingDays">
                Máximo de dias para agendamento
              </Label>
              <Input
                id="advanceBookingDays"
                type="number"
                min="1"
                max="365"
                value={settings.advanceBookingDays || 30}
                onChange={(e) => onChange('advanceBookingDays', parseInt(e.target.value) || 30)}
              />
              <p className="text-sm text-muted-foreground">
                Pacientes podem agendar até {formatDaysText(settings.advanceBookingDays || 30)} no futuro
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minBookingHours">
                Mínimo de horas de antecedência
              </Label>
              <Input
                id="minBookingHours"
                type="number"
                min="0"
                max="72"
                value={settings.minBookingHours || 2}
                onChange={(e) => onChange('minBookingHours', parseInt(e.target.value) || 2)}
              />
              <p className="text-sm text-muted-foreground">
                Agendamentos precisam ser feitos com pelo menos {formatHoursText(settings.minBookingHours || 2)} de antecedência
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxBookingDays">
              Período máximo de agendamento
            </Label>
            <Input
              id="maxBookingDays"
              type="number"
              min="1"
              max="365"
              value={settings.maxBookingDays || 60}
              onChange={(e) => onChange('maxBookingDays', parseInt(e.target.value) || 60)}
            />
            <p className="text-sm text-muted-foreground">
              Limite máximo de {formatDaysText(settings.maxBookingDays || 60)} para novos agendamentos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regras de Fim de Semana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Agendamentos de Fim de Semana
          </CardTitle>
          <CardDescription>
            Configure se agendamentos em finais de semana são permitidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">Permitir agendamentos aos finais de semana</Label>
              <p className="text-sm text-muted-foreground">
                Quando habilitado, pacientes poderão agendar aos sábados e domingos (se configurados como dias abertos)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.allowWeekendBookings || false}
                onCheckedChange={(checked) => onChange('allowWeekendBookings', checked)}
              />
              <Badge variant={settings.allowWeekendBookings ? "default" : "secondary"}>
                {settings.allowWeekendBookings ? "Permitido" : "Bloqueado"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regras de Movimentação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MoveIcon className="h-5 w-5" />
            Movimentação de Agendamentos
          </CardTitle>
          <CardDescription>
            Configure quais agendamentos podem ser reagendados ou movidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Permitir mover agendamentos cancelados</Label>
                <p className="text-sm text-muted-foreground">
                  Quando habilitado, agendamentos cancelados podem ser reagendados
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.allowCancelledMovement || false}
                  onCheckedChange={(checked) => onChange('allowCancelledMovement', checked)}
                />
                <Badge variant={settings.allowCancelledMovement ? "default" : "secondary"}>
                  {settings.allowCancelledMovement ? "Permitido" : "Bloqueado"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Permitir mover agendamentos concluídos</Label>
                <p className="text-sm text-muted-foreground">
                  Quando habilitado, agendamentos já concluídos podem ser reagendados
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.allowCompletedMovement || false}
                  onCheckedChange={(checked) => onChange('allowCompletedMovement', checked)}
                />
                <Badge variant={settings.allowCompletedMovement ? "default" : "secondary"}>
                  {settings.allowCompletedMovement ? "Permitido" : "Bloqueado"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo das Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5" />
            Resumo das Regras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Antecedência máxima:</span>
              <Badge variant="outline">{formatDaysText(settings.advanceBookingDays || 30)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Antecedência mínima:</span>
              <Badge variant="outline">{formatHoursText(settings.minBookingHours || 2)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Período máximo:</span>
              <Badge variant="outline">{formatDaysText(settings.maxBookingDays || 60)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Finais de semana:</span>
              <Badge variant={settings.allowWeekendBookings ? "default" : "secondary"}>
                {settings.allowWeekendBookings ? "Permitido" : "Bloqueado"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Reagendar cancelados:</span>
              <Badge variant={settings.allowCancelledMovement ? "default" : "secondary"}>
                {settings.allowCancelledMovement ? "Sim" : "Não"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Reagendar concluídos:</span>
              <Badge variant={settings.allowCompletedMovement ? "default" : "secondary"}>
                {settings.allowCompletedMovement ? "Sim" : "Não"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

