import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
 defaultOptions: {
  queries: {
   staleTime: 0,          // 🔥 SEM CACHE - SEMPRE BUSCAR DADOS FRESCOS
   gcTime: 0,             // 🔥 SEM GARBAGE COLLECTION - REMOVE IMEDIATAMENTE
   refetchOnMount: true,   // 🚀 SEMPRE REFAZER BUSCA AO MONTAR COMPONENTE
   refetchOnWindowFocus: true, // 🚀 REFAZER BUSCA AO FOCAR JANELA
   retry: 1,
  },
  mutations: {
   retry: 0,              // 🔥 SEM RETRY EM MUTATIONS
  }
 },
})

createRoot(document.getElementById('root')!).render(
 <StrictMode>
  <QueryClientProvider client={queryClient}>
   <BrowserRouter>
    <App />
   </BrowserRouter>
  </QueryClientProvider>
 </StrictMode>,
)