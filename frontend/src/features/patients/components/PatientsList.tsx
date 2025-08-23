import React, { useState } from 'react'
import { Search, Plus, Edit, Trash2, Eye, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/ui/table'
import { usePatients, useDeletePatient } from '@/hooks/usePatients'
import { useToast } from '@/hooks/useToast'
import { Patient } from '@/types/entities'
import { PatientFilters } from '@/services/patients'

interface PatientsListProps {
 onCreatePatient: () => void
 onEditPatient: (patient: Patient) => void
 onViewPatient: (patient: Patient) => void
 onQuickCreate: () => void
}

export const PatientsList: React.FC<PatientsListProps> = ({
 onCreatePatient,
 onEditPatient,
 onViewPatient,
 onQuickCreate
}) => {
 const [filters, setFilters] = useState<PatientFilters>({
  page: 1,
  limit: 10,
  q: '',
  active: true
 })

 const { toast } = useToast()
 const { data: patientsData, isLoading, error } = usePatients(filters)
 const deletePatientMutation = useDeletePatient()

 const handleSearch = (query: string) => {
  setFilters(prev => ({ ...prev, q: query, page: 1 }))
 }

 const handlePageChange = (page: number) => {
  setFilters(prev => ({ ...prev, page }))
 }

 const handleDeletePatient = async (patient: Patient) => {
  if (window.confirm(`Tem certeza que deseja excluir o paciente ${patient.fullName}?`)) {
   try {
    await deletePatientMutation.mutateAsync(patient.id)
    toast({
     title: "Sucesso!",
     description: "Paciente excluído com sucesso.",
     variant: "success",
    })
   } catch (error) {
    toast({
     title: "Erro",
     description: error instanceof Error ? error.message : "Erro ao excluir paciente. Tente novamente.",
     variant: "destructive",
    })
   }
  }
 }

 const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR')
 }

 const formatCPF = (cpf: string) => {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
 }

 const formatPhone = (phone: string) => {
  if (phone.length === 11) {
   return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (phone.length === 10) {
   return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
 }

 if (error) {
  return (
   <Card>
    <CardContent className="p-6">
     <div className="text-center ">
      Erro ao carregar pacientes. Tente novamente.
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <div className="space-y-6">
   {/* Header */}
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
     <h1 className="text-2xl font-bold">Pacientes</h1>
     <p className="text-muted-foreground">Gerencie os pacientes da clínica</p>
    </div>
    <div className="flex gap-2">
     <Button onClick={onQuickCreate} variant="outline" size="sm">
      <UserPlus className="h-4 w-4 mr-2" />
      Cadastro Rápido
     </Button>
     <Button onClick={onCreatePatient}>
      <Plus className="h-4 w-4 mr-2" />
      Novo Paciente
     </Button>
    </div>
   </div>

   {/* Search and Filters */}
   <Card>
    <CardContent className="p-4">
     <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
       <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
       <Input
        placeholder="Buscar por nome, CPF, email ou telefone..."
        value={filters.q || ''}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
       />
      </div>
      <div className="flex gap-2">
       <Button
        variant={filters.active === true ? "default" : "outline"}
        size="sm"
        onClick={() => setFilters(prev => ({ ...prev, active: true, page: 1 }))}
       >
        Ativos
       </Button>
       <Button
        variant={filters.active === false ? "default" : "outline"}
        size="sm"
        onClick={() => setFilters(prev => ({ ...prev, active: false, page: 1 }))}
       >
        Inativos
       </Button>
       <Button
        variant={filters.active === undefined ? "default" : "outline"}
        size="sm"
        onClick={() => setFilters(prev => ({ ...prev, active: undefined, page: 1 }))}
       >
        Todos
       </Button>
      </div>
     </div>
    </CardContent>
   </Card>

   {/* Patients Table */}
   <Card>
    <CardHeader>
     <CardTitle>
      Lista de Pacientes
      {patientsData && (
       <span className="text-sm font-normal text-muted-foreground ml-2">
        ({patientsData.total} {patientsData.total === 1 ? 'paciente' : 'pacientes'})
       </span>
      )}
     </CardTitle>
    </CardHeader>
    <CardContent>
     {isLoading ? (
      <div className="text-center py-8">
       <div className="animate-spin rounded-full h-8 w-8  border-border mx-auto"></div>
       <p className="mt-2 text-muted-foreground">Carregando pacientes...</p>
      </div>
     ) : !patientsData?.patients.length ? (
      <div className="text-center py-8">
       <p className="text-muted-foreground">Nenhum paciente encontrado.</p>
       <Button onClick={onCreatePatient} className="mt-4">
        <Plus className="h-4 w-4 mr-2" />
        Cadastrar Primeiro Paciente
       </Button>
      </div>
     ) : (
      <>
       <Table>
        <TableHeader>
         <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>CPF</TableHead>
          <TableHead>Data Nascimento</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
         </TableRow>
        </TableHeader>
        <TableBody>
         {patientsData.patients.map((patient) => (
          <TableRow key={patient.id}>
           <TableCell className="font-medium">
            {patient.fullName}
           </TableCell>
           <TableCell>{formatCPF(patient.cpf)}</TableCell>
           <TableCell>{formatDate(patient.birthDate)}</TableCell>
           <TableCell>
            <div className="text-sm">
             {patient.whatsapp && (
              <div>WhatsApp: {formatPhone(patient.whatsapp)}</div>
             )}
             {patient.phone && (
              <div>Tel: {formatPhone(patient.phone)}</div>
             )}
             {patient.email && (
              <div className="text-muted-foreground">{patient.email}</div>
             )}
            </div>
           </TableCell>
           <TableCell>
            <Badge 
             variant={patient.active ? "success" : "secondary"}
             className={patient.active ? 'badge-active' : 'badge-inactive'}
            >
             {patient.active ? 'Ativo' : 'Inativo'}
            </Badge>
           </TableCell>
           <TableCell className="text-right">
            <div className="flex justify-end gap-1">
             <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewPatient(patient)}
              title="Ver detalhes"
             >
              <Eye className="h-4 w-4" />
             </Button>
             <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditPatient(patient)}
              title="Editar"
             >
              <Edit className="h-4 w-4" />
             </Button>
             <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeletePatient(patient)}
              title="Excluir"
              disabled={deletePatientMutation.isPending}
             >
              <Trash2 className="h-4 w-4" />
             </Button>
            </div>
           </TableCell>
          </TableRow>
         ))}
        </TableBody>
       </Table>

       {/* Pagination */}
       {patientsData.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
         <div className="text-sm text-muted-foreground">
          Página {patientsData.page} de {patientsData.totalPages}
         </div>
         <div className="flex gap-2">
          <Button
           variant="outline"
           size="sm"
           onClick={() => handlePageChange(patientsData.page - 1)}
           disabled={patientsData.page <= 1}
          >
           Anterior
          </Button>
          <Button
           variant="outline"
           size="sm"
           onClick={() => handlePageChange(patientsData.page + 1)}
           disabled={patientsData.page >= patientsData.totalPages}
          >
           Próxima
          </Button>
         </div>
        </div>
       )}
      </>
     )}
    </CardContent>
   </Card>
  </div>
 )
}