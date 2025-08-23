import React, { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
 children: ReactNode
 requiredRole?: 'ADMIN' | 'USER'
 redirectTo?: string
}

export function ProtectedRoute({ 
 children, 
 requiredRole,
 redirectTo = '/login' 
}: ProtectedRouteProps) {
 const { isAuthenticated, user, isLoading } = useAuth()
 const location = useLocation()

 // Show loading spinner while checking authentication
 if (isLoading) {
  return (
   <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8  border-primary"></div>
   </div>
  )
 }

 // Redirect to login if not authenticated
 if (!isAuthenticated) {
  return <Navigate to={redirectTo} state={{ from: location }} replace />
 }

 // Check role-based access
 if (requiredRole && user?.role !== requiredRole) {
  return (
   <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
     <h2 className="text-2xl font-bold text-muted-foreground mb-2">Access Denied</h2>
     <p className="text-muted-foreground">You don't have permission to access this page.</p>
    </div>
   </div>
  )
 }

 return <>{children}</>
}

// Higher-order component for admin-only routes
export function AdminRoute({ children }: { children: ReactNode }) {
 return (
  <ProtectedRoute requiredRole="ADMIN">
   {children}
  </ProtectedRoute>
 )
}