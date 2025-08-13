interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface ApiError {
  success: false
  error: string
  message?: string
}

// Force the API to use the proxy in development
const API_BASE_URL = '/api'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
    console.log('🔧 ApiClient initialized with baseURL:', baseURL)
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Debug: Log the URL being used
    console.log('🔍 API Request:', { baseURL: this.baseURL, endpoint, url })
    
    // Get token from localStorage - try both possible keys
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
    
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
        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
          return Promise.reject(new Error('Unauthorized'))
        }
        
        throw new Error(data.error || data.message || 'Request failed')
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL)

// Debug: Log the final configuration
console.log('🚀 API Client created:', { API_BASE_URL, timestamp: new Date().toISOString() })