// src/services/periods.ts
import { api } from './api'
import type { Period, CreatePeriodRequest, UpdatePeriodRequest } from '@/types'

export const periodService = {
  async getAll(): Promise<Period[]> {
    return api.get<Period[]>('/periods')
  },
  async getCurrent(): Promise<Period> {
    return api.get<Period>('/periods/current')
  },
  async create(data: CreatePeriodRequest): Promise<Period> {
    return api.post<Period>('/periods', data)
  },
  async update(id: string, data: UpdatePeriodRequest): Promise<Period> {
    return api.put<Period>(`/periods/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/periods/${id}`)
  },
}
