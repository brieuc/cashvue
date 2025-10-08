// src/services/api.js - Client HTTP simple
class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL
  }

  getHeaders() {
    //const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      //...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request(url, options = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      headers: this.getHeaders(),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response
  }

  async get(url) {
    const response = await this.request(url)
    return response.json()
  }

  async post(url, data) {
    const response = await this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.json()
  }

  async put(url, data) {
    const response = await this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.json()
  }

  async delete(url) {
    await this.request(url, { method: 'DELETE' })
  }
}

export const api = new ApiClient()
