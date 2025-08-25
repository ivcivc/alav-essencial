import React from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ConfirmDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  itemName: string
  itemType: string
  isLoading?: boolean
  warnings?: string[]
  confirmText?: string
  cancelText?: string
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  itemType,
  isLoading = false,
  warnings = [],
  confirmText = "Excluir",
  cancelText = "Cancelar"
}: ConfirmDeleteModalProps) {
  const defaultTitle = `Excluir ${itemType}`
  const defaultDescription = `Tem certeza que deseja excluir ${itemType.toLowerCase()} "${itemName}"?`

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-red-100 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              {title || defaultTitle}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground text-left">
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-6">
          <div className="rounded-lg border bg-muted/50 p-3">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="font-mono text-xs">
                {itemType.toUpperCase()}
              </Badge>
              <span className="font-medium text-sm">{itemName}</span>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800">
                    Atenção:
                  </p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    {warnings.map((warning, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span className="text-amber-600">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
