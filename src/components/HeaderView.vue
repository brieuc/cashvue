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
import { type TagDto, type PeriodDto, type ComputationRequestDto } from '@/api/generated';
import { useComputation } from '@/composables/useComputation';
import { computed, ref, watch, type Component } from 'vue';
import HeaderTotalPanel from './header/HeaderTotalPanel.vue';
import HeaderToDatePanel from './header/HeaderToDatePanel.vue';
import HeaderCurrencyPanel from './header/HeaderCurrencyPanel.vue';

interface Props {
  selectedPeriod : PeriodDto | undefined,
  selectedTags : TagDto[],
  entriesUpdated : number,
  searchText : string
}

const { selectedPeriod, selectedTags, entriesUpdated, searchText } = defineProps<Props>();

const { fetchComputation: fetchTotalComputation, computationResponse: totalComputation } = useComputation();
const { fetchComputation: fetchToDateComputation, computationResponse: toDateComputation } = useComputation();

const scrollContainer = ref<HTMLElement>();
const activeIndex = ref(0);

interface PanelDescriptor {
  key: string,
  component: Component,
  props: Record<string, unknown>,
}

const isPeriodOngoing = computed(() => {
  if (!selectedPeriod?.endDate)
    return false;
  return new Date(selectedPeriod.endDate).getTime() > Date.now();
});

const absoluteAmount = (amount: number | undefined) => {
  const value = amount ?? 0.0;
  return value < 0.0 ? value * -1.0 : value;
};

const panels = computed<PanelDescriptor[]>(() => {
  const result: PanelDescriptor[] = [
    {
      key: 'total',
      component: HeaderTotalPanel,
      props: {
        nbEntries: totalComputation.value?.numberOfEntries,
        totalAmount: absoluteAmount(totalComputation.value?.totalAmount),
        currency: totalComputation.value?.targetCurrencyCode ?? '',
      },
    },
  ];

  if (isPeriodOngoing.value && toDateComputation.value) {
    result.push({
      key: 'to-date',
      component: HeaderToDatePanel,
      props: {
        nbEntries: toDateComputation.value?.numberOfEntries,
        totalAmount: absoluteAmount(toDateComputation.value?.totalAmount),
        currency: toDateComputation.value?.targetCurrencyCode ?? '',
      },
    });
  }

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
    });
  });

  return result;
});

watch(() => searchText, () => {
  getComputation(selectedPeriod, selectedTags);
});

watch(() => entriesUpdated, () => {
  getComputation(selectedPeriod, selectedTags);
});

watch(() => selectedPeriod, (period) => {
  getComputation(period, selectedTags);
});

watch(() => selectedTags, (tags) => {
  getComputation(selectedPeriod, tags);
})

// Local datetime string ("YYYY-MM-DDTHH:mm:ss") matching the format used for period dates.
const nowAsPeriodDate = () => {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19);
};

const getComputation = (period : PeriodDto | undefined, selectedTags : TagDto[]) => {
  if (!period)
    return;

  const request : ComputationRequestDto = {
    startDate: period.startDate,
    endDate: period.endDate,
    tags: selectedTags,
    searchText: searchText,
    targetCurrencyCode: "CHF"
  }
  fetchTotalComputation(request);

  if (new Date(period.endDate).getTime() > Date.now()) {
    fetchToDateComputation({
      ...request,
      endDate: nowAsPeriodDate(),
    });
  }
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
