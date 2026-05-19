<template>
  <div class="entry-filter">
    <div class="selected-tags-sticky">
      <SelectedTag :tags="tags" @remove="handleRemove" />
    </div>
    <div class="tag-selection-scrollable" :class="{ 'search-active': expanded }">
      <template v-if="!expanded">
        <button class="search-toggle" :class="{ active: searchText.length > 0 }" @click="expanded = true">
          <span class="icon">&#128269;</span>
          <span v-if="searchText.length > 0" class="badge"></span>
        </button>
        <TagSelection :selected-tags="tags" @toggle="handleToggle" />
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
import TagSelection from './TagSelection.vue'
import TextFilter from './TextFilter.vue'

const tags = defineModel<TagDto[]>('tags', { default: () => [] })
const searchText = defineModel<string>('searchText', { default: '' })

const expanded = ref(false)

const handleToggle = (newTags: TagDto[]) => {
  tags.value = newTags
}

const handleRemove = (tagToRemove: TagDto) => {
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
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.tag-selection-scrollable {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  padding-top: 0.5rem;
  margin-bottom: 50px;
  min-height: 40px;
}
.tag-selection-scrollable.search-active {
  margin-bottom: 0;
}n

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
