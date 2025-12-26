// src/composables/useTags.ts
import { useApi } from './useApi'
import { tagService } from '@/services/tags'
import type { UseTagsReturn, CreateTagRequest, UpdateTagRequest } from '@/types'

export function useTags(): UseTagsReturn {
  const { loading, execute } = useApi()

  const getAll = () => execute(() => tagService.getAll())

  const create = (data: CreateTagRequest) => execute(() => tagService.create(data), 'Tag créé !')

  const update = (id: string, data: UpdateTagRequest) =>
    execute(() => tagService.update(id, data), 'Tag mis à jour !')

  const deleteTag = (id: string) => execute(() => tagService.delete(id), 'Tag supprimé !')

  return { loading, getAll, create, update, deleteTag }
}
