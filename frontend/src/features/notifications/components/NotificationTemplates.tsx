import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
 useNotificationTemplates,
 useCreateNotificationTemplate,
 useUpdateNotificationTemplate,
 useDeleteNotificationTemplate,
 useNotificationChannels,
 useNotificationReminderTypes,
 useTemplateVariables
} from '../../../hooks'
import { NotificationTemplate, CreateNotificationTemplateData } from '../../../types/entities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Badge } from '../../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog'
import { Plus, Edit, Trash2, Eye, Copy, Loader2, Save, X, Info } from 'lucide-react'

// Schema de validação
const templateSchema = z.object({
 name: z.string().min(1, 'Nome é obrigatório'),
 type: z.string().min(1, 'Tipo é obrigatório'),
 channel: z.string().min(1, 'Canal é obrigatório'),
 subject: z.string().optional(),
 content: z.string().min(1, 'Conteúdo é obrigatório'),
 active: z.boolean()
})

type TemplateFormData = z.infer<typeof templateSchema>

export function NotificationTemplates() {
 const [selectedChannel, setSelectedChannel] = useState<string>('all')
 const [selectedType, setSelectedType] = useState<string>('all')
 const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
 const [showCreateDialog, setShowCreateDialog] = useState(false)
 const [showPreviewDialog, setShowPreviewDialog] = useState(false)
 const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplate | null>(null)

 const { data: templates, isLoading } = useNotificationTemplates({
  channel: selectedChannel === 'all' ? undefined : selectedChannel as any,
  type: selectedType === 'all' ? undefined : selectedType as any
 })

 const createTemplate = useCreateNotificationTemplate()
 const updateTemplate = useUpdateNotificationTemplate()
 const deleteTemplate = useDeleteNotificationTemplate()

 const channels = useNotificationChannels()
 const reminderTypes = useNotificationReminderTypes()
 const variables = useTemplateVariables()

 const {
  register,
  handleSubmit,
  watch,
  setValue,
  reset,
  formState: { errors, isSubmitting }
 } = useForm<TemplateFormData>({
  resolver: zodResolver(templateSchema),
  defaultValues: {
   active: true
  }
 })

 const watchedChannel = watch('channel')
 const watchedContent = watch('content')

 // Abrir formulário para criar novo template
 const handleCreateNew = () => {
  reset({
   name: '',
   type: '',
   channel: '',
   subject: '',
   content: '',
   active: true
  })
  setEditingTemplate(null)
  setShowCreateDialog(true)
 }

 // Abrir formulário para editar template
 const handleEdit = (template: NotificationTemplate) => {
  reset({
   name: template.name,
   type: template.type,
   channel: template.channel,
   subject: template.subject || '',
   content: template.content,
   active: template.active
  })
  setEditingTemplate(template)
  setShowCreateDialog(true)
 }

 // Duplicar template
 const handleDuplicate = (template: NotificationTemplate) => {
  reset({
   name: `${template.name} (Cópia)`,
   type: template.type,
   channel: template.channel,
   subject: template.subject || '',
   content: template.content,
   active: template.active
  })
  setEditingTemplate(null)
  setShowCreateDialog(true)
 }

 // Visualizar template
 const handlePreview = (template: NotificationTemplate) => {
  setPreviewTemplate(template)
  setShowPreviewDialog(true)
 }

 // Excluir template
 const handleDelete = (templateId: string) => {
  deleteTemplate.mutate(templateId)
 }

 // Inserir variável no conteúdo
 const insertVariable = (variable: string) => {
  const currentContent = watchedContent || ''
  const placeholder = `{${variable}}`
  setValue('content', currentContent + placeholder)
 }

 // Submeter formulário
 const onSubmit = (data: TemplateFormData) => {
  const templateData: CreateNotificationTemplateData = {
   name: data.name,
   type: data.type as any,
   channel: data.channel as any,
   subject: data.subject || undefined,
   content: data.content,
   active: data.active
  }

  if (editingTemplate) {
   updateTemplate.mutate({ 
    id: editingTemplate.id, 
    data: templateData 
   }, {
    onSuccess: () => {
     setShowCreateDialog(false)
     setEditingTemplate(null)
    }
   })
  } else {
   createTemplate.mutate(templateData, {
    onSuccess: () => {
     setShowCreateDialog(false)
    }
   })
  }
 }

 return (
  <div className="space-y-6">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <h2 className="text-2xl font-bold">Templates de Notificação</h2>
     <p className="text-muted-foreground">Gerencie os templates de mensagens para cada canal e tipo de lembrete</p>
    </div>
    <Button onClick={handleCreateNew} className="flex items-center gap-2">
     <Plus className="h-4 w-4" />
     Novo Template
    </Button>
   </div>

   {/* Filtros */}
   <Card>
    <CardHeader>
     <CardTitle>Filtros</CardTitle>
    </CardHeader>
    <CardContent>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Filtro por Canal */}
      <div className="space-y-2">
       <Label>Canal</Label>
       <Select value={selectedChannel} onValueChange={setSelectedChannel}>
        <SelectTrigger>
         <SelectValue />
        </SelectTrigger>
        <SelectContent>
         <SelectItem value="all">Todos os canais</SelectItem>
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
      </div>

      {/* Filtro por Tipo */}
      <div className="space-y-2">
       <Label>Tipo de Lembrete</Label>
       <Select value={selectedType} onValueChange={setSelectedType}>
        <SelectTrigger>
         <SelectValue />
        </SelectTrigger>
        <SelectContent>
         <SelectItem value="all">Todos os tipos</SelectItem>
         {reminderTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
           {type.label}
          </SelectItem>
         ))}
        </SelectContent>
       </Select>
      </div>
     </div>
    </CardContent>
   </Card>

   {/* Lista de Templates */}
   <Card>
    <CardHeader>
     <CardTitle>Templates</CardTitle>
     <CardDescription>
      {templates?.length || 0} template(s) encontrado(s)
     </CardDescription>
    </CardHeader>
    <CardContent>
     {isLoading ? (
      <div className="flex items-center justify-center p-8">
       <Loader2 className="h-8 w-8 animate-spin" />
      </div>
     ) : (
      <Table>
       <TableHeader>
        <TableRow>
         <TableHead>Nome</TableHead>
         <TableHead>Canal</TableHead>
         <TableHead>Tipo</TableHead>
         <TableHead>Status</TableHead>
         <TableHead>Ações</TableHead>
        </TableRow>
       </TableHeader>
       <TableBody>
        {templates?.map((template) => (
         <TableRow key={template.id}>
          <TableCell className="font-medium">{template.name}</TableCell>
          <TableCell>
           <div className="flex items-center gap-2">
            <span>{channels.find(c => c.value === template.channel)?.icon}</span>
            <span>{channels.find(c => c.value === template.channel)?.label}</span>
           </div>
          </TableCell>
          <TableCell>
           <Badge variant="outline">
            {reminderTypes.find(t => t.value === template.type)?.label}
           </Badge>
          </TableCell>
          <TableCell>
           <Badge variant={template.active ? 'default' : 'secondary'}>
            {template.active ? 'Ativo' : 'Inativo'}
           </Badge>
          </TableCell>
          <TableCell>
           <div className="flex items-center gap-1">
            <Button
             variant="ghost"
             size="sm"
             onClick={() => handlePreview(template)}
            >
             <Eye className="h-4 w-4" />
            </Button>
            <Button
             variant="ghost"
             size="sm"
             onClick={() => handleEdit(template)}
            >
             <Edit className="h-4 w-4" />
            </Button>
            <Button
             variant="ghost"
             size="sm"
             onClick={() => handleDuplicate(template)}
            >
             <Copy className="h-4 w-4" />
            </Button>
            <AlertDialog>
             <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
               <Trash2 className="h-4 w-4" />
              </Button>
             </AlertDialogTrigger>
             <AlertDialogContent>
              <AlertDialogHeader>
               <AlertDialogTitle>Excluir Template</AlertDialogTitle>
               <AlertDialogDescription>
                Tem certeza que deseja excluir o template "{template.name}"? 
                Esta ação não pode ser desfeita.
               </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
               <AlertDialogCancel>Cancelar</AlertDialogCancel>
               <AlertDialogAction 
                onClick={() => handleDelete(template.id)}
                className="bg-red-600 hover:"
               >
                Excluir
               </AlertDialogAction>
              </AlertDialogFooter>
             </AlertDialogContent>
            </AlertDialog>
           </div>
          </TableCell>
         </TableRow>
        ))}
       </TableBody>
      </Table>
     )}
    </CardContent>
   </Card>

   {/* Dialog para Criar/Editar Template */}
   <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
     <DialogHeader>
      <DialogTitle>
       {editingTemplate ? 'Editar Template' : 'Novo Template'}
      </DialogTitle>
      <DialogDescription>
       Configure o template de notificação para ser enviado aos pacientes
      </DialogDescription>
     </DialogHeader>

     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
       <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="content">Conteúdo</TabsTrigger>
        <TabsTrigger value="variables">Variáveis</TabsTrigger>
       </TabsList>

       <TabsContent value="content" className="space-y-4">
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="space-y-2">
          <Label htmlFor="name">Nome do Template</Label>
          <Input
           id="name"
           {...register('name')}
           placeholder="Ex: Lembrete WhatsApp - 3 dias"
          />
          {errors.name && (
           <p className="text-sm ">{errors.name.message}</p>
          )}
         </div>

         <div className="space-y-2">
          <Label htmlFor="channel">Canal</Label>
          <Select 
           value={watch('channel')} 
           onValueChange={(value) => setValue('channel', value)}
          >
           <SelectTrigger>
            <SelectValue placeholder="Selecione o canal" />
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
          {errors.channel && (
           <p className="text-sm ">{errors.channel.message}</p>
          )}
         </div>

         <div className="space-y-2">
          <Label htmlFor="type">Tipo de Lembrete</Label>
          <Select 
           value={watch('type')} 
           onValueChange={(value) => setValue('type', value)}
          >
           <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
           </SelectTrigger>
           <SelectContent>
            {reminderTypes.map((type) => (
             <SelectItem key={type.value} value={type.value}>
              {type.label}
             </SelectItem>
            ))}
           </SelectContent>
          </Select>
          {errors.type && (
           <p className="text-sm ">{errors.type.message}</p>
          )}
         </div>

         <div className="flex items-center space-x-2 pt-6">
          <input
           type="checkbox"
           id="active"
           {...register('active')}
           className="rounded border-border text-primary focus:ring-blue-500"
          />
          <Label htmlFor="active">Template ativo</Label>
         </div>
        </div>

        {/* Assunto (apenas para Email) */}
        {watchedChannel === 'EMAIL' && (
         <div className="space-y-2">
          <Label htmlFor="subject">Assunto (Email)</Label>
          <Input
           id="subject"
           {...register('subject')}
           placeholder="Ex: Lembrete: Seu agendamento na {clinica}"
          />
         </div>
        )}

        {/* Conteúdo */}
        <div className="space-y-2">
         <Label htmlFor="content">Conteúdo da Mensagem</Label>
         <Textarea
          id="content"
          {...register('content')}
          placeholder="Digite o conteúdo da mensagem usando variáveis como {paciente}, {data}, {hora}..."
          rows={8}
          className="font-mono text-sm"
         />
         {errors.content && (
          <p className="text-sm ">{errors.content.message}</p>
         )}
        </div>
       </TabsContent>

       <TabsContent value="variables" className="space-y-4">
        <div className="bg-blue-50 border  rounded-lg p-4">
         <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-primary" />
          <span className="font-medium text-primary">Variáveis Disponíveis</span>
         </div>
         <p className="text-sm text-primary">
          Clique nas variáveis abaixo para inserí-las no conteúdo da mensagem.
         </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {variables.map((variable) => (
          <Card key={variable.name} className="cursor-pointer hover:bg-card" onClick={() => insertVariable(variable.name)}>
           <CardContent className="p-4">
            <div className="flex items-center justify-between">
             <div>
              <code className="font-mono text-sm bg-card px-2 py-1 rounded">
               {variable.placeholder}
              </code>
              <p className="text-sm text-muted-foreground mt-1">
               {variable.description}
              </p>
             </div>
             <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
           </CardContent>
          </Card>
         ))}
        </div>
       </TabsContent>
      </Tabs>

      <DialogFooter>
       <Button 
        type="button" 
        variant="outline" 
        onClick={() => setShowCreateDialog(false)}
       >
        Cancelar
       </Button>
       <Button 
        type="submit" 
        disabled={isSubmitting}
        className="flex items-center gap-2"
       >
        {isSubmitting ? (
         <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
         <Save className="h-4 w-4" />
        )}
        {editingTemplate ? 'Atualizar' : 'Criar'} Template
       </Button>
      </DialogFooter>
     </form>
    </DialogContent>
   </Dialog>

   {/* Dialog de Preview */}
   <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
    <DialogContent className="max-w-2xl">
     <DialogHeader>
      <DialogTitle>Preview do Template</DialogTitle>
      <DialogDescription>
       Visualização do template "{previewTemplate?.name}"
      </DialogDescription>
     </DialogHeader>

     {previewTemplate && (
      <div className="space-y-4">
       <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
         <Label>Canal:</Label>
         <div className="flex items-center gap-2 mt-1">
          <span>{channels.find(c => c.value === previewTemplate.channel)?.icon}</span>
          <span>{channels.find(c => c.value === previewTemplate.channel)?.label}</span>
         </div>
        </div>
        <div>
         <Label>Tipo:</Label>
         <p className="mt-1">{reminderTypes.find(t => t.value === previewTemplate.type)?.label}</p>
        </div>
       </div>

       {previewTemplate.subject && (
        <div>
         <Label>Assunto:</Label>
         <p className="bg-card p-3 rounded border mt-1 font-mono text-sm">
          {previewTemplate.subject}
         </p>
        </div>
       )}

       <div>
        <Label>Conteúdo:</Label>
        <div className="bg-card p-4 rounded border mt-1 whitespace-pre-wrap font-mono text-sm">
         {previewTemplate.content}
        </div>
       </div>
      </div>
     )}

     <DialogFooter>
      <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
       Fechar
      </Button>
     </DialogFooter>
    </DialogContent>
   </Dialog>
  </div>
 )
}
