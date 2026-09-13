import { ref } from 'vue';
import { createEntry, createBatch, getEntries, updateEntry } from '@/api/generated';
import type { EntryDto, GetEntriesParams, PageMetadata } from '@/api/generated';

export function useEntries() {
  const entries = ref<EntryDto[]>([]);
  const error = ref<string | null>(null);
  const currentPage = ref<PageMetadata>();

  const fetchEntries = async (params : GetEntriesParams, reload : boolean) => {
    error.value = null;
    try {
      const response = await getEntries(params);
      const content = response.data.content ?? [];
      currentPage.value = response.data.page;
      if (reload) {
        entries.value = content;
      } else {
        entries.value = entries.value.concat(content);
      }
    } catch (e) {
      error.value = 'Erreur lors du chargement ' + e;
    }
  };

  const addEntry = async (entry : EntryDto) => {
    return createEntry(entry);
  };

  const editEntry = async(id : number,  entry : EntryDto) => {
    return updateEntry(id, entry)
  };

  const addEntries = async (batch: EntryDto[]) => {
    return createBatch(batch);
  };

  return { entries, currentPage, error, fetchEntries, addEntry, addEntries, editEntry };
}
