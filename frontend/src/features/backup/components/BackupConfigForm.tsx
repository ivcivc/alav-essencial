import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'
import { 
 Select, 
 SelectContent, 
 SelectItem, 
 SelectTrigger, 
 SelectValue 
} from '../../../components/ui/select'
import { 
 Form,
 FormControl,
 FormDescription,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from '../../../components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { useCreateBackupConfig, useUpdateBackupConfig } from '../../../hooks/useBackup'
import type { BackupConfig } from '../../../types/backup'

const backupConfigSchema = z.object({
 name: z.string().min(1, 'Nome é obrigatório'),
 frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
 enabled: z.boolean().default(true),
 retentionDays: z.number().min(1, 'Mínimo 1 dia').max(365, 'Máximo 365 dias'),
 includeFiles: z.boolean().default(false),
 includeDatabase: z.boolean().default(true),
 notifyOnSuccess: z.boolean().default(false),
 notifyOnFailure: z.boolean().default(true),
})

type BackupConfigFormData = z.infer<typeof backupConfigSchema>

interface BackupConfigFormProps {
 config?: BackupConfig | null
 onSuccess: () => void
 onCancel: () => void
}

export function BackupConfigForm({ config, onSuccess, onCancel }: BackupConfigFormProps) {
 const createMutation = useCreateBackupConfig()
 const updateMutation = useUpdateBackupConfig()
 
 const form = useForm<BackupConfigFormData>({
  resolver: zodResolver(backupConfigSchema),
  defaultValues: {
   name: config?.name || '',
   frequency: config?.frequency || 'DAILY',
   enabled: config?.enabled ?? true,
   retentionDays: config?.retentionDays || 30,
   includeFiles: config?.includeFiles || false,
   includeDatabase: config?.includeDatabase ?? true,
   notifyOnSuccess: config?.notifyOnSuccess || false,
   notifyOnFailure: config?.notifyOnFailure ?? true,
  }
 })

 const onSubmit = async (data: BackupConfigFormData) => {
  try {
   if (config) {
    await updateMutation.mutateAsync({ id: config.id, data })
   } else {
    await createMutation.mutateAsync(data)
   }
   onSuccess()
  } catch (error) {
   // Erro já tratado nos hooks
  }
 }

 const isLoading = createMutation.isPending || updateMutation.isPending

 return (
  <Form {...form}>
   <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    {/* Configurações Básicas */}
    <Card>
     <CardHeader>
      <CardTitle className="text-lg">Configurações Básicas</CardTitle>
     </CardHeader>
     <CardContent className="space-y-4">
      <FormField
       control={form.control}
       name="name"
       render={({ field }) => (
        <FormItem>
         <FormLabel>Nome da Configuração</FormLabel>
         <FormControl>
          <Input placeholder="Ex: Backup Diário Automático" {...field} />
         </FormControl>
         <FormDescription>
          Nome identificativo para esta configuração de backup
         </FormDescription>
         <FormMessage />
        </FormItem>
       )}
      />

      <div className="grid grid-cols-2 gap-4">
       <FormField
        control={form.control}
        name="frequency"
        render={({ field }) => (
         <FormItem>
          <FormLabel>Frequência</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
           <FormControl>
            <SelectTrigger>
             <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
           </FormControl>
           <SelectContent>
            <SelectItem value="DAILY">Diário</SelectItem>
            <SelectItem value="WEEKLY">Semanal</SelectItem>
            <SelectItem value="MONTHLY">Mensal</SelectItem>
           </SelectContent>
          </Select>
          <FormDescription>
           Com que frequência o backup será executado
          </FormDescription>
          <FormMessage />
         </FormItem>
        )}
       />

       <FormField
        control={form.control}
        name="retentionDays"
        render={({ field }) => (
         <FormItem>
          <FormLabel>Retenção (dias)</FormLabel>
          <FormControl>
           <Input 
            type="number" 
            min="1" 
            max="365"
            {...field}
            onChange={(e) => field.onChange(parseInt(e.target.value))}
           />
          </FormControl>
          <FormDescription>
           Por quantos dias manter os backups
          </FormDescription>
          <FormMessage />
         </FormItem>
        )}
       />
      </div>

      <FormField
       control={form.control}
       name="enabled"
       render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
         <div className="space-y-0.5">
          <FormLabel className="text-base">Configuração Ativa</FormLabel>
          <FormDescription>
           Habilitar execução automática desta configuração
          </FormDescription>
         </div>
         <FormControl>
          <Switch
           checked={field.value}
           onCheckedChange={field.onChange}
          />
         </FormControl>
        </FormItem>
       )}
      />
     </CardContent>
    </Card>

    {/* Conteúdo do Backup */}
    <Card>
     <CardHeader>
      <CardTitle className="text-lg">Conteúdo do Backup</CardTitle>
     </CardHeader>
     <CardContent className="space-y-4">
      <FormField
       control={form.control}
       name="includeDatabase"
       render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
         <div className="space-y-0.5">
          <FormLabel className="text-base">Incluir Banco de Dados</FormLabel>
          <FormDescription>
           Fazer backup completo do banco de dados PostgreSQL
          </FormDescription>
         </div>
         <FormControl>
          <Switch
           checked={field.value}
           onCheckedChange={field.onChange}
          />
         </FormControl>
        </FormItem>
       )}
      />

      <FormField
       control={form.control}
       name="includeFiles"
       render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
         <div className="space-y-0.5">
          <FormLabel className="text-base">Incluir Arquivos</FormLabel>
          <FormDescription>
           Fazer backup dos arquivos de upload e configurações
          </FormDescription>
         </div>
         <FormControl>
          <Switch
           checked={field.value}
           onCheckedChange={field.onChange}
          />
         </FormControl>
        </FormItem>
       )}
      />
     </CardContent>
    </Card>

    {/* Notificações */}
    <Card>
     <CardHeader>
      <CardTitle className="text-lg">Notificações</CardTitle>
     </CardHeader>
     <CardContent className="space-y-4">
      <FormField
       control={form.control}
       name="notifyOnSuccess"
       render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
         <div className="space-y-0.5">
          <FormLabel className="text-base">Notificar em Sucesso</FormLabel>
          <FormDescription>
           Enviar notificação quando o backup for executado com sucesso
          </FormDescription>
         </div>
         <FormControl>
          <Switch
           checked={field.value}
           onCheckedChange={field.onChange}
          />
         </FormControl>
        </FormItem>
       )}
      />

      <FormField
       control={form.control}
       name="notifyOnFailure"
       render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
         <div className="space-y-0.5">
          <FormLabel className="text-base">Notificar em Falha</FormLabel>
          <FormDescription>
           Enviar notificação quando o backup falhar
          </FormDescription>
         </div>
         <FormControl>
          <Switch
           checked={field.value}
           onCheckedChange={field.onChange}
          />
         </FormControl>
        </FormItem>
       )}
      />
     </CardContent>
    </Card>

    {/* Actions */}
    <div className="flex justify-end gap-3">
     <Button type="button" variant="outline" onClick={onCancel}>
      Cancelar
     </Button>
     <Button type="submit" disabled={isLoading}>
      {isLoading ? 'Salvando...' : config ? 'Atualizar' : 'Criar'}
     </Button>
    </div>
   </form>
  </Form>
 )
}
