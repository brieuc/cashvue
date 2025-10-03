// src/services/periods.js
import { api } from './api.js'

export const periodService = {
  async getAll() {
    return api.get('/periods')
  },
  async getCurrent() {
    return api.get('/periods/current')
  },
  async create(data) {
    return api.post('/periods', data)
  },
  async update(id, data) {
    return api.put(`/periods/${id}`, data)
  },
  async delete(id) {
    return api.delete(`/periods/${id}`)
  },
}
