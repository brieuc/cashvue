<template>
<button
  v-for="tag in tags"
  :key="tag.id"
  @click="$emit('remove', tag)"
  class="excluded-tag-btn"
  type="button"
>
<img class="tag-icon" :src="`${uploadsUrl}/${tag!.icon}`"/><span class="tag-title">{{ tag.title }}</span> ×
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

.tag-title {
  text-decoration: line-through;
}

.excluded-tag-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.6rem;
  background: #e57373;
  color: white;
  border: 1px solid #e57373;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-right: 0.4rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.excluded-tag-btn:hover {
  background: #c0392b;
  border-color: #922b21;
}
</style>
