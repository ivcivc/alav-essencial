import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  showIcon?: boolean
  children?: React.ReactNode
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default',
  showIcon = true,
  children 
}: LogoutButtonProps) {
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {children || `Sair${user?.name ? ` (${user.name})` : ''}`}
    </Button>
  )
}