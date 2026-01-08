<template>
  <div class="entries">
    <div class="header-bar">
      <h2>Mes Dépenses</h2>
      <button class="add-btn" @click="isModalOpen = true">+</button>
    </div>
    <p v-if="loading" class="empty">Chargement...</p>
    <p v-else-if="!entries?.length" class="empty">Aucune dépense</p>
    <div v-else class="list">
      <div v-for="entry in sortedEntries" :key="entry.id" class="card">
        <div class="card-layout">
          <div class="card-left">
            <h3>{{ entry.title }}</h3>
            <p v-if="entry.description" class="desc">{{ entry.description }}</p>
          </div>
          <div class="card-right">
            <span class="date">{{ formatDate(entry.accountingDate) }}</span>
            <div class="amount-line">
              <span class="amount">{{ entry.amount }}</span>
              <span class="currency">{{ entry.currencyCode }}</span>
            </div>
          </div>
        </div>
        <div v-if="entry.tags?.length" class="tags">
          <span v-for="tag in entry.tags" :key="tag.id" class="tag">#{{ tag.title }}</span>
        </div>
      </div>
    </div>

    <EntryModal :is-open="isModalOpen" @close="isModalOpen = false" @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect } from 'vue'
import { useEntries } from '@/composables/useEntries'
import EntryModal from './EntryModal.vue'
//import { createEntry, type EntryDto, type getEntries, type GetEntriesParams } from '@/api/generated'
import { createEntry } from '@/api/generated'
import type { EntryDto, GetEntriesParams, TagDto } from '@/api/generated'

const { entries, loading, error, fetchEntries } = useEntries()
//const entries = ref<Entry[]>([])
const isModalOpen = ref(false)

const { filteringTags, startDate, endDate } = defineProps<{
  filteringTags: TagDto[];
  startDate: string,
  endDate: string
}>();

const sortedEntries = computed(() => {
  if (!entries.value) return []
  return [...entries.value].sort((a, b) => {
    return new Date(b.accountingDate).getTime() - new Date(a.accountingDate).getTime()
  })
})

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const loadEntries = async () => {
  console.log("loadEntries");
  const params: GetEntriesParams = {
      startDate: startDate.split('T')[0],
      endDate: endDate.split('T')[0],
      tagIds: filteringTags.map(tagDto => tagDto.id!),
      page: 0,
      size: 20
  };
  await fetchEntries(params)
  console.log(entries.value);
}

watchEffect(async() => {
  // runs only once before 3.5
  // re-runs when the "foo" prop changes in 3.5+
  console.log("entry list new tags : " + filteringTags);
  console.log("period startDate : " + startDate + " endDate : " + endDate);
  loadEntries();
})
/*
watch(filteringTags, (newValue) => {
  console.log("entry list new tags : " + newValue);
});
*/

const handleSubmit = async (formData: EntryDto) => {
  const response = await createEntry(formData)
  if (response.status === 201) {
    isModalOpen.value = false
    console.log(response.data);
    loadEntries()
  }
}

onMounted(() => {
  loadEntries()
})
</script>

<style scoped>
.entries {
  max-width: 1200px;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
.card {
  background: #fff;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
  transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.card-layout {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.card-left {
  flex: 1;
}
.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}
h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}
.date {
  font-size: 0.85rem;
  color: #7f8c8d;
}
.desc {
  font-size: 0.9rem;
  color: #5a6c7d;
  margin: 0;
}
.amount-line {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}
.amount {
  font-weight: 600;
  font-size: 1.25rem;
  color: #2c3e50;
}
.currency {
  font-weight: 600;
  color: #27ae60;
  font-size: 1rem;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}
.tag {
  padding: 0.2rem 0.6rem;
  background: #ecf0f1;
  color: #34495e;
  border-radius: 12px;
  font-size: 0.8rem;
}
</style>
