// src/services/tags.ts
import { api } from './api'
import type { Tag, CreateTagRequest, UpdateTagRequest } from '@/types/types'

export const tagService = {
  async getAll(): Promise<Tag[]> {
    return api.get<Tag[]>('/tags')
  },
  async create(data: CreateTagRequest): Promise<Tag> {
    return api.post<Tag>('/tags', data)
  },
  async update(id: string, data: UpdateTagRequest): Promise<Tag> {
    return api.put<Tag>(`/tags/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/tags/${id}`)
  },
}
