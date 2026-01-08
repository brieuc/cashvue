// src/composables/useRates.ts
import { useApi } from './useApi'
import { rateService } from '@/services/rates'
import type { UseRatesReturn, CreateRateRequest, UpdateRateRequest } from '@/types/types'

export function useRates(): UseRatesReturn {
  const { loading, execute } = useApi()

  const getAll = () => execute(() => rateService.getAll())

  const getByDate = (date: string) => execute(() => rateService.getByDate(date))

  const getByCurrency = (currencyCode: string) =>
    execute(() => rateService.getByCurrency(currencyCode))

  const create = (data: CreateRateRequest) =>
    execute(() => rateService.create(data), 'Taux créé !')

  const update = (id: string, data: UpdateRateRequest) =>
    execute(() => rateService.update(id, data), 'Taux mis à jour !')

  const deleteRate = (id: string) => execute(() => rateService.delete(id), 'Taux supprimé !')

  return { loading, getAll, getByDate, getByCurrency, create, update, deleteRate }
}
