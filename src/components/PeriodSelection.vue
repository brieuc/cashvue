<template>
<div>
    <button v-for="period in periods" :key="period.id" type="button" @click="select(period)"
      :class="['tag-btn', { active: selectedPeriod?.id === period.id }]">
      {{ period.title }}
    </button>
</div>
</template>

<script setup lang="ts">
import { type GetPeriodsParams, type PeriodDto } from '@/api/generated';
import { usePeriods } from '@/composables/usePeriods';
import { onMounted, ref } from 'vue';

const selectedPeriod = ref<PeriodDto | null>(null);
const {periods, fetchPeriods} = usePeriods();

interface Emit {
  select: [PeriodDto]
}

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
  loadPeriods();
})

</script>

