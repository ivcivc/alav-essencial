import React from 'react'
import { cn } from '../../lib/utils'

interface ResponsiveGridProps {
 children: React.ReactNode
 className?: string
 cols?: {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
 }
 gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const gapClasses = {
 none: 'gap-0',
 sm: 'gap-2 sm:gap-3',
 md: 'gap-4 sm:gap-6',
 lg: 'gap-6 sm:gap-8',
 xl: 'gap-8 sm:gap-12'
}

export function ResponsiveGrid({ 
 children, 
 className,
 cols = { xs: 1, sm: 2, md: 3, lg: 4 },
 gap = 'md'
}: ResponsiveGridProps) {
 const gridClasses = []
 
 if (cols.xs) gridClasses.push(`grid-cols-${cols.xs}`)
 if (cols.sm) gridClasses.push(`sm:grid-cols-${cols.sm}`)
 if (cols.md) gridClasses.push(`md:grid-cols-${cols.md}`)
 if (cols.lg) gridClasses.push(`lg:grid-cols-${cols.lg}`)
 if (cols.xl) gridClasses.push(`xl:grid-cols-${cols.xl}`)

 return (
  <div className={cn(
   'grid',
   ...gridClasses,
   gapClasses[gap],
   className
  )}>
   {children}
  </div>
 )
}

