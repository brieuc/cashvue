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

/* Hauteur fixe (et non min-height) : identique avec ou sans tag.
   Le centrage flex remplace le padding vertical et supprime l'espace
   ajouté sous les puces par la ligne de base (line-height du body). */
.selected-tags-sticky {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 2.6rem;
  padding: 0 1.25rem;
  border-bottom: 1px solid #e1e8ed;
  background: white;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  box-sizing: border-box;
}

.selected-tags-sticky :deep(.selected-tag-btn) {
  flex-shrink: 0;
}

.tag-selection-scrollable {
  flex: 1;
  overflow-x: auto;
  overflow-y: visible;
  padding: 0.5rem 1.25rem;
  min-height: 40px;
}

.tag-selection-scrollable::-webkit-scrollbar {
  display: none;
}

.tag-selection-scrollable :deep(.tag-list) {
  display: grid;
  grid-template-rows: repeat(2, auto);
  grid-auto-flow: column;
  gap: 0.25rem;
}

.selected-tags-sticky::-webkit-scrollbar,
.tag-selection-scrollable::-webkit-scrollbar {
  display: none;
}
</style>
