<template>
<span v-for="tag in tags" v-bind:key="tag.id">{{ tag.title }}&nbsp</span>
</template>

<script setup lang="ts">
import type { TagDto } from '@/api/generated';


interface Props {
  tags: Array<TagDto>
}

defineProps<Props>();

</script>
