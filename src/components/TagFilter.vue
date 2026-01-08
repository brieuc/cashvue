<template>
  <SelectedTag :tags="selectedTags"></SelectedTag>
  <TagSelection @toggle="handleToggle"></TagSelection>
</template>

<script setup lang="ts">
import type { TagDto } from '@/api/generated';
import SelectedTag from './SelectedTag.vue';
import TagSelection from './TagSelection.vue';
import { ref } from 'vue';

const selectedTags = ref<TagDto[]>([]);
const emit = defineEmits<{
    toggle: [Array<TagDto>]
  }>();


const handleToggle = (tags : Array<TagDto>) => { // no need for async for now
  selectedTags.value = tags;
  console.log("tag filter : " + selectedTags.value);
  emit('toggle', selectedTags.value);
}
</script>
