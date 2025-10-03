// src/services/rates.js
import { api } from './api.js'

export const rateService = {
  async getAll() {
    return api.get('/rates')
  },
  async getByDate(date) {
    return api.get(`/rates/${date}`)
  },
  async getByCurrency(currencyCode) {
    return api.get(`/rates/currency/${currencyCode}`)
  },
  async create(data) {
    return api.post('/rates', data)
  },
  async update(id, data) {
    return api.put(`/rates/${id}`, data)
  },
  async delete(id) {
    return api.delete(`/rates/${id}`)
  },
}
