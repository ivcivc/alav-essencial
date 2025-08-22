import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { LogoutButton } from '@/components/auth'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '../common/ThemeToggle'
import { MobileNav } from './MobileNav'

export function Header() {
  const { user } = useAuth()

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:hidden">
          <MobileNav />
          <h1 className="text-lg font-bold text-foreground">Clínica Essencial</h1>
        </div>
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />

          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex sm:flex-col sm:items-end">
                <span className="text-sm font-medium">{user.name}</span>
                <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'} className="text-xs">
                  {user.role === 'ADMIN' ? 'Admin' : 'Usuário'}
                </Badge>
              </div>
              <LogoutButton variant="ghost" size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}