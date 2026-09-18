<template>
<div class="period-row">
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
import { computed, onMounted, watch } from 'vue';

//const selectedPeriod = ref<PeriodDto | undefined>();
const {periods, fetchPeriods} = usePeriods();

const selectedPeriod = defineModel({type: Object, default: () => ({}) });
const toDateOnly = defineModel('toDate', {type: Boolean, default: false});

interface Emit {
  select: [PeriodDto]
}

const availablePeriods = computed(() => periods.value.filter(p => !p.hidden));

watch(availablePeriods, (periods) => {
  const first = periods?.[0];
  if (first) {
    console.log("emit " + JSON.stringify(first));
    selectedPeriod.value = first;
    //emit("select", first);
    /*
        setTimeout(() => {    emit("select", first);}, 100);



    */
  }
});

const emit = defineEmits<Emit>();

const select = (p : PeriodDto) => {
  selectedPeriod.value = p;
  console.log("period selection " + JSON.stringify(p));
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
  console.log("mounted period");
  loadPeriods();
  // The periods update should treated in the watch but since
  // we don't reload the usePeriod.periods every time, we need
  // to manage the selected element directly there when the period
  // is already loaded.
  if (periods.value) {
    selectedPeriod.value = periods.value?.[0];
  }
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
