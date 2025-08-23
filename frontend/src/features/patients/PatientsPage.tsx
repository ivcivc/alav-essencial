import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PatientsList } from './components/PatientsList'
import { PatientForm } from './components/PatientForm'
import { PatientHistory } from './components/PatientHistory'
import { QuickPatientModal } from './components/QuickPatientModal'
import { useCreatePatient, useUpdatePatient } from '@/hooks/usePatients'
import { useToast } from '@/hooks/useToast'
import { Patient } from '@/types/entities'
import { CreatePatientData, UpdatePatientData } from '@/services/patients'

type ViewMode = 'list' | 'create' | 'edit' | 'view'

export const PatientsPage: React.FC = () => {
 const [viewMode, setViewMode] = useState<ViewMode>('list')
 const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
 const [showQuickModal, setShowQuickModal] = useState(false)

 const { toast } = useToast()
 const createPatientMutation = useCreatePatient()
 const updatePatientMutation = useUpdatePatient()

 const handleCreatePatient = () => {
  setSelectedPatient(null)
  setViewMode('create')
 }

 const handleEditPatient = (patient: Patient) => {
  setSelectedPatient(patient)
  setViewMode('edit')
 }

 const handleViewPatient = (patient: Patient) => {
  setSelectedPatient(patient)
  setViewMode('view')
 }

 const handleQuickCreate = () => {
  setShowQuickModal(true)
 }

 const handleBackToList = () => {
  setSelectedPatient(null)
  setViewMode('list')
 }

 const handleSubmitCreate = async (data: CreatePatientData) => {
  await createPatientMutation.mutateAsync(data)
  setViewMode('list')
 }

 const handleSubmitUpdate = async (data: UpdatePatientData) => {
  if (!selectedPatient) return

  await updatePatientMutation.mutateAsync({
   id: selectedPatient.id,
   data
  })
  setViewMode('list')
 }

 const handleQuickCreateSuccess = () => {
  setShowQuickModal(false)
  // The list will automatically refresh due to React Query invalidation
 }

 const renderContent = () => {
  switch (viewMode) {
   case 'create':
    return (
     <div className="space-y-6">
      <div className="flex items-center gap-4">
       <Button
        variant="ghost"
        size="sm"
        onClick={handleBackToList}
       >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
       </Button>
       <div>
        <h1 className="text-2xl font-bold">Novo Paciente</h1>
        <p className="text-muted-foreground">Cadastre um novo paciente no sistema</p>
       </div>
      </div>
      <PatientForm
       onSubmit={handleSubmitCreate}
       onCancel={handleBackToList}
       isLoading={createPatientMutation.isPending}
      />
     </div>
    )

   case 'edit':
    return (
     <div className="space-y-6">
      <div className="flex items-center gap-4">
       <Button
        variant="ghost"
        size="sm"
        onClick={handleBackToList}
       >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
       </Button>
       <div>
        <h1 className="text-2xl font-bold">Editar Paciente</h1>
        <p className="text-muted-foreground">
         Atualize as informações de {selectedPatient?.fullName}
        </p>
       </div>
      </div>
      <PatientForm
       patient={selectedPatient!}
       onSubmit={handleSubmitUpdate}
       onCancel={handleBackToList}
       isLoading={updatePatientMutation.isPending}
      />
     </div>
    )

   case 'view':
    return (
     <div className="space-y-6">
      <div className="flex items-center gap-4">
       <Button
        variant="ghost"
        size="sm"
        onClick={handleBackToList}
       >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
       </Button>
       <Button
        variant="outline"
        size="sm"
        onClick={() => handleEditPatient(selectedPatient!)}
       >
        Editar Paciente
       </Button>
      </div>
      <PatientHistory patientId={selectedPatient!.id} />
     </div>
    )

   default:
    return (
     <PatientsList
      onCreatePatient={handleCreatePatient}
      onEditPatient={handleEditPatient}
      onViewPatient={handleViewPatient}
      onQuickCreate={handleQuickCreate}
     />
    )
  }
 }

 return (
  <div className="container mx-auto px-4 py-6">
   {renderContent()}
   
   <QuickPatientModal
    open={showQuickModal}
    onOpenChange={setShowQuickModal}
    onSuccess={handleQuickCreateSuccess}
   />
  </div>
 )
}