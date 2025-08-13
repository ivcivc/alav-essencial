export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER'
  active: boolean
  createdAt: string
  updatedAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role?: 'ADMIN' | 'USER'
}

export interface RegisterResponse {
  user: User
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

export interface AuthError {
  error: string
  message: string
}