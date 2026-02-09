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
import { onMounted, ref, watch } from 'vue';

//const selectedPeriod = ref<PeriodDto | undefined>();
const {periods, fetchPeriods} = usePeriods();

const selectedPeriod = defineModel({type: Object, default: () => ({}) });

interface Emit {
  select: [PeriodDto]
}

watch(periods, (periods) => {
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

