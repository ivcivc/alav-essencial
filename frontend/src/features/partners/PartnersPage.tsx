import React, { useState } from 'react'
import { PartnersList } from './components/PartnersList'
import { PartnerForm } from './components/PartnerForm'
import { PartnerDetails } from './components/PartnerDetails'
import { useCreatePartner, useUpdatePartner } from '@/hooks/usePartners'
import { Partner } from '@/types/entities'
import { CreatePartnerData, UpdatePartnerData } from '@/services/partners'

type ViewMode = 'list' | 'create' | 'edit' | 'view'

interface ViewState {
 mode: ViewMode
 selectedPartner?: Partner
}

export function PartnersPage() {
 const [viewState, setViewState] = useState<ViewState>({ mode: 'list' })

 const createPartner = useCreatePartner()
 const updatePartner = useUpdatePartner()

 const handleCreatePartner = () => {
  setViewState({ mode: 'create' })
 }

 const handleEditPartner = (partner: Partner) => {
  setViewState({ mode: 'edit', selectedPartner: partner })
 }

 const handleViewPartner = (partner: Partner) => {
  setViewState({ mode: 'view', selectedPartner: partner })
 }

 const handleBackToList = () => {
  setViewState({ mode: 'list' })
 }

 const handleSubmitCreate = async (data: CreatePartnerData) => {
  createPartner.mutate(data, {
   onSuccess: () => {
    handleBackToList()
   }
  })
 }

 const handleSubmitEdit = async (data: UpdatePartnerData) => {
  if (!viewState.selectedPartner) return

  updatePartner.mutate(
   { id: viewState.selectedPartner.id, data },
   {
    onSuccess: () => {
     handleBackToList()
    }
   }
  )
 }

 // Render based on current view mode
 switch (viewState.mode) {
  case 'create':
   return (
    <PartnerForm
     onSubmit={handleSubmitCreate}
     onCancel={handleBackToList}
     isLoading={createPartner.isPending}
    />
   )

  case 'edit':
   if (!viewState.selectedPartner) {
    setViewState({ mode: 'list' })
    return null
   }
   
   return (
    <PartnerForm
     partner={viewState.selectedPartner}
     onSubmit={handleSubmitEdit}
     onCancel={handleBackToList}
     isLoading={updatePartner.isPending}
    />
   )

  case 'view':
   if (!viewState.selectedPartner) {
    setViewState({ mode: 'list' })
    return null
   }

   return (
    <PartnerDetails
     partnerId={viewState.selectedPartner.id}
     onBack={handleBackToList}
     onEdit={handleEditPartner}
    />
   )

  case 'list':
  default:
   return (
    <PartnersList
     onCreatePartner={handleCreatePartner}
     onEditPartner={handleEditPartner}
     onViewPartner={handleViewPartner}
    />
   )
 }
}
