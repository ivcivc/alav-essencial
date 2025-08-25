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
// Use explicit localhost to bypass potential DNS/proxy caching issues
const API_BASE_URL = window.location.hostname === 'localhost' ? '' : ''

// Função para detectar se estamos em desenvolvimento e forçar proxy
function getApiUrl(endpoint: string): string {
  const isDev = window.location.hostname === 'localhost'
  const baseUrl = isDev ? '' : ''
  
  // Garantir que endpoints de dashboard tenham o prefixo /api/
  if (endpoint.startsWith('/dashboard/')) {
    endpoint = `/api${endpoint}`
  } else if (!endpoint.startsWith('/api/') && !endpoint.startsWith('http')) {
    endpoint = `/api${endpoint}`
  }
  
  // Em desenvolvimento, forçar o uso do proxy com URL absoluta se necessário
  if (isDev && endpoint.startsWith('/api/')) {
    // Verificar se já é uma URL completa
    if (endpoint.startsWith('http')) {
      return endpoint
    }
    // Usar proxy padrão
    return `${baseUrl}${endpoint}`
  }
  
  return `${baseUrl}${endpoint}`
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
    console.log('🔧 ApiClient initialized with baseURL:', baseURL)
  }

  private requestWithXHR<T>(url: string, config: RequestInit): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const method = config.method || 'GET'
      
      xhr.open(method, url, true)
      
      // Configurar headers
      if (config.headers) {
        Object.entries(config.headers as Record<string, string>).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value)
        })
      }
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText)
              console.log('✅ XMLHttpRequest sucesso:', { status: xhr.status, url })
              resolve(data)
            } catch (parseError) {
              console.error('❌ XMLHttpRequest: Erro ao parsear JSON:', parseError)
              reject(new Error('Response is not valid JSON'))
            }
          } else {
            console.error('❌ XMLHttpRequest: Erro HTTP:', { status: xhr.status, url })
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
          }
        }
      }
      
      xhr.onerror = function() {
        console.error('❌ XMLHttpRequest: Erro de rede:', url)
        reject(new Error('Network error'))
      }
      
      // Enviar dados se for POST/PUT
      if (config.body) {
        xhr.send(config.body as string)
      } else {
        xhr.send()
      }
    })
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Add cache-busting timestamp with extra randomness
    const separator = endpoint.includes('?') ? '&' : '?'
    const cacheBuster = `${separator}_t=${Date.now()}&_r=${Math.random()}&_v=2`
    const url = getApiUrl(`${endpoint}${cacheBuster}`)
    
    // Debug: Log the URL being used
    console.log('🔍 API Request:', { baseURL: this.baseURL, endpoint, url })
    
    // Get token from localStorage - try both possible keys
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
    
    const config: RequestInit = {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Requested-With': 'XMLHttpRequest',
        ...(token && { Authorization: `Bearer ${token}` }),
        // Só setar Content-Type se houver body
        ...(options.body && { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      cache: 'no-store',
      mode: 'cors',
      credentials: 'same-origin',
      ...options,
    }

    try {
      // Para endpoints de dashboard, usar XMLHttpRequest diretamente
      if (endpoint.includes('/dashboard/')) {
        console.log('🔄 Usando XMLHttpRequest para dashboard:', endpoint)
        return this.requestWithXHR<T>(url, config)
      }
      
      // Tentar fetch primeiro para outras requisições
      let response: Response
      
      try {
        response = await fetch(url, config)
        
        // Se retornar HTML em vez de JSON, tentar XMLHttpRequest
        const contentType = response.headers.get('content-type')
        console.log('🔍 Content-Type recebido:', contentType, 'para URL:', url)
        
        if (!contentType?.includes('application/json') && (url.includes('/api/') || endpoint.includes('/dashboard/'))) {
          console.warn('⚠️ Fetch retornou HTML, tentando XMLHttpRequest...')
          return this.requestWithXHR<T>(url, config)
        }
        
        // Verificar se o conteúdo é realmente HTML mesmo com content-type JSON
        if (response.ok) {
          const responseClone = response.clone()
          const text = await responseClone.text()
          if (text.includes('<!doctype html>') || text.includes('<html')) {
            console.warn('⚠️ Resposta contém HTML mesmo com content-type JSON, tentando XMLHttpRequest...')
            return this.requestWithXHR<T>(url, config)
          }
        }
      } catch (fetchError) {
        console.warn('⚠️ Fetch falhou, tentando XMLHttpRequest...', fetchError)
        return this.requestWithXHR<T>(url, config)
      }
      
      // Check if response is ok first
      if (!response.ok) {
        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
          return Promise.reject(new Error('Unauthorized'))
        }
        
        // Try to get error message from response
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch {
          // If JSON parsing fails, use basic error
          errorData = { error: response.statusText || `HTTP ${response.status}` }
        }
        
        // Create a detailed error with validation details if available
        const error = new Error(errorData.error || errorData.message || 'Request failed') as any
        error.status = response.status
        error.details = errorData.details || []
        error.validationErrors = errorData.details || []
        
        throw error
      }
      
      // Check content type before parsing JSON
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        console.warn('⚠️ Response is not JSON:', contentType)
        const textResponse = await response.text()
        console.warn('Response text:', textResponse)
        throw new Error('Response is not JSON')
      }
      
      const data = await response.json()
      return data
          } catch (error: any) {
        console.error('API request failed:', error)
        
        // Se é um erro de rede, criar um erro mais descritivo
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          const networkError = new Error('Erro de conexão com o servidor. Verifique se o backend está rodando.') as any
          networkError.status = 0
          networkError.originalError = error
          throw networkError
        }
        
        // Se continuamos recebendo HTML em vez de JSON, pode ser cache persistente
        if (error.message === 'Response is not JSON') {
          console.warn('⚠️ Problema de cache detectado. Faça um hard refresh (Ctrl+Shift+R ou Cmd+Shift+R)')
        }
        
        throw error
      }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const options: RequestInit = { method: 'POST' }
    if (data !== undefined) {
      options.body = JSON.stringify(data)
    }
    console.log('🚀 POST Request:', { endpoint, hasData: data !== undefined, options })
    return this.request<T>(endpoint, options)
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

// Debug: Log the final configuration - VERSION 2.0 FIXED
console.log('🚀 API Client created v2.0 - POST FIXED:', { API_BASE_URL, timestamp: new Date().toISOString() })