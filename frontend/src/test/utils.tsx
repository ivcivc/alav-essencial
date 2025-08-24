import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data generators
export const mockPatient = {
  id: 'patient-1',
  fullName: 'João Silva',
  email: 'joao@example.com',
  phone: '11999999999',
  birthDate: '1990-01-01',
  cpf: '12345678901',
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockPartner = {
  id: 'partner-1',
  fullName: 'Dr. Maria Santos',
  email: 'maria@example.com',
  phone: '11888888888',
  cpf: '98765432100',
  partnershipType: 'PERCENTAGE' as const,
  percentageValue: 70,
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockAppointment = {
  id: 'appointment-1',
  patientId: 'patient-1',
  partnerId: 'partner-1',
  serviceId: 'service-1',
  roomId: 'room-1',
  scheduledDate: new Date().toISOString(),
  startTime: '09:00',
  endTime: '10:00',
  status: 'SCHEDULED' as const,
  totalAmount: 150.00,
  notes: 'Consulta de rotina',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
