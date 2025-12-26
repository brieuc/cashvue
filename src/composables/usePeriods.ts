// src/composables/usePeriods.ts
import { useApi } from './useApi'
import { periodService } from '@/services/periods'
import type { UsePeriodsReturn, CreatePeriodRequest, UpdatePeriodRequest } from '@/types'

export function usePeriods(): UsePeriodsReturn {
  const { loading, execute } = useApi()

  const getAll = () => execute(() => periodService.getAll())

  const getCurrent = () => execute(() => periodService.getCurrent())

  const create = (data: CreatePeriodRequest) =>
    execute(() => periodService.create(data), 'Période créée !')

  const update = (id: string, data: UpdatePeriodRequest) =>
    execute(() => periodService.update(id, data), 'Période mise à jour !')

  const deletePeriod = (id: string) =>
    execute(() => periodService.delete(id), 'Période supprimée !')

  return { loading, getAll, getCurrent, create, update, deletePeriod }
}
