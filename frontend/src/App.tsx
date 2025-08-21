import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './features/dashboard/Dashboard'
import { PatientsPage } from './features/patients'
import { PartnersPage } from './features/partners'
import { AppointmentsPage } from './features/appointments'
import { RoomsPage } from './features/rooms'
import { ProductsPage } from './features/products'
import { NotificationsPage } from './features/notifications'
import { FinancialPage } from './features/financial'
import { BackupPage } from './features/backup'
import { ReportsPage } from './features/reports'
import { LoginForm, ProtectedRoute, AdminRoute } from './components/auth'
import { Toaster } from './components/ui/toaster'
import { queryClient } from './lib/react-query'
import './styles/modal-improvements.css'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout>
              <Navigate to="/dashboard" replace />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/patients" element={
          <ProtectedRoute>
            <AppLayout>
              <PatientsPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/partners" element={
          <ProtectedRoute>
            <AppLayout>
              <PartnersPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/appointments" element={
          <ProtectedRoute>
            <AppLayout>
              <AppointmentsPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/rooms" element={
          <ProtectedRoute>
            <AppLayout>
              <RoomsPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/products" element={
          <ProtectedRoute>
            <AppLayout>
              <ProductsPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/notifications" element={
          <AdminRoute>
            <AppLayout>
              <NotificationsPage />
            </AppLayout>
          </AdminRoute>
        } />
        
        <Route path="/financial" element={
          <ProtectedRoute>
            <AppLayout>
              <FinancialPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <AppLayout>
              <div>Relatórios</div>
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/backup" element={
          <AdminRoute>
            <AppLayout>
              <BackupPage />
            </AppLayout>
          </AdminRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <AdminRoute>
            <AppLayout>
              <div>Configurações</div>
            </AppLayout>
          </AdminRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </AuthProvider>
    </QueryClientProvider>
  )
}

export default App