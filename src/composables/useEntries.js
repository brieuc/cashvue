// src/composables/useEntries.js
import { useApi } from './useApi.js'
import { entryService } from '@/services/entries.js'

export function useEntries() {
  const { loading, execute } = useApi()

  const getAll = () => execute(() => entryService.getAll())

  const getById = (id) => execute(() => entryService.getById(id))

  const getByPeriod = (periodId) => execute(() => entryService.getByPeriod(periodId))

  const getByDateRange = (startDate, endDate) =>
    execute(() => entryService.getByDateRange(startDate, endDate))

  const getByTag = (tagId) => execute(() => entryService.getByTag(tagId))

  const create = (data) => execute(() => entryService.create(data), 'Dépense créée !')

  const update = (id, data) => execute(() => entryService.update(id, data), 'Dépense mise à jour !')

  const deleteEntry = (id) => execute(() => entryService.delete(id), 'Dépense supprimée !')

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
