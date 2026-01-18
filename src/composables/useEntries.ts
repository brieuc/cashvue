import { ref } from 'vue';
import { createEntry, getEntries, updateEntry } from '@/api/generated';
import type { EntryDto, GetEntriesParams } from '@/api/generated';

export function useEntries() {
  const entries = ref<EntryDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchEntries = async (params : GetEntriesParams) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getEntries(params);
      entries.value = (response.data.content as EntryDto[]) || [];
    } catch (e) {
      error.value = 'Erreur lors du chargement ' + e;
    } finally {
      loading.value = false;
    }
  };

  const addEntry = async (entry : EntryDto) => {
    return createEntry(entry);
  };

  const editEntry = async(id : number,  entry : EntryDto) => {
    return updateEntry(id, entry)
  };

  return { entries, loading, error, fetchEntries, addEntry, editEntry };
}
