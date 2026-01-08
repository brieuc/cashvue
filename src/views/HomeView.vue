

<template>
  <PeriodSelection @select="handleSelectPeriod"></PeriodSelection>
  <EntryList :filtering-tags="selectedTags" :start-date="startDate" :end-date="endDate"/>
  <TagFilter @toggle="handleToggleTag"></TagFilter>
</template>

<script setup lang="ts">
import { type TagDto } from '@/api/generated';
import EntryList from '@/components/EntryList.vue';
import PeriodSelection from '@/components/PeriodSelection.vue';
import TagFilter from '@/components/TagFilter.vue';
import { ref } from 'vue';

const selectedTags = ref<Array<TagDto>>([]);
const startDate = ref<string>("1900-01-01");
const endDate = ref<string>("2100-12-31");


const handleToggleTag = (tags : Array<TagDto>) => {
  console.log("Home view tags " + tags);
  selectedTags.value = tags;
}

const handleSelectPeriod = (period : PeriodDto) => {
  startDate.value = period.startDate;
  endDate.value = period.endDate;
}

</script>
