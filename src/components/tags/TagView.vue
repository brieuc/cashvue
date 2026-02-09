<template>
<div>
  <h3>{{ tag.title }}</h3>
</div>
<div>
  <span style="color:cadetblue;">{{ tag.description }}</span>
</div>
</template>

<script setup lang="ts">
import type { TagDto } from '@/api/generated';

interface props {
  tag: TagDto
}

const { tag } = defineProps<props>();
</script>
