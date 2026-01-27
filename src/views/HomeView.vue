<template>
  <div class="app-layout">
    <!-- Period en haut fixe -->
    <div class="period-bar">
      <PeriodSelection v-model="selectedPeriod" />
    </div>

    <div class="header-bar">
      <HeaderView :selected-period="selectedPeriod" :selected-tags="selectedTags" :entries-updated="entriesChanged"></HeaderView>
    </div>
    <!-- Liste au milieu scrollable -->
    <div class="entry-content">
      <EntryList
        :filtering-tags="selectedTags"
        :start-date="startDate"
        :end-date="endDate"
        @entries-changed="entriesChanged++"
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
import HeaderView from '@/components/HeaderView.vue';
import PeriodSelection from '@/components/PeriodSelection.vue';
import TagFilter from '@/components/TagFilter.vue';
import { ref, watch } from 'vue';


const selectedTags = ref<Array<TagDto>>([]);
const selectedPeriod = ref<PeriodDto | undefined>();

const startDate = ref<string>("2000-01-01");
const endDate = ref<string>("2000-01-01");

const entriesChanged = ref<number>(0);

watch(selectedPeriod, (newPeriod) => {
  if (!newPeriod)
    return;
  console.log("HomeView newPeriod " + JSON.stringify(newPeriod));
  startDate.value = newPeriod.startDate;
  endDate.value = newPeriod!.endDate;
});

/*
const handleSelectPeriod = (period: PeriodDto) => {
  startDate.value = period.startDate;
  endDate.value = period.endDate;
}
*/

</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: hidden;
}

.period-bar {
  flex-shrink: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid #e1e8ed;
  padding: 0.75rem;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.header-bar {
  border-bottom: 1px solid #e1e8ed;
}

.entry-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 1rem;
  min-height: 0;
}

.tag-bar {
  flex-shrink: 0;
  z-index: 10;
  background: white;
  border-top: 1px solid #e1e8ed;
  /*padding: 0.75rem;*/
  padding-top: 0.25rem;
  max-height: 200px;
  display: flex;
  flex-direction: column;
}

/* Scroll horizontal sans barre visible */
.period-bar::-webkit-scrollbar {
  height: 4px;
}

.period-bar::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}
</style>
