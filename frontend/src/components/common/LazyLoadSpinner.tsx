import React from 'react'
import { Loader2 } from 'lucide-react'

interface LazyLoadSpinnerProps {
  message?: string
}

export function LazyLoadSpinner({ message = 'Carregando...' }: LazyLoadSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// HOC para criar suspense boundary com loading spinner
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  loadingMessage?: string
) {
  return function LazyComponent(props: T) {
    return (
      <React.Suspense fallback={<LazyLoadSpinner message={loadingMessage} />}>
        <Component {...props} />
      </React.Suspense>
    )
  }
}
