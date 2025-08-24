import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

import { AppLayout } from './components/layout/AppLayout'
import { LoginForm, ProtectedRoute, AdminRoute } from './components/auth'
import { Toaster } from './components/ui/toaster'
import { LazyLoadSpinner } from './components/common/LazyLoadSpinner'

// Lazy loading das páginas principais para otimização de bundle
const Dashboard = React.lazy(() => import('./features/dashboard/Dashboard').then(module => ({ default: module.Dashboard })))
const PatientsPage = React.lazy(() => import('./features/patients').then(module => ({ default: module.PatientsPage })))
const PartnersPage = React.lazy(() => import('./features/partners').then(module => ({ default: module.PartnersPage })))
const AppointmentsPage = React.lazy(() => import('./features/appointments').then(module => ({ default: module.AppointmentsPage })))
const RoomsPage = React.lazy(() => import('./features/rooms').then(module => ({ default: module.RoomsPage })))
const ProductsPage = React.lazy(() => import('./features/products').then(module => ({ default: module.ProductsPage })))
const NotificationsPage = React.lazy(() => import('./features/notifications').then(module => ({ default: module.NotificationsPage })))
const FinancialPage = React.lazy(() => import('./features/financial').then(module => ({ default: module.FinancialPage })))
const BackupPage = React.lazy(() => import('./features/backup').then(module => ({ default: module.BackupPage })))
const ReportsPage = React.lazy(() => import('./features/reports').then(module => ({ default: module.ReportsPage })))
const SettingsPage = React.lazy(() => import('./features/settings').then(module => ({ default: module.SettingsPage })))

function App() {
 return (
  <ThemeProvider>
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
       <Suspense fallback={<LazyLoadSpinner message="Carregando Dashboard..." />}>
        <Dashboard />
       </Suspense>
      </AppLayout>
     </ProtectedRoute>
    } />
    
    <Route path="/patients" element={
     <ProtectedRoute>
      <AppLayout>
       <Suspense fallback={<LazyLoadSpinner message="Carregando Pacientes..." />}>
        <PatientsPage />
       </Suspense>
      </AppLayout>
     </ProtectedRoute>
    } />
    
    <Route path="/partners" element={
     <ProtectedRoute>
      <AppLayout>
       <Suspense fallback={<LazyLoadSpinner message="Carregando Parceiros..." />}>
        <PartnersPage />
       </Suspense>
      </AppLayout>
     </ProtectedRoute>
    } />
    
    <Route path="/appointments" element={
     <ProtectedRoute>
      <AppLayout>
       <Suspense fallback={<LazyLoadSpinner message="Carregando Agendamentos..." />}>
        <AppointmentsPage />
       </Suspense>
      </AppLayout>
     </ProtectedRoute>
    } />
    
    <Route path="/rooms" element={
     <ProtectedRoute>
      <AppLayout>
       <Suspense fallback={<LazyLoadSpinner message="Carregando Salas..." />}>
        <RoomsPage />
       </Suspense>
      </AppLayout>
     </ProtectedRoute>
    } />
    
    <Route path="/products" element={
     <ProtectedRoute>
      <AppLayout>
       <Suspense fallback={<LazyLoadSpinner message="Carregando Produtos/Serviços..." />}>
        <ProductsPage />
       </Suspense>
      </AppLayout>
     </ProtectedRoute>
    } />
    
    <Route path="/notifications" element={
     <AdminRoute>
      <AppLayout>
       <Suspense fallback={<LazyLoadSpinner message="Carregando Notificações..." />}>
        <NotificationsPage />
       </Suspense>
      </AppLayout>
     </AdminRoute>
    } />
    
    <Route path="/financial" element={
     <ProtectedRoute>
      <AppLayout>
       <Suspense fallback={<LazyLoadSpinner message="Carregando Financeiro..." />}>
        <FinancialPage />
       </Suspense>
      </AppLayout>
     </ProtectedRoute>
    } />
    
    <Route path="/backup" element={
     <AdminRoute>
      <AppLayout>
       <Suspense fallback={<LazyLoadSpinner message="Carregando Backup..." />}>
        <BackupPage />
       </Suspense>
      </AppLayout>
     </AdminRoute>
    } />
    
    <Route path="/reports" element={
     <ProtectedRoute>
      <AppLayout>
       <Suspense fallback={<LazyLoadSpinner message="Carregando Relatórios..." />}>
        <ReportsPage />
       </Suspense>
      </AppLayout>
     </ProtectedRoute>
    } />
    
    <Route path="/settings" element={
     <AdminRoute>
      <AppLayout>
       <Suspense fallback={<LazyLoadSpinner message="Carregando Configurações..." />}>
        <SettingsPage />
       </Suspense>
      </AppLayout>
     </AdminRoute>
    } />
    
    {/* Catch all route */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
   </Routes>
       <Toaster />
    </AuthProvider>
   </ThemeProvider>
 )
}

export default App