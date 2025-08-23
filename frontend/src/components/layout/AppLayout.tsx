import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AppLayoutProps {
 children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
 return (
  <div className="min-h-screen">
   <Sidebar />
   <div className="lg:pl-64">
    <Header />
    <main className="p-4 sm:p-6 lg:p-8">
     <div className="mx-auto max-w-7xl">
      {children}
     </div>
    </main>
   </div>
  </div>
 )
}