import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { cn } from '../../lib/utils'
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
  MenuIcon,
  XIcon,
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

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const closeNav = () => setIsOpen(false)

  return (
    <div className={cn('lg:hidden', className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="Abrir menu"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center justify-between">
              <h1 className="text-lg font-bold text-foreground">Clínica Essencial</h1>
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
                            onClick={closeNav}
                            className={cn(
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
                            )}
                          >
                            <item.icon
                              className={cn(
                                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground',
                                'h-6 w-6 shrink-0'
                              )}
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
        </SheetContent>
      </Sheet>
    </div>
  )
}

