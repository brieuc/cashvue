// src/composables/useRates.js
import { useApi } from './useApi.js'
import { rateService } from '@/services/rates.js'

export function useRates() {
  const { loading, execute } = useApi()

  const getAll = () => execute(() => rateService.getAll())

  const getByDate = (date) => execute(() => rateService.getByDate(date))

  const getByCurrency = (currencyCode) => execute(() => rateService.getByCurrency(currencyCode))

  const create = (data) => execute(() => rateService.create(data), 'Taux créé !')

  const update = (id, data) => execute(() => rateService.update(id, data), 'Taux mis à jour !')

  const deleteRate = (id) => execute(() => rateService.delete(id), 'Taux supprimé !')

  return { loading, getAll, getByDate, getByCurrency, create, update, deleteRate }
}
