<template>
  <div class="tag-filter">
    <div class="selected-tags-sticky">
      <SelectedTag :tags="selectedTags" @remove="handleRemove"></SelectedTag>
    </div>
    <div class="tag-selection-scrollable">
      <TagSelection :selected-tags="selectedTags" @toggle="handleToggle"></TagSelection>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TagDto } from '@/api/generated';
import SelectedTag from './SelectedTag.vue';
import TagSelection from './TagSelection.vue';

const selectedTags = defineModel({ required: true, type: Array<TagDto>, default: () => [] })

const handleToggle = (tags : Array<TagDto>) => {
  selectedTags.value = tags;
}

const handleRemove = (tagToRemove: TagDto) => {
  selectedTags.value = selectedTags.value.filter(tag => tag.id !== tagToRemove.id);
}
</script>

<style scoped>
.tag-filter {
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.selected-tags-sticky {
  flex-shrink: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e1e8ed;
  background: white;
  height: 2rem;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.tag-selection-scrollable {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  padding-top: 0.5rem;
  margin-bottom: 50px; /* Ajouter cette ligne */
  min-height: 40px;
}

.selected-tags-sticky::-webkit-scrollbar,
.tag-selection-scrollable::-webkit-scrollbar {
  display: none;
}
</style>
