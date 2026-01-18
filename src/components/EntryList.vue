<template>
  <div class="entries">
    <div class="header-bar">
      <h2>Mes Dépenses</h2>
      <button class="add-btn" @click="isModalOpen = true, selectedEntry = null">+</button>
    </div>
    <p v-if="loading" class="empty"></p>
    <p v-else-if="!entries?.length" class="empty">Aucune dépense</p>
    <div v-else class="list">
      <div v-for="entry in sortedEntries" :key="entry.id" class="card" @click="selectEntry(entry)"
        :class="{ 'highlight': highlightedEntryId === entry.id }" :data-entry-id="entry.id">
        <EntryView :entry="entry"></EntryView>
      </div>
    </div>

    <EntryModal :is-open="isModalOpen" :entry="selectedEntry" @close="isModalOpen = false" @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect, nextTick } from 'vue'
import { useEntries } from '@/composables/useEntries'
import EntryModal from './EntryModal.vue'
//import { createEntry, type EntryDto, type getEntries, type GetEntriesParams } from '@/api/generated'
import { createEntry } from '@/api/generated'
import type { EntryDto, GetEntriesParams, TagDto } from '@/api/generated'
import EntryView from './EntryView.vue'

const { entries, loading, error, fetchEntries, addEntry, editEntry } = useEntries()
//const entries = ref<Entry[]>([])
const isModalOpen = ref(false)
const selectedEntry = ref<EntryDto | null>(null);
const highlightedEntryId = ref<number | null>(null);

const { filteringTags, startDate, endDate } = defineProps<{
  filteringTags: TagDto[];
  startDate: string,
  endDate: string
}>();

const isInCurrentPeriod = (date: string) => {
    const entryDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return entryDate >= start && entryDate <= end;
};


const sortedEntries = computed(() => {
  if (!entries.value) return []
  return [...entries.value].sort((a, b) => {
    return new Date(b.accountingDate).getTime() - new Date(a.accountingDate).getTime()
  })
})

const selectEntry = async (entry: EntryDto) => {
  selectedEntry.value = entry;
  isModalOpen.value = true;
};

const loadEntries = async () => {
  const params: GetEntriesParams = {
      startDate: startDate.split('T')[0],
      endDate: endDate.split('T')[0],
      tagIds: filteringTags.map(tagDto => tagDto.id!),
      page: 0,
      size: 300
  };
  await fetchEntries(params)
}

watchEffect(async() => {
  // runs only once before 3.5
  // re-runs when the "foo" prop changes in 3.5+
  //console.log("entry list new tags : " + filteringTags);
  //console.log("period startDate : " + startDate + " endDate : " + endDate);
  loadEntries();
})
/*
watch(filteringTags, (newValue) => {
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

const handleSubmit = async (formData: EntryDto) => {

  console.log("handleSubmit" + JSON.stringify(formData));
  if (selectedEntry.value) {
    formData.id = selectedEntry.value.id;
    editEntry(selectedEntry.value.id!, formData).then(response => {
      if (response.status === 200) {
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
    addEntry(formData).then(response => {
      if (response.status === 201) {
        isModalOpen.value = false
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
    })
  }
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
  margin: 0 auto;
  padding: 1.5rem;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
h2 {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}
.add-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
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
  gap: 1rem;
  grid-template-columns: 1fr;
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

@keyframes flash {
  0%, 100% { background: #fff; }
  25% { background: #d4edda; }
  50% { background: #fff; }
  75% { background: #d4edda; }
}
</style>
