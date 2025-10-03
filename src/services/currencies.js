// src/services/currencies.js
import { api } from './api.js'

export const currencyService = {
  async getAll() {
    return api.get('/currencies')
  },
  async create(data) {
    return api.post('/currencies', data)
  },
  async update(code, data) {
    return api.put(`/currencies/${code}`, data)
  },
  async delete(code) {
    return api.delete(`/currencies/${code}`)
  },
}
