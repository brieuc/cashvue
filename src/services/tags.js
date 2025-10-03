// src/services/tags.js
import { api } from './api.js'

export const tagService = {
  async getAll() {
    return api.get('/tags')
  },
  async create(data) {
    return api.post('/tags', data)
  },
  async update(id, data) {
    return api.put(`/tags/${id}`, data)
  },
  async delete(id) {
    return api.delete(`/tags/${id}`)
  },
}
