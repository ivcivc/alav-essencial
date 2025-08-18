import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User, AuthError } from '../types/auth'

const API_BASE_URL = ''

class AuthService {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const token = this.getToken()
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        const error: AuthError = {
          error: data.error || 'Request failed',
          message: data.message || 'An error occurred'
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Auth API request failed:', error)
      throw error
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    // Store token in localStorage
    if (response.token) {
      this.setToken(response.token)
    }

    return response
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/auth/me')
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await this.request<{ token: string }>('/api/auth/refresh', {
      method: 'POST',
    })

    if (response.token) {
      this.setToken(response.token)
    }

    return response
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      // Even if the server request fails, we should clear local storage
      console.warn('Logout request failed, but clearing local storage:', error)
    } finally {
      this.clearToken()
    }
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  clearToken(): void {
    localStorage.removeItem('auth_token')
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      return true
    }
  }

  // Decode JWT token to get user info
  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch (error) {
      return null
    }
  }
}

export const authService = new AuthService(API_BASE_URL)