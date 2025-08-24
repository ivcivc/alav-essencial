import React, { createContext, useContext, useEffect, useState } from 'react'
import { hexToHSL } from '@/lib/colorUtils'

type Theme = 'light' | 'dark' | 'system'

type PrimaryColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'emerald' | 'cyan'

interface ThemeContextType {
 theme: Theme
 setTheme: (theme: Theme) => void
 actualTheme: 'light' | 'dark'
 primaryColor: PrimaryColor
 setPrimaryColor: (color: PrimaryColor) => void
}

const primaryColors = {
 blue: {
  light: { primary: '#2563eb', primaryHover: '#1d4ed8', primaryForeground: '#ffffff' },
  dark: { primary: '#3b82f6', primaryHover: '#2563eb', primaryForeground: '#000000' }
 },
 green: {
  light: { primary: '#059669', primaryHover: '#047857', primaryForeground: '#ffffff' },
  dark: { primary: '#10b981', primaryHover: '#059669', primaryForeground: '#ffffff' }
 },
 purple: {
  light: { primary: '#7c3aed', primaryHover: '#6d28d9', primaryForeground: '#ffffff' },
  dark: { primary: '#8b5cf6', primaryHover: '#7c3aed', primaryForeground: '#ffffff' }
 },
 orange: {
  light: { primary: '#ea580c', primaryHover: '#dc2626', primaryForeground: '#ffffff' },
  dark: { primary: '#f97316', primaryHover: '#ea580c', primaryForeground: '#ffffff' }
 },
 red: {
  light: { primary: '#dc2626', primaryHover: '#b91c1c', primaryForeground: '#ffffff' },
  dark: { primary: '#ef4444', primaryHover: '#dc2626', primaryForeground: '#ffffff' }
 },
 indigo: {
  light: { primary: '#4f46e5', primaryHover: '#4338ca', primaryForeground: '#ffffff' },
  dark: { primary: '#6366f1', primaryHover: '#4f46e5', primaryForeground: '#ffffff' }
 },
 emerald: {
  light: { primary: '#059669', primaryHover: '#047857', primaryForeground: '#ffffff' },
  dark: { primary: '#10b981', primaryHover: '#059669', primaryForeground: '#ffffff' }
 },
 cyan: {
  light: { primary: '#0891b2', primaryHover: '#0e7490', primaryForeground: '#ffffff' },
  dark: { primary: '#06b6d4', primaryHover: '#0891b2', primaryForeground: '#ffffff' }
 }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
 const [theme, setTheme] = useState<Theme>(() => {
  if (typeof window === 'undefined') return 'light'
  const savedTheme = localStorage.getItem('theme') as Theme
  return (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) ? savedTheme : 'light'
 })

 const [primaryColor, setPrimaryColor] = useState<PrimaryColor>(() => {
  if (typeof window === 'undefined') return 'blue'
  const savedColor = localStorage.getItem('primaryColor') as PrimaryColor
  return (savedColor && Object.keys(primaryColors).includes(savedColor)) ? savedColor : 'blue'
 })
 
 const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
  if (typeof window === 'undefined') return 'light'
  const savedTheme = localStorage.getItem('theme') as Theme
  if (savedTheme === 'dark') return 'dark'
  if (savedTheme === 'light') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
 })

 // Atualizar cores CSS quando mudar a cor primária
 useEffect(() => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('primaryColor', primaryColor)
  
  const colorConfig = primaryColors[primaryColor][actualTheme]
  const root = document.documentElement
  
  // Aplicar cores CSS customizadas para Shadcn/UI
  const primaryHSL = hexToHSL(colorConfig.primary)
  const primaryForegroundHSL = hexToHSL(colorConfig.primaryForeground)
  
  console.log('🎨 Aplicando cor primária:', { 
    color: primaryColor, 
    theme: actualTheme, 
    primaryHSL, 
    primaryForegroundHSL,
    colorConfig
  })
  
  // Atualizar variáveis CSS do Shadcn/UI
  root.style.setProperty('--primary', primaryHSL)
  root.style.setProperty('--primary-foreground', primaryForegroundHSL)
  
  // Debug: verificar se as variáveis foram aplicadas
  console.log('🔍 Variáveis aplicadas:', {
    '--primary': root.style.getPropertyValue('--primary'),
    '--primary-foreground': root.style.getPropertyValue('--primary-foreground')
  })
  
  // Manter compatibilidade com código legado
  root.style.setProperty('--color-primary', colorConfig.primary)
  root.style.setProperty('--color-primary-hover', colorConfig.primaryHover)
  root.style.setProperty('--color-primary-foreground', colorConfig.primaryForeground)
  
  // Forçar atualização visual
  root.style.setProperty('--ring', primaryHSL)
 }, [primaryColor, actualTheme])

 useEffect(() => {
  if (typeof window === 'undefined') return

  localStorage.setItem('theme', theme)

  let currentTheme: 'light' | 'dark' = 'light'
  
  if (theme === 'system') {
   currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } else {
   currentTheme = theme
  }

  setActualTheme(currentTheme)

  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(currentTheme)

  // Aplicar cores da nova cor primária
  const colorConfig = primaryColors[primaryColor][currentTheme]
  
  // Aplicar cores CSS customizadas para Shadcn/UI
  const primaryHSL = hexToHSL(colorConfig.primary)
  const primaryForegroundHSL = hexToHSL(colorConfig.primaryForeground)
  
  // Atualizar variáveis CSS do Shadcn/UI
  root.style.setProperty('--primary', primaryHSL)
  root.style.setProperty('--primary-foreground', primaryForegroundHSL)
  
  // Manter compatibilidade com código legado
  root.style.setProperty('--color-primary', colorConfig.primary)
  root.style.setProperty('--color-primary-hover', colorConfig.primaryHover)
  root.style.setProperty('--color-primary-foreground', colorConfig.primaryForeground)
  
  // Forçar atualização visual
  root.style.setProperty('--ring', primaryHSL)

  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
   metaThemeColor.setAttribute('content', currentTheme === 'dark' ? '#0f172a' : '#ffffff')
  }
 }, [theme, primaryColor])

 useEffect(() => {
  if (typeof window === 'undefined') return

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = () => {
   if (theme === 'system') {
    const newTheme = mediaQuery.matches ? 'dark' : 'light'
    setActualTheme(newTheme)
    
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(newTheme)
   }
  }

  mediaQuery.addEventListener('change', handleChange)
  return () => mediaQuery.removeEventListener('change', handleChange)
 }, [theme])

 return (
  <ThemeContext.Provider value={{ theme, setTheme, actualTheme, primaryColor, setPrimaryColor }}>
   {children}
  </ThemeContext.Provider>
 )
}

export function useTheme() {
 const context = useContext(ThemeContext)
 if (context === undefined) {
  throw new Error('useTheme must be used within a ThemeProvider')
 }
 return context
}
