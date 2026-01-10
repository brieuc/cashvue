<template>
  <div class="app-layout">
    <!-- Period en haut fixe -->
    <div class="period-bar">
      <PeriodSelection @select="handleSelectPeriod" />
    </div>

    <!-- Liste au milieu scrollable -->
    <div class="entry-content">
      <EntryList
        :filtering-tags="selectedTags"
        :start-date="startDate"
        :end-date="endDate"
      />
    </div>

    <!-- Tags en bas fixe -->
    <div class="tag-bar">
      <TagFilter v-model="selectedTags" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type TagDto, type PeriodDto } from '@/api/generated';
import EntryList from '@/components/EntryList.vue';
import PeriodSelection from '@/components/PeriodSelection.vue';
import TagFilter from '@/components/TagFilter.vue';
import { ref } from 'vue';

const selectedTags = ref<Array<TagDto>>([]);
const startDate = ref<string>("1900-01-01");
const endDate = ref<string>("2100-12-31");

const handleSelectPeriod = (period: PeriodDto) => {
  startDate.value = period.startDate;
  endDate.value = period.endDate;
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.period-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid #e1e8ed;
  padding: 0.75rem;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.entry-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 1rem;
}

.tag-bar {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background: white;
  border-top: 1px solid #e1e8ed;
  padding: 0.75rem;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

/* Scroll horizontal sans barre visible */
.period-bar::-webkit-scrollbar,
.tag-bar::-webkit-scrollbar {
  height: 4px;
}

.period-bar::-webkit-scrollbar-thumb,
.tag-bar::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}
</style>
