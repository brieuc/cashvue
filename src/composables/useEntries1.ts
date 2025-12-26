// src/composables/useEntries.ts
import { useApi } from './useApi'
import { entryService } from '@/services/entries'
import type { UseEntriesReturn, CreateEntryRequest, UpdateEntryRequest } from '@/types'

export function useEntries(): UseEntriesReturn {
  const { loading, execute } = useApi()

  const getAll = () => execute(() => entryService.getAll())

  const getById = (id: string) => execute(() => entryService.getById(id))

  const getByPeriod = (periodId: string) => execute(() => entryService.getByPeriod(periodId))

  const getByDateRange = (startDate: string, endDate: string) =>
    execute(() => entryService.getByDateRange(startDate, endDate))

  const getByTag = (tagId: string) => execute(() => entryService.getByTag(tagId))

  const create = (data: CreateEntryRequest) =>
    execute(() => entryService.create(data), 'Dépense créée !')

  const update = (id: string, data: UpdateEntryRequest) =>
    execute(() => entryService.update(id, data), 'Dépense mise à jour !')

  const deleteEntry = (id: string) =>
    execute(() => entryService.delete(id), 'Dépense supprimée !')

  return {
    loading,
    getAll,
    getById,
    getByPeriod,
    getByDateRange,
    getByTag,
    create,
    update,
    deleteEntry,
  }
}
