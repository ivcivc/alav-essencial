import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useNotificationConfiguration,
  useUpdateNotificationConfiguration,
  useNotificationChannels
} from '../../../hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Badge } from '../../../components/ui/badge'
import { Loader2, Save, Settings } from 'lucide-react'

// Schema de validação
const configurationSchema = z.object({
  enabled: z.boolean(),
  defaultChannel: z.string(),
  firstReminderDays: z.number().min(0).max(30),
  secondReminderDays: z.number().min(0).max(30),
  thirdReminderHours: z.number().min(0).max(48),
  whatsappEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  retryAttempts: z.number().min(0).max(10),
  retryIntervalMinutes: z.number().min(1).max(1440)
})

type ConfigurationFormData = z.infer<typeof configurationSchema>

export function NotificationConfiguration() {
  const { data: configuration, isLoading } = useNotificationConfiguration()
  const updateConfiguration = useUpdateNotificationConfiguration()
  const channels = useNotificationChannels()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<ConfigurationFormData>({
    resolver: zodResolver(configurationSchema),
    values: configuration ? {
      enabled: configuration.enabled,
      defaultChannel: configuration.defaultChannel,
      firstReminderDays: configuration.firstReminderDays,
      secondReminderDays: configuration.secondReminderDays,
      thirdReminderHours: configuration.thirdReminderHours,
      whatsappEnabled: configuration.whatsappEnabled,
      smsEnabled: configuration.smsEnabled,
      emailEnabled: configuration.emailEnabled,
      retryAttempts: configuration.retryAttempts,
      retryIntervalMinutes: configuration.retryIntervalMinutes
    } : undefined
  })

  const watchedEnabled = watch('enabled')
  const watchedWhatsapp = watch('whatsappEnabled')
  const watchedSms = watch('smsEnabled')
  const watchedEmail = watch('emailEnabled')

  const onSubmit = (data: ConfigurationFormData) => {
    updateConfiguration.mutate(data)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
          <CardDescription>
            Configure as opções básicas do sistema de notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sistema Habilitado */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enabled"
              {...register('enabled')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="enabled" className="text-sm font-medium">
              Sistema de notificações habilitado
            </Label>
          </div>

          {/* Canal Padrão */}
          <div className="space-y-2">
            <Label htmlFor="defaultChannel">Canal padrão</Label>
            <Select 
              value={watch('defaultChannel')} 
              onValueChange={(value) => setValue('defaultChannel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o canal padrão" />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem key={channel.value} value={channel.value}>
                    <div className="flex items-center gap-2">
                      <span>{channel.icon}</span>
                      <span>{channel.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.defaultChannel && (
              <p className="text-sm text-red-600">{errors.defaultChannel.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Lembretes */}
      <Card>
        <CardHeader>
          <CardTitle>Cronograma de Lembretes</CardTitle>
          <CardDescription>
            Configure quando os lembretes devem ser enviados antes dos agendamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Primeiro Lembrete */}
            <div className="space-y-2">
              <Label htmlFor="firstReminderDays">
                1º Lembrete <Badge variant="outline">dias antes</Badge>
              </Label>
              <Input
                id="firstReminderDays"
                type="number"
                min="0"
                max="30"
                {...register('firstReminderDays', { valueAsNumber: true })}
                disabled={!watchedEnabled}
              />
              {errors.firstReminderDays && (
                <p className="text-sm text-red-600">{errors.firstReminderDays.message}</p>
              )}
            </div>

            {/* Segundo Lembrete */}
            <div className="space-y-2">
              <Label htmlFor="secondReminderDays">
                2º Lembrete <Badge variant="outline">dias antes</Badge>
              </Label>
              <Input
                id="secondReminderDays"
                type="number"
                min="0"
                max="30"
                {...register('secondReminderDays', { valueAsNumber: true })}
                disabled={!watchedEnabled}
              />
              {errors.secondReminderDays && (
                <p className="text-sm text-red-600">{errors.secondReminderDays.message}</p>
              )}
            </div>

            {/* Terceiro Lembrete */}
            <div className="space-y-2">
              <Label htmlFor="thirdReminderHours">
                3º Lembrete <Badge variant="outline">horas antes</Badge>
              </Label>
              <Input
                id="thirdReminderHours"
                type="number"
                min="0"
                max="48"
                {...register('thirdReminderHours', { valueAsNumber: true })}
                disabled={!watchedEnabled}
              />
              {errors.thirdReminderHours && (
                <p className="text-sm text-red-600">{errors.thirdReminderHours.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canais de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Canais de Notificação</CardTitle>
          <CardDescription>
            Habilite ou desabilite os canais de envio disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* WhatsApp */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📱</span>
                <div>
                  <Label className="text-sm font-medium">WhatsApp</Label>
                  <p className="text-xs text-gray-500">Envio via API do WhatsApp</p>
                </div>
              </div>
              <input
                type="checkbox"
                {...register('whatsappEnabled')}
                disabled={!watchedEnabled}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* SMS */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💬</span>
                <div>
                  <Label className="text-sm font-medium">SMS</Label>
                  <p className="text-xs text-gray-500">Envio via operadora SMS</p>
                </div>
              </div>
              <input
                type="checkbox"
                {...register('smsEnabled')}
                disabled={!watchedEnabled}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📧</span>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-xs text-gray-500">Envio via SMTP</p>
                </div>
              </div>
              <input
                type="checkbox"
                {...register('emailEnabled')}
                disabled={!watchedEnabled}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Retry */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Retry</CardTitle>
          <CardDescription>
            Configure as tentativas de reenvio para notificações que falharam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tentativas de Retry */}
            <div className="space-y-2">
              <Label htmlFor="retryAttempts">Máximo de tentativas</Label>
              <Input
                id="retryAttempts"
                type="number"
                min="0"
                max="10"
                {...register('retryAttempts', { valueAsNumber: true })}
                disabled={!watchedEnabled}
              />
              {errors.retryAttempts && (
                <p className="text-sm text-red-600">{errors.retryAttempts.message}</p>
              )}
            </div>

            {/* Intervalo entre Retries */}
            <div className="space-y-2">
              <Label htmlFor="retryIntervalMinutes">
                Intervalo entre tentativas <Badge variant="outline">minutos</Badge>
              </Label>
              <Input
                id="retryIntervalMinutes"
                type="number"
                min="1"
                max="1440"
                {...register('retryIntervalMinutes', { valueAsNumber: true })}
                disabled={!watchedEnabled}
              />
              {errors.retryIntervalMinutes && (
                <p className="text-sm text-red-600">{errors.retryIntervalMinutes.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!isDirty || updateConfiguration.isPending}
          className="flex items-center gap-2"
        >
          {updateConfiguration.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar Configurações
        </Button>
      </div>
    </form>
  )
}
