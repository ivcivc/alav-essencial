import React from 'react'
import { Button } from '../ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '../ui/dropdown-menu'
import { SunIcon, MoonIcon, MonitorIcon, CheckIcon, PaletteIcon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, setTheme, actualTheme, primaryColor, setPrimaryColor } = useTheme()

  const themes = [
    {
      value: 'light' as const,
      label: 'Claro',
      icon: SunIcon,
    },
    {
      value: 'dark' as const,
      label: 'Escuro', 
      icon: MoonIcon,
    },
    {
      value: 'system' as const,
      label: 'Sistema',
      icon: MonitorIcon,
    },
  ]

  const colors = [
    { value: 'blue', label: 'Azul', color: '#2563eb' },
    { value: 'green', label: 'Verde', color: '#059669' },
    { value: 'purple', label: 'Roxo', color: '#7c3aed' },
    { value: 'orange', label: 'Laranja', color: '#ea580c' },
    { value: 'red', label: 'Vermelho', color: '#dc2626' },
    { value: 'indigo', label: 'Índigo', color: '#4f46e5' },
    { value: 'emerald', label: 'Esmeralda', color: '#059669' },
    { value: 'cyan', label: 'Ciano', color: '#0891b2' },
  ]

  const currentThemeConfig = themes.find(t => t.value === theme) || themes[0]
  const CurrentIcon = currentThemeConfig.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          style={{
            backgroundColor: actualTheme === 'dark' ? '#374151' : '#f8fafc',
            borderColor: actualTheme === 'dark' ? '#4b5563' : '#e2e8f0',
            color: actualTheme === 'dark' ? '#f9fafb' : '#111827'
          }}
          aria-label="Configurações de tema"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Configurações de tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56"
        style={{
          backgroundColor: actualTheme === 'dark' ? '#1f2937' : '#ffffff',
          borderColor: actualTheme === 'dark' ? '#374151' : '#e5e7eb',
          color: actualTheme === 'dark' ? '#f9fafb' : '#111827'
        }}
      >
        <DropdownMenuLabel className="text-sm font-medium">
          Aparência
        </DropdownMenuLabel>
        
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isSelected = theme === themeOption.value
          
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className="flex items-center justify-between cursor-pointer"
              style={{
                backgroundColor: isSelected 
                  ? (actualTheme === 'dark' ? '#374151' : '#f1f5f9')
                  : 'transparent'
              }}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{themeOption.label}</span>
              </div>
              {isSelected && (
                <CheckIcon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
              )}
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator style={{
          backgroundColor: actualTheme === 'dark' ? '#374151' : '#e5e7eb'
        }} />
        
        <DropdownMenuLabel className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <PaletteIcon className="h-4 w-4" />
            Cor Primária
          </div>
        </DropdownMenuLabel>

        <div className="grid grid-cols-4 gap-2 p-2">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => setPrimaryColor(color.value as any)}
              className="relative w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 transition-all hover:scale-110"
              style={{ 
                backgroundColor: color.color,
                borderColor: primaryColor === color.value ? '#ffffff' : (actualTheme === 'dark' ? '#4b5563' : '#d1d5db'),
                boxShadow: primaryColor === color.value ? `0 0 0 2px ${color.color}` : 'none'
              }}
              title={color.label}
            >
              {primaryColor === color.value && (
                <CheckIcon className="h-4 w-4 text-white absolute inset-0 m-auto" />
              )}
            </button>
          ))}
        </div>
        
        <div 
          className="px-2 py-1.5 text-xs border-t mt-1"
          style={{
            color: actualTheme === 'dark' ? '#9ca3af' : '#6b7280',
            borderColor: actualTheme === 'dark' ? '#374151' : '#e5e7eb'
          }}
        >
          Tema: {actualTheme === 'dark' ? 'Escuro' : 'Claro'}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

