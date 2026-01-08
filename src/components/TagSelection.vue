<template>
<div>
    <button v-for="tag in availableTags" :key="tag.id" type="button" @click="toggleTag(tag)"
      :class="['tag-btn', { active: selectedTags?.some(t => t.id === tag.id) }]">
      {{ tag.title }}
    </button>
</div>
</template>

<script setup lang="ts">
import { type TagDto } from '@/api/generated';
import { reactive, ref, onMounted, computed } from 'vue';
import { useTags } from '@/composables/useTags';
import type { CreateEntryRequest } from '@/types/types';

const emit = defineEmits<{
  toggle: [data: Array<TagDto>]
}>()

const {fetchTags, tags} = useTags();

const availableTags = computed(() => tags.value);
const selectedTags = ref<TagDto[]>([]);

/*
const form : CreateEntryRequest = reactive({
  title: '',
  description: '',
  amount: null as number | null,
  currencyCode: 'CHF',
  accountingDate: new Date().toISOString().slice(0, 16),
  tags: [] as Array<{ id: number; title: string }>
})
  */

const toggleTag = (selectedTag: TagDto | undefined) => {
  console.log("toggleTag called with:", selectedTag);
  if (!selectedTag)
    return;
  // We're looking for the tag first in the selected tag to unselect it
  const index = selectedTags.value.findIndex((tag) => tag.id === selectedTag.id)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    // then we add it if it was not present.
    const tag = availableTags.value?.find((t) => t.id === selectedTag.id)
    if (tag) {
      selectedTags.value.push({ id: tag.id, title: tag.title })
    }
  }

  emit('toggle', selectedTags.value);
  console.log("Event emitted with:", selectedTags.value);
}


const loadTags = () => {
  fetchTags();
}

onMounted(() => {
  loadTags()
})

</script>

<style>
.tag-btn:hover {
  background: #dfe6e9;
}

.tag-btn.active {
  background: #3498db;
  color: white;
  border-color: #2980b9;
}
</style>
