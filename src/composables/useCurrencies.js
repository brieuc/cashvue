// src/composables/useCurrencies.js
import { useApi } from './useApi.js'
import { currencyService } from '@/services/currencies.js'

export function useCurrencies() {
  const { loading, execute } = useApi()

  const getAll = () => execute(() => currencyService.getAll())

  const create = (data) => execute(() => currencyService.create(data), 'Devise créée !')

  const update = (code, data) =>
    execute(() => currencyService.update(code, data), 'Devise mise à jour !')

  const deleteCurrency = (code) => execute(() => currencyService.delete(code), 'Devise supprimée !')

  return { loading, getAll, create, update, deleteCurrency }
}
