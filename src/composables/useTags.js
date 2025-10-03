// src/composables/useTags.js
import { useApi } from './useApi.js'
import { tagService } from '@/services/tags.js'

export function useTags() {
  const { loading, execute } = useApi()

  const getAll = () => execute(() => tagService.getAll())

  const create = (data) => execute(() => tagService.create(data), 'Tag créé !')

  const update = (id, data) => execute(() => tagService.update(id, data), 'Tag mis à jour !')

  const deleteTag = (id) => execute(() => tagService.delete(id), 'Tag supprimé !')

  return { loading, getAll, create, update, deleteTag }
}
