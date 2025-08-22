import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Users,
  UserCheck,
  Calendar,
  Building2,
  Package,
  DollarSign,
  BarChart3,
  Settings,
  Home,
  Bell,
  Shield,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Pacientes', href: '/patients', icon: Users },
  { name: 'Parceiros', href: '/partners', icon: UserCheck },
  { name: 'Agendamentos', href: '/appointments', icon: Calendar },
  { name: 'Salas', href: '/rooms', icon: Building2 },
  { name: 'Produtos/Serviços', href: '/products', icon: Package },
  { name: 'Notificações', href: '/notifications', icon: Bell },
  { name: 'Financeiro', href: '/financial', icon: DollarSign },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Backup', href: '/backup', icon: Shield },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-background px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-foreground">Clínica Essencial</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                                                      className={cn(
                                isActive
                                  ? 'text-white'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
                              )}
                              style={isActive ? {
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-primary-foreground)'
                              } : {}}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground',
                            'h-6 w-6 shrink-0'
                          )}
                          style={isActive ? { color: 'var(--color-primary-foreground)' } : {}}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}