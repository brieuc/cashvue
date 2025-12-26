// src/services/entries.ts
import { api } from './api'
import type { Entry, CreateEntryRequest, UpdateEntryRequest } from '@/types'

export const entryService = {
  async getAll(): Promise<Entry[]> {
    return api.get<Entry[]>('/entries')
  },

  async getById(id: string): Promise<Entry> {
    return api.get<Entry>(`/entries/${id}`)
  },

  async getByPeriod(periodId: string): Promise<Entry[]> {
    return api.get<Entry[]>(`/entries/period/${periodId}`)
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Entry[]> {
    return api.get<Entry[]>(`/entries/range?start=${startDate}&end=${endDate}`)
  },

  async getByTag(tagId: string): Promise<Entry[]> {
    return api.get<Entry[]>(`/entries/tag/${tagId}`)
  },

  async create(data: CreateEntryRequest): Promise<Entry> {
    return api.post<Entry>('/entries', data)
  },

  async update(id: string, data: UpdateEntryRequest): Promise<Entry> {
    return api.put<Entry>(`/entries/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/entries/${id}`)
  },
}
