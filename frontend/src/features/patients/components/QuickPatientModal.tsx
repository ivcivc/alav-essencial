import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { PatientForm } from './PatientForm'
import { useCreatePatient } from '@/hooks/usePatients'
import { useToast } from '@/hooks/useToast'
import { CreatePatientData } from '@/services/patients'

interface QuickPatientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (patient: any) => void
}

export const QuickPatientModal: React.FC<QuickPatientModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast()
  const createPatientMutation = useCreatePatient()

  const handleSubmit = async (data: CreatePatientData) => {
    try {
      const patient = await createPatientMutation.mutateAsync(data)
      toast({
        title: "Sucesso!",
        description: "Paciente cadastrado com sucesso.",
        variant: "success",
      })
      onSuccess?.(patient)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar paciente.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastro Rápido de Paciente</DialogTitle>
          <DialogDescription>
            Cadastre rapidamente um novo paciente com as informações essenciais.
            Você pode completar os dados posteriormente.
          </DialogDescription>
        </DialogHeader>
        
        <DialogClose onClick={() => onOpenChange(false)} />
        
        <div className="mt-4">
          <PatientForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createPatientMutation.isPending}
            isQuickForm={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}