<template>
<div class="tag-list">
    <button v-for="tag in availableTags" :key="tag.id" type="button" @click="toggleTag(tag)"
      :class="['tag-btn', { active: selectedTags?.some(t => t.id === tag.id) }]">
      <img :src="`${uploadsUrl}/${tag.icon}`" :alt="tag.title" class="tag-icon" />
    </button>
</div>
</template>

<script setup lang="ts">
import { type GetTagsParams, type TagDto } from '@/api/generated';

const uploadsUrl = import.meta.env.VITE_UPLOADS_URL;
import { onMounted, computed, toRaw } from 'vue';
import { useTags } from '@/composables/useTags';

interface Props {
  selectedTags: Array<TagDto>
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [data: Array<TagDto>]
}>()

const {fetchTags, tags} = useTags();

const availableTags = computed(() => tags.value.filter(t => !t.hidden));

const toggleTag = (selectedTag: TagDto | undefined) => {
  if (!selectedTag)
    return;

  const newSelectedTags = [...props.selectedTags];
  const index = newSelectedTags.findIndex((tag) => tag.id === selectedTag.id)

  if (index > -1) {
    newSelectedTags.splice(index, 1)
  } else {
    const tag = availableTags.value?.find((t) => t.id === selectedTag.id)
    if (tag) {
      newSelectedTags.push( {...toRaw(tag)} )
    }
  }

  emit('toggle', newSelectedTags);
}


const loadTags = () => {
  const params: GetTagsParams = {
    size: 1000,
    sort: ["sortingOrder:asc"]
  }
  fetchTags(params);
}

onMounted(() => {
  loadTags()
})

</script>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.25rem;
}

.tag-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
}

.tag-btn.active .tag-icon {
  filter: drop-shadow(0 0 4px #3b82f6) drop-shadow(0 0 8px #93c5fd);
}

.tag-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  display: block;
}
</style>

