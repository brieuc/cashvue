<template>
  <div class="entry-filter">
    <div class="selected-tags-sticky">
      <button class="mode-toggle" :class="{ excluding }" @click="excluding = !excluding">
        {{ excluding ? 'Exclus' : 'Inclus' }}
      </button>
      <ExcludedTag v-if="excluding" :tags="excludedTags" @remove="handleRemove" />
      <SelectedTag v-else :tags="tags" @remove="handleRemove" />
    </div>
    <div class="tag-selection-scrollable" :class="{ 'search-active': expanded }">
      <template v-if="!expanded">
        <button class="search-toggle" :class="{ active: searchText.length > 0 }" @click="expanded = true">
          <span class="icon">&#128269;</span>
          <span v-if="searchText.length > 0" class="badge"></span>
        </button>
        <TagSelection :selected-tags="excluding ? excludedTags : tags" @toggle="handleToggle" />
      </template>
      <template v-else>
        <button class="search-toggle active" @click="expanded = false">
          <span class="icon">&#128269;</span>
        </button>
        <TextFilter v-model="searchText" />
        <button class="close-btn" @click="expanded = false">&times;</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TagDto } from '@/api/generated'
import SelectedTag from './SelectedTag.vue'
import ExcludedTag from './ExcludedTag.vue'
import TagSelection from './TagSelection.vue'
import TextFilter from './TextFilter.vue'

const tags = defineModel<TagDto[]>('tags', { default: () => [] })
const excludedTags = defineModel<TagDto[]>('excludedTags', { default: () => [] })
const searchText = defineModel<string>('searchText', { default: '' })

const expanded = ref(false)
const excluding = ref(false)

// Un tag ne peut pas être à la fois sélectionné et exclu : on le retire de l'autre liste.
const handleToggle = (newTags: TagDto[]) => {
  const ids = new Set(newTags.map(tag => tag.id))
  if (excluding.value) {
    excludedTags.value = newTags
    if (tags.value.some(tag => ids.has(tag.id)))
      tags.value = tags.value.filter(tag => !ids.has(tag.id))
  } else {
    tags.value = newTags
    if (excludedTags.value.some(tag => ids.has(tag.id)))
      excludedTags.value = excludedTags.value.filter(tag => !ids.has(tag.id))
  }
}

const handleRemove = (tagToRemove: TagDto) => {
  if (excluding.value)
    excludedTags.value = excludedTags.value.filter(tag => tag.id !== tagToRemove.id)
  else
    tags.value = tags.value.filter(tag => tag.id !== tagToRemove.id)
}
</script>

<style scoped>
.entry-filter {
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
  display: flex;
  align-items: flex-start;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.tag-selection-scrollable {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  overflow-x: auto;
  overflow-y: visible;
  white-space: nowrap;
  height: 80px;
  padding-top: 0.25rem;
}

.selected-tags-sticky::-webkit-scrollbar,
.tag-selection-scrollable::-webkit-scrollbar {
  display: none;
}


.search-toggle {
  position: relative;
  width: 52px;
  height: 32px;
  border-radius: 16px;
  margin-left: 4px;
  border: 1px solid #e1e8ed;
  background: #f5f5f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
  padding: 0;
}

.search-toggle.active {
  background: #ebf5fb;
  border-color: #3498db;
}

.mode-toggle {
  position: sticky;
  left: 0;
  z-index: 1;
  padding: 0.3rem 0.6rem;
  flex-shrink: 0;
  margin-right: 0.4rem;
  border-radius: 12px;
  border: 1px solid #e1e8ed;
  background: #f5f5f5;
  color: #555;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
  outline: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.mode-toggle.excluding {
  color: #c0392b;
  border-color: #e57373;
  background: #fdecea;
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e74c3c;
  border: 2px solid white;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #e1e8ed;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
}
</style>
