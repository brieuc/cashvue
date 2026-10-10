<template>
<div class="period-row" ref="row">
    <button type="button" class="today-toggle" :class="{ active: toDateOnly }" @click="toDateOnly = !toDateOnly">
      <span class="toggle-track"><span class="toggle-thumb"></span></span>
      à ce jour
    </button>
    <span class="divider"></span>
    <button v-for="period in availablePeriods" :key="period.id" type="button" @click="select(period)"
      :class="['tag-btn', { active: selectedPeriod?.id === period.id }]">
      {{ period.title }}
    </button>
</div>
</template>

<script setup lang="ts">
import { type GetPeriodsParams, type PeriodDto } from '@/api/generated';
import { usePeriods } from '@/composables/usePeriods';
import { computed, onMounted, useTemplateRef, watch } from 'vue';

//const selectedPeriod = ref<PeriodDto | undefined>();
const {periods, fetchPeriods} = usePeriods();

const selectedPeriod = defineModel({type: Object, default: () => ({}) });
const toDateOnly = defineModel('toDate', {type: Boolean, default: false});

interface Emit {
  select: [PeriodDto]
}

const availablePeriods = computed(() => periods.value.filter(p => !p.hidden));

watch(availablePeriods, (periods) => {
  if (!periods.length) return;
  const savedTitle = localStorage.getItem('selected-period');
  selectedPeriod.value = periods.find(p => p.title === savedTitle) ?? periods[0];
}, { immediate: true});

const row = useTemplateRef<HTMLElement>('row');

// flush 'post' : le bouton .active est déjà rendu quand on scrolle
watch(selectedPeriod, () => {
  row.value?.querySelector('.tag-btn.active')
    ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
}, { flush: 'post' });

const emit = defineEmits<Emit>();

const select = (p : PeriodDto) => {
  selectedPeriod.value = p;
  localStorage.setItem('selected-period', p.title);
  emit("select", p);
}

const loadPeriods = () => {
  const params : GetPeriodsParams = {
    size: 1000,
    sort: ['startDate:desc']
  }
  fetchPeriods(params);
}

onMounted(() => {
  loadPeriods();
})

</script>

<style scoped>
.period-row {
  display: flex;
  align-items: center;
}

.today-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  padding: 0.4rem 0.2rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: #7f8c8d;
  transition: color 0.2s;
}

.today-toggle.active {
  color: #2c3e50;
}

.toggle-track {
  display: inline-flex;
  align-items: center;
  width: 30px;
  height: 18px;
  border-radius: 999px;
  background: #d0d7de;
  padding: 2px;
  transition: background 0.2s;
}

.today-toggle.active .toggle-track {
  background: #3498db;
}

.toggle-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s;
}

.today-toggle.active .toggle-thumb {
  transform: translateX(12px);
}

.divider {
  width: 1px;
  height: 1.25rem;
  background: #e1e8ed;
  margin: 0 0.6rem;
  flex-shrink: 0;
}
</style>
