<template>
  <div class="app-layout">
    <!-- Period en haut fixe -->
    <div class="period-bar">
      <PeriodSelection
        v-model="selectedPeriod"
        v-model:to-date="toDateOnly"
      />
    </div>

    <div class="header-bar">
      <HeaderView
        :selected-period="selectedPeriod"
        :selected-tags="selectedTags"
        :search-text="searchText"
        :entries-updated="entriesChanged"
        :to-date-only="toDateOnly"
        :target-currency-code="targetCurrencyCode"
        v-model:currency="activeCurrency">
      </HeaderView>
    </div>

    <!-- Liste au milieu scrollable -->
    <div class="entry-content">
      <EntryList
        v-if="!showTagGrid"
        :tags="selectedTags"
        :start-date="startDate"
        :end-date="endDate"
        :search-text="searchText"
        :filtering-currency="activeCurrency"
        @entries-changed="entriesChanged++"
        @toggle-view="showTagGrid = true"
      />
      <TagGrid
        v-else
        :tags="selectedTags"
        :start-date="startDate"
        :end-date="endDate"
        :search-text="searchText"
        :target-currency-code="targetCurrencyCode"
        @toggle-view="showTagGrid = false"
        v-model="selectedTagFromTagGrid"
      />
    </div>

    <!-- Tags en bas fixe -->
    <div class="tag-bar">
      <EntryFilter v-model:search-text="searchText" v-model:tags="selectedTags" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type TagDto, type PeriodDto } from '@/api/generated';
import EntryList from '@/components/entries/EntryList.vue';
import HeaderView from '@/components/HeaderView.vue';
import PeriodSelection from '@/components/PeriodSelection.vue';
import EntryFilter from '@/components/filter/EntryFilter.vue';
import { effectiveEndDate } from '@/composables/useEffectivePeriod';
import TagGrid from '@/components/grid/TagGrid.vue';
import { ref, watch } from 'vue';



const selectedTags = ref<Array<TagDto>>([]);
const selectedPeriod = ref<PeriodDto | undefined>();
const toDateOnly = ref<boolean>(false);
const activeCurrency = ref<string>('CHF');
const targetCurrencyCode = ref<string>('CHF');
const showTagGrid = ref<boolean>(false);
const selectedTagFromTagGrid = ref<TagDto>();


const startDate = ref<string>("2000-01-01T00:00:00");
const endDate = ref<string>("2000-01-01T00:00:00");

const entriesChanged = ref<number>(0);
const searchText = ref<string>('');

watch(selectedTagFromTagGrid, (tag) => {
  if (!tag) return;
  const alreadySelected = selectedTags.value.some((t) => t.id === tag.id);
  if (!alreadySelected) {
    // On remplace le tableau au lieu de le muter (push) : les watchers sur selectedTags
    // (HeaderView, targetCurrencyCode...) sont superficiels et ne réagissent qu'à un
    // changement de référence, pas à une mutation en place.
    selectedTags.value.push(tag);
  }
});

watch(() => selectedTags, (tags) => {
  if (!tags || tags.value.length === 0) {
    targetCurrencyCode.value = "CHF";
    return;
  }
  const tagsWithCurrency = tags.value.filter((t) => t.currencyCode != null);
  const lastTag = tagsWithCurrency.length > 0 ? tagsWithCurrency[tagsWithCurrency.length - 1] : undefined;
  const nextCurrency = lastTag?.currencyCode ?? "CHF";
  targetCurrencyCode.value = nextCurrency;
}, {deep : true});

watch([selectedPeriod, toDateOnly], ([newPeriod, toDateOnlyValue]) => {
  if (!newPeriod)
    return;
  console.log("HomeView newPeriod " + JSON.stringify(newPeriod));
  startDate.value = newPeriod.startDate;
  endDate.value = toDateOnlyValue ? effectiveEndDate(newPeriod)! : newPeriod.endDate;
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
  flex-shrink: 0;
  height: 4.5rem;
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
  padding-bottom: 0.75rem;
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
