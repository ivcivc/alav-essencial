import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { useTheme, ThemeProvider } from '../ThemeContext'

// Test component to access theme context
const TestComponent = () => {
  const { theme, primaryColor, setTheme, setPrimaryColor } = useTheme()
  
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="current-color">{primaryColor}</span>
      <button 
        data-testid="toggle-theme" 
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        Toggle Theme
      </button>
      <button 
        data-testid="change-color" 
        onClick={() => setPrimaryColor('green')}
      >
        Change Color
      </button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock document.documentElement.classList
    const mockClassList = {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
    }
    Object.defineProperty(document.documentElement, 'classList', {
      value: mockClassList,
      writable: true,
    })
    
    // Mock document.documentElement.style
    const mockStyle = {
      setProperty: vi.fn(),
      getPropertyValue: vi.fn(),
    }
    Object.defineProperty(document.documentElement, 'style', {
      value: mockStyle,
      writable: true,
    })
  })

  it('should provide default theme and primary color', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(getByTestId('current-theme')).toHaveTextContent('light')
    expect(getByTestId('current-color')).toHaveTextContent('blue')
  })

  it('should toggle theme when setTheme is called', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const toggleButton = getByTestId('toggle-theme')
    const themeDisplay = getByTestId('current-theme')

    expect(themeDisplay).toHaveTextContent('light')
    
    fireEvent.click(toggleButton)
    
    expect(themeDisplay).toHaveTextContent('dark')
  })

  it('should change primary color when setPrimaryColor is called', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const changeColorButton = getByTestId('change-color')
    const colorDisplay = getByTestId('current-color')

    expect(colorDisplay).toHaveTextContent('blue')
    
    fireEvent.click(changeColorButton)
    
    expect(colorDisplay).toHaveTextContent('green')
  })
})
