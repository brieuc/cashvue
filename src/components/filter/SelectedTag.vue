<template>
<button
  v-for="tag in tags"
  :key="tag.id"
  @click="$emit('remove', tag)"
  class="selected-tag-btn"
  type="button"
>
<img class="tag-icon" :src="`${uploadsUrl}/${tag!.icon}`"/>{{ tag.title }} ×
</button>
</template>

<script setup lang="ts">
import type { TagDto } from '@/api/generated';
const uploadsUrl = import.meta.env.VITE_UPLOADS_URL;

interface Props {
  tags: Array<TagDto>
}

defineProps<Props>();

defineEmits<{
  remove: [tag: TagDto]
}>();
</script>

<style scoped>

.tag-icon {
    margin-right: 0.3rem;
    border-radius: 3px;
    width: 16px;
    height: 16px;
    object-fit: contain;
}

.selected-tag-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.6rem;
  background: #3498db;
  color: white;
  border: 1px solid #2980b9;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-right: 0.4rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.selected-tag-btn:hover {
  background: #2980b9;
  border-color: #21618c;
}
</style>
