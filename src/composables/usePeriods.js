// src/composables/usePeriods.js
import { useApi } from './useApi.js'
import { periodService } from '@/services/periods.js'

export function usePeriods() {
  const { loading, execute } = useApi()

  const getAll = () => execute(() => periodService.getAll())

  const getCurrent = () => execute(() => periodService.getCurrent())

  const create = (data) => execute(() => periodService.create(data), 'Période créée !')

  const update = (id, data) =>
    execute(() => periodService.update(id, data), 'Période mise à jour !')

  const deletePeriod = (id) => execute(() => periodService.delete(id), 'Période supprimée !')

  return { loading, getAll, getCurrent, create, update, deletePeriod }
}
