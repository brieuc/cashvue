<template>
  <div class="entries">
    <p v-if="!entries?.length" class="empty">Aucune dépense</p>
    <div v-else class="list">
      <div v-for="entry in filteredSortedEntries" :key="entry.id" class="card" @click="selectEntry(entry)"
        :class="{ 'highlight': highlightedEntryId === entry.id, 'future': isFuture(entry.accountingDate) }" :data-entry-id="entry.id">
        <EntryView :entry="entry"
          @duplicate="handleDuplicate"
          @duplicate-to-now="handleDuplicateToNow"
          @delete="handleDelete">
        </EntryView>
      </div>
    </div>
    <div v-if="hasMorePage" class="load-more">
      <button class="load-more-btn" @click="loadNextPage">Load next page</button>
    </div>

    <div class="fab-wrapper">
      <button class="add-btn" @click="isModalOpen = true, selectedEntry = null">+</button>
    </div>

    <EntryModal :is-open="isModalOpen" :entry="selectedEntry" @close="isModalOpen = false" @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect, nextTick } from 'vue'
import { useEntries } from '@/composables/useEntries'
import EntryModal from './EntryModal.vue'
//import { createEntry, type EntryDto, type getEntries, type GetEntriesParams } from '@/api/generated'
import type { EntryDto, GetEntriesParams, TagDto } from '@/api/generated'
import EntryView from './EntryView.vue'

const { entries, currentPage, error, fetchEntries, addEntry, editEntry, removeEntry } = useEntries()
//const entries = ref<Entry[]>([])
const isModalOpen = ref(false)
const selectedEntry = ref<EntryDto | null>(null);
const highlightedEntryId = ref<number | null>(null);
const hasMorePage = ref(false);
const paginationSize = 100;

const emit = defineEmits<{
    entriesChanged : [];
}>();

const { tags, startDate, endDate, searchText, filteringCurrency } = defineProps<{
  tags: TagDto[];
  startDate: string,
  endDate: string,
  searchText: string,
  filteringCurrency: string // not for the request, only to filter the current entries
}>();

const isFuture = (date: string) => new Date(date).getTime() > Date.now();

const isInCurrentPeriod = (date: string) => {
    const entryDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return entryDate >= start && entryDate <= end;
};

// Useful to sort the inserted entries, besides fetching sorted entries from the back-end
const filteredSortedEntries = computed(() => {
  if (!entries.value) return []
  const sortedEntries = [...entries.value].sort((a, b) => {
    return new Date(b.accountingDate).getTime() - new Date(a.accountingDate).getTime()
  });
  if (filteringCurrency)
    return sortedEntries.filter(e => e.currencyCode == filteringCurrency)
  return sortedEntries;
})

const selectEntry = async (entry: EntryDto) => {
  selectedEntry.value = entry;
  isModalOpen.value = true;
};

const loadEntries = async () => {
  // Faire une gestion des pages
  const params: GetEntriesParams = {
      startDate: startDate,
      endDate: endDate,
      tagIds: tags.map(tagDto => tagDto.id!),
      searchText: searchText,
      page: 0,
      size: paginationSize,
      sort: ["accountingDate:desc"]
  };

  await fetchEntries(params, true);

  // size : 100 // number of elements asked
  // number : 2 // page asked (from 0)
  // totalElements : 10 // total nb of elements
  // totalPages : 1 // total number of pages
}

watch(entries, (newEntries) => {
  console.log("watch entries")
  const totalElements = currentPage.value?.totalElements;
  if (totalElements != null && newEntries.length < totalElements) {
    hasMorePage.value = true;
    console.log("has more page")
  }
  else {
    hasMorePage.value = false;
  }
}, {immediate : true});

watchEffect(async() => {
  // depuis vue 3.5, le compuilateur destruture les props en ref. Toutes les refs
  // qui sont lues (tags, startDate, endDate) dans la méthode déclenche le reload
  loadEntries();
})

const loadNextPage = async () => {
  const nextPage = (currentPage.value?.number ?? 0) + 1;

  const params: GetEntriesParams = {
      startDate: startDate,
      endDate: endDate,
      tagIds: tags.map(tagDto => tagDto.id!),
      searchText: searchText,
      page: nextPage,
      size: paginationSize,
      sort: ["accountingDate:desc"]
  };

  await fetchEntries(params, false);
};

/*
watch(tags, (newValue) => {
  console.log("entry list new tags : " + newValue);
});
*/

const scrollToAndHighlight = (entryId: number) => {
  // Trouver l'élément DOM
  const card = document.querySelector(`[data-entry-id="${entryId}"]`);

  if (card) {
    card.scrollIntoView({ behavior: 'instant', block: 'center' });

    // Attendre la fin du scroll avant de highlighter
    setTimeout(() => {
      highlightedEntryId.value = entryId;
      setTimeout(() => highlightedEntryId.value = null, 1500);
    }, 300);
  }
};

const persistNewEntry = (formData: EntryDto) => {
  return addEntry(formData).then(response => {
    if (response.status === 201) {
      emit("entriesChanged");
      // loadEntries() we can just add the entry at the beginning of the array
      // it works only if the new entry should be in that list
      // We could be in a period which doesn't concern the entry. In that case,
      // we don't want to reload the list. If the entry should be in the period,
      // for the moment we reload
      //if (new Date(formData.accountingDate).
      //loadEntries()
      const newEntry = response.data;

      if (isInCurrentPeriod(newEntry.accountingDate)) {
        // Ajouter localement
        entries.value?.push(newEntry);

        // Attendre le prochain rendu puis scroller + highlight
        nextTick(() => {
          scrollToAndHighlight(newEntry.id);
        });
      } else {
        // Optionnel : afficher un message "Entrée créée mais hors période"
      }
    }
    return response
  })
}

const handleSubmit = async (formData: EntryDto) => {

  console.log("handleSubmit" + JSON.stringify(formData));
  if (selectedEntry.value) {
    formData.id = selectedEntry.value.id;
    editEntry(selectedEntry.value.id!, formData).then(response => {
      if (response.status === 200) {
        emit("entriesChanged");
        isModalOpen.value = false
        // loadEntries() we don't want to reload the entire list
        const index = entries.value.findIndex(entry => entry.id === selectedEntry.value?.id);
        if (index != -1) {
          entries.value[index] = { ...selectedEntry.value, ...formData};
          highlightedEntryId.value = selectedEntry.value?.id ?? null;
          setTimeout(() => highlightedEntryId.value = null, 1500);
        }
      }
    })
  }
  else {
    persistNewEntry(formData).then(response => {
      if (response.status === 201) {
        isModalOpen.value = false
      }
    })
  }
};

const handleDuplicate = (entry: EntryDto) => {
  const { id, modificationDate, ...rest } = entry;
  persistNewEntry(rest);
};

const handleDuplicateToNow = (entry: EntryDto) => {
  const { id, modificationDate, ...rest } = entry;
  persistNewEntry({ ...rest, accountingDate: new Date().toISOString() });
};

const handleDelete = (entry: EntryDto) => {
  removeEntry(entry.id!).then(response => {
    if (response.status === 204) {
      emit("entriesChanged");
      const index = entries.value.findIndex(e => e.id === entry.id);
      if (index != -1) {
        entries.value.splice(index, 1);
      }
    }
  });
};

  /*
  const response = await createEntry(formData)
  if (response.status === 201) {
    isModalOpen.value = false
    loadEntries()
  }
  */

onMounted(() => {
  loadEntries()
})
</script>

<style scoped>
.entries {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  margin: 0 auto;
  padding: 0.75rem;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}
.fab-wrapper {
  position: sticky;
  bottom: 0.25rem;
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  padding-right: 0.25rem;
  pointer-events: none;
}
.add-btn {
  pointer-events: auto;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  transition: background 0.2s;
}
.add-btn:hover {
  background: #2980b9;
}
.empty {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}
.list {
  display: grid;
  gap: 0.4rem;
  grid-template-columns: 1fr;
}

.card {
  background: #fff;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.card.highlight {
  animation: flash 1.5s ease-out;
}

.card.future {
  background: #d6e9f8;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 0.75rem;
}

.load-more-btn {
  padding: 0.5rem 1.25rem;
  border: 1px solid #d6e9f8;
  border-radius: 6px;
  background: transparent;
  color: #5dade2;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.load-more-btn:hover {
  background: #f0f8ff;
  border-color: #aed6f1;
}

@keyframes flash {
  0%, 100% { background: #fff; }
  25% { background: #d4edda; }
  50% { background: #fff; }
  75% { background: #d4edda; }
}
</style>
