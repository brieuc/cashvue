// src/services/entries.js
import { api } from './api.js'

export const entryService = {
  async getAll() {
    return api.get('/entries')
  },

  async getById(id) {
    return api.get(`/entries/${id}`)
  },

  async getByPeriod(periodId) {
    return api.get(`/entries/period/${periodId}`)
  },

  async getByDateRange(startDate, endDate) {
    return api.get(`/entries/range?start=${startDate}&end=${endDate}`)
  },

  async getByTag(tagId) {
    return api.get(`/entries/tag/${tagId}`)
  },

  async create(data) {
    return api.post('/entries', data)
  },

  async update(id, data) {
    return api.put(`/entries/${id}`, data)
  },

  async delete(id) {
    return api.delete(`/entries/${id}`)
  },
}
