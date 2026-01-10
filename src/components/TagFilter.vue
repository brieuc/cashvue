<template>
  <SelectedTag :tags="selectedTags"></SelectedTag>
  <TagSelection @toggle="handleToggle"></TagSelection>
</template>

<script setup lang="ts">
import type { TagDto } from '@/api/generated';
import SelectedTag from './SelectedTag.vue';
import TagSelection from './TagSelection.vue';
import { ref } from 'vue';


const selectedTags = defineModel({ required: true, type: Array<TagDto>, default: () => [] })


const handleToggle = (tags : Array<TagDto>) => { // no need for async for now
  selectedTags.value = tags;
}
</script>
