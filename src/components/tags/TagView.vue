<template>
<div class="tag-title">
  <img class="tag-icon" :src="`${uploadsUrl}/${tag.icon}`" />
  <h3>{{ tag.title }}</h3>
</div>
<div>
  <span style="color:cadetblue;">{{ tag.description }}</span>
</div>
</template>

<script setup lang="ts">
import type { TagDto } from '@/api/generated';

const uploadsUrl = import.meta.env.VITE_UPLOADS_URL;

interface props {
  tag: TagDto
}

const { tag } = defineProps<props>();
</script>

<style scoped>
.tag-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: contain;
}
</style>
