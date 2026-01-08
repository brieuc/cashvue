import type { Ref } from 'vue'
import type { EntryDto, TagDto } from '@/api/generated'

/**
 * Request payload for creating a new entry
 * Omits auto-generated fields (id, modificationDate)
 */
export interface CreateEntryRequest {
  accountingDate: string
  title: string
  description?: string
  amount: number | null
  currencyCode: string
  tags?: TagDto[]
}

/**
 * Request payload for updating an existing entry
 * All fields are optional for partial updates
 */
export interface UpdateEntryRequest {
  accountingDate?: string
  title?: string
  description?: string
  amount?: number
  currencyCode?: string
  tags?: TagDto[]
}

/**
 * Return type for the useEntries composable
 */
export interface UseEntriesReturn {
  entries: Ref<EntryDto[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchEntries: (params: any) => Promise<void>
  createEntry?: (data: CreateEntryRequest) => Promise<void>
  updateEntry?: (id: number, data: UpdateEntryRequest) => Promise<void>
  deleteEntry?: (id: number) => Promise<void>
}
