<template>
  <div class="header-view">
    <div class="header-scroll" ref="scrollContainer" @scroll="onScroll">
      <component
        v-for="panel in panels"
        :key="panel.key"
        :is="panel.component"
        v-bind="panel.props"
        class="header-slide"
      />
    </div>
    <div class="header-dots" v-if="panels.length > 1">
      <button
        v-for="(panel, index) in panels"
        :key="panel.key"
        type="button"
        class="header-dot"
        :class="{ active: index === activeIndex }"
        @click="scrollToPanel(index)"
        aria-label="Aller à ce panneau"
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type TagDto, type ComputationRequestDto } from '@/api/generated';
import { useComputation } from '@/composables/useComputation';
import { computed, ref, watch, type Component } from 'vue';
import HeaderTotalPanel from './HeaderTotalPanel.vue';
import HeaderCurrencyPanel from './HeaderCurrencyPanel.vue';
import { absoluteAmount } from '@/utils/formatAmount';

interface Props {
  startDate : string | undefined,
  endDate : string | undefined,
  selectedTags : TagDto[],
  excludedTags : TagDto[],
  entriesUpdated : number,
  searchText : string,
  targetCurrencyCode: string,
}

const { startDate, endDate, selectedTags, excludedTags, entriesUpdated, searchText, targetCurrencyCode } = defineProps<Props>();

const { fetchComputation: fetchTotalComputation, computationResponse: totalComputation } = useComputation();

const scrollContainer = ref<HTMLElement>();
const activeIndex = ref(0);

interface PanelDescriptor {
  key: string,
  component: Component,
  props: Record<string, unknown>,
  currency: string | null
}

const currency = defineModel<string | null>('currency', { default: null });

const panels = computed<PanelDescriptor[]>(() => {
  const result: PanelDescriptor[] = [
    {
      key: 'total',
      component: HeaderTotalPanel,
      props: {
        nbEntries: totalComputation.value?.numberOfEntries,
        totalAmount: absoluteAmount(totalComputation.value?.totalAmount),
        currency: totalComputation.value?.targetCurrencyCode ?? '',
        startDate,
        endDate,
      },
      currency: null,
    },
  ];

  const byCurrency = totalComputation.value?.computationByCurrency ?? {};
  Object.keys(byCurrency).sort().forEach((currencyCode) => {
    const detail = byCurrency[currencyCode];
    result.push({
      key: `currency-${currencyCode}`,
      component: HeaderCurrencyPanel,
      props: {
        currencyCode,
        nbEntries: detail.numberOfEntries,
        totalAmount: absoluteAmount(detail.totalAmount),
      },
      currency: currencyCode,
    });
  });

  return result;
});

watch(() => searchText, () => {
  getComputation();
});

watch(() => entriesUpdated, () => {
  getComputation();
});

watch(() => [startDate, endDate], () => {
  getComputation();
});

watch(() => selectedTags, () => {
  getComputation();
}, {deep : true})

watch(() => excludedTags, () => {
  getComputation();
}, {deep : true})

watch([activeIndex, panels], ([index, currentPanels]) => {
  currency.value = currentPanels[index]?.currency ?? null;
}, { immediate: true });

const getComputation = () => {
  if (!startDate || !endDate)
    return;

  const request : ComputationRequestDto = {
    startDate: startDate,
    endDate: endDate,
    tags: selectedTags,
    excludedTags: excludedTags,
    searchText: searchText,
    targetCurrencyCode: targetCurrencyCode
  }
  fetchTotalComputation(request);
}

const onScroll = () => {
  if (!scrollContainer.value)
    return;
  const { scrollLeft, clientWidth } = scrollContainer.value;
  if (clientWidth > 0)
    activeIndex.value = Math.round(scrollLeft / clientWidth);
}

const scrollToPanel = (index: number) => {
  if (!scrollContainer.value)
    return;
  scrollContainer.value.scrollTo({
    left: index * scrollContainer.value.clientWidth,
    behavior: 'smooth',
  });
}

</script>

<style scoped>
.header-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #85c1e9;
}

.header-scroll {
  flex: 1;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
}

.header-scroll::-webkit-scrollbar {
  display: none;
}

.header-slide {
  flex: 0 0 100%;
  width: 100%;
  scroll-snap-align: start;
}

.header-dots {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0 0.3rem;
}

.header-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.4);
  padding: 0;
  cursor: pointer;
}

.header-dot.active {
  background: #fff;
}
</style>
