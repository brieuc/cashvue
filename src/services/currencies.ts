// src/services/currencies.ts
import { api } from './api'
import type { Currency, CreateCurrencyRequest, UpdateCurrencyRequest } from '@/types/types'

export const currencyService = {
  async getAll(): Promise<Currency[]> {
    return api.get<Currency[]>('/currencies')
  },
  async create(data: CreateCurrencyRequest): Promise<Currency> {
    return api.post<Currency>('/currencies', data)
  },
  async update(code: string, data: UpdateCurrencyRequest): Promise<Currency> {
    return api.put<Currency>(`/currencies/${code}`, data)
  },
  async delete(code: string): Promise<void> {
    return api.delete(`/currencies/${code}`)
  },
}
