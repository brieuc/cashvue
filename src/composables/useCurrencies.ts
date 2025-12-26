// src/composables/useCurrencies.ts
import { useApi } from './useApi'
import { currencyService } from '@/services/currencies'
import type { UseCurrenciesReturn, CreateCurrencyRequest, UpdateCurrencyRequest } from '@/types'

export function useCurrencies(): UseCurrenciesReturn {
  const { loading, execute } = useApi()

  const getAll = () => execute(() => currencyService.getAll())

  const create = (data: CreateCurrencyRequest) =>
    execute(() => currencyService.create(data), 'Devise créée !')

  const update = (code: string, data: UpdateCurrencyRequest) =>
    execute(() => currencyService.update(code, data), 'Devise mise à jour !')

  const deleteCurrency = (code: string) =>
    execute(() => currencyService.delete(code), 'Devise supprimée !')

  return { loading, getAll, create, update, deleteCurrency }
}
