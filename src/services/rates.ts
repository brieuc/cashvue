// src/services/rates.ts
import { api } from './api'
import type { Rate, CreateRateRequest, UpdateRateRequest } from '@/types'

export const rateService = {
  async getAll(): Promise<Rate[]> {
    return api.get<Rate[]>('/rates')
  },
  async getByDate(date: string): Promise<Rate[]> {
    return api.get<Rate[]>(`/rates/${date}`)
  },
  async getByCurrency(currencyCode: string): Promise<Rate[]> {
    return api.get<Rate[]>(`/rates/currency/${currencyCode}`)
  },
  async create(data: CreateRateRequest): Promise<Rate> {
    return api.post<Rate>('/rates', data)
  },
  async update(id: string, data: UpdateRateRequest): Promise<Rate> {
    return api.put<Rate>(`/rates/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/rates/${id}`)
  },
}
