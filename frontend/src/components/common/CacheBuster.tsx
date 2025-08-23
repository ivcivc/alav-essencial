import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw } from 'lucide-react'

interface CacheBusterProps {
 onRetry?: () => void
}

export function CacheBuster({ onRetry }: CacheBusterProps) {
 const [isVisible, setIsVisible] = useState(false)

 useEffect(() => {
  // Mostrar o componente após 3 segundos se ainda não houver dados
  const timer = setTimeout(() => {
   setIsVisible(true)
  }, 3000)

  return () => clearTimeout(timer)
 }, [])

 const handleHardRefresh = () => {
  // Limpar todos os caches possíveis
  if ('serviceWorker' in navigator) {
   navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister())
   })
  }

  // Limpar localStorage e sessionStorage
  localStorage.clear()
  sessionStorage.clear()

  // Forçar reload com cache bypass
  window.location.reload()
 }

 const handleClearCacheAndRetry = () => {
  // Limpar apenas dados específicos
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
   if (key.startsWith('auth_') || key.startsWith('cache_')) {
    localStorage.removeItem(key)
   }
  })

  if (onRetry) {
   onRetry()
  }
 }

 if (!isVisible) {
  return null
 }

 return (
  <Alert className="m-4 border-amber-200 ">
   <RefreshCw className="h-4 w-4 " />
   <AlertDescription className="">
    <div className="space-y-3">
     <p>
      <strong>Problema de cache detectado!</strong> As APIs não estão respondendo corretamente.
     </p>
     <div className="flex flex-col sm:flex-row gap-2">
      <Button 
       onClick={handleClearCacheAndRetry}
       variant="outline" 
       size="sm"
       className="border-amber-300 text-amber-700 hover:"
      >
       <RefreshCw className="h-4 w-4 mr-2" />
       Tentar Novamente
      </Button>
      <Button 
       onClick={handleHardRefresh}
       variant="default" 
       size="sm"
       className="bg-amber-600 hover:"
      >
       <RefreshCw className="h-4 w-4 mr-2" />
       Forçar Atualização Completa
      </Button>
     </div>
     <p className="text-xs ">
      💡 <strong>Dica:</strong> Use Ctrl+Shift+R (ou Cmd+Shift+R no Mac) para forçar atualização
     </p>
    </div>
   </AlertDescription>
  </Alert>
 )
}
