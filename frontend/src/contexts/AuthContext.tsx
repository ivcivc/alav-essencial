import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, LoginRequest, AuthContextType, AuthError } from '@/types/auth'
import { authService } from '@/services/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const storedToken = authService.getToken()
      
      if (!storedToken) {
        setIsLoading(false)
        return
      }

      // Check if token is expired
      if (authService.isTokenExpired(storedToken)) {
        authService.clearToken()
        setIsLoading(false)
        return
      }

      // Verify token with server and get user data
      const response = await authService.getCurrentUser()
      setUser(response.user)
      setToken(storedToken)
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      authService.clearToken()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      const response = await authService.login(credentials)
      
      setUser(response.user)
      setToken(response.token)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setIsLoading(true)
    
    // Clear state immediately for better UX
    setUser(null)
    setToken(null)
    
    // Call logout service (async, but don't wait for it)
    authService.logout().finally(() => {
      setIsLoading(false)
    })
  }

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken()
      setToken(response.token)
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthContext }