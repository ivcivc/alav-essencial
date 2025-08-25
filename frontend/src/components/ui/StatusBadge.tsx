import React from 'react'
import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  active: boolean
  size?: 'default' | 'sm' | 'lg'
  activeText?: string
  inactiveText?: string
}

export function StatusBadge({ 
  active, 
  size = 'default',
  activeText = 'Ativo',
  inactiveText = 'Inativo'
}: StatusBadgeProps) {
  return (
    <Badge 
      variant={active ? 'default' : 'secondary'}
      className={`
        font-medium text-white
        ${active 
          ? 'bg-green-600 hover:bg-green-700 border-green-600' 
          : 'bg-gray-600 hover:bg-gray-700 border-gray-600'
        }
        ${size === 'sm' ? 'text-xs px-2 py-1' : ''}
        ${size === 'lg' ? 'text-base px-3 py-2' : ''}
      `}
    >
      {active ? activeText : inactiveText}
    </Badge>
  )
}
