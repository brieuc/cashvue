// src/services/api.ts - Client HTTP simple
class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || '/api/cashtag'
  }

  getHeaders(): Record<string, string> {
    //const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      //...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(`${this.baseURL}${url}`, {
      headers: this.getHeaders(),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.request(url)
    return response.json() as Promise<T>
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.json() as Promise<T>
  }

  async put<T>(url: string, data: unknown): Promise<T> {
    const response = await this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.json() as Promise<T>
  }

  async delete(url: string): Promise<void> {
    await this.request(url, { method: 'DELETE' })
  }
}

export const api = new ApiClient()
