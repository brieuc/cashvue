import { ref } from 'vue';
import { getEntries } from '@/api/generated';
import type { EntryDto, GetEntriesParams } from '@/api/generated';

export function useEntries() {
  const entries = ref<EntryDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchEntries = async (params : GetEntriesParams) => {
    loading.value = true;
    error.value = null;
    try {
      console.log("params " + JSON.stringify(params));
      const response = await getEntries(params);
      entries.value = (response.data.content as EntryDto[]) || [];
      //console.log("response.data" + JSON.stringify(response.data.content));
      //entries.value = [{accountingDate: new Date(), amount: 99.99, title: "super totre", currencyCode: "CHF"}];
    } catch (e) {
      error.value = 'Erreur lors du chargement ' + e;
    } finally {
      loading.value = false;
    }
  };

  return { entries, loading, error, fetchEntries };
}
