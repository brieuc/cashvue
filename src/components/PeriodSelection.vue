<template>
<div>
    <button v-for="period in periods" :key="period.id" type="button" @click="select(period)"
      :class="['tag-btn', { active: selectedPeriod === period.id }]">
      {{ period.title }}
    </button>
</div>
</template>

<script setup lang="ts">
import { getPeriods, type GetPeriodsParams, type PeriodDto } from '@/api/generated';
import { usePeriods } from '@/composables/usePeriods';
import { onMounted, ref } from 'vue';

const selectedPeriod = ref<PeriodDto>();
const {periods, fetchPeriods} = usePeriods();

interface Emit {
  select: [PeriodDto]
}

const emit = defineEmits<Emit>();

const select = (p : PeriodDto) => {
  console.log("period selection " + JSON.stringify(p));
  emit("select", p);
}

const loadPeriods = () => {
  const params : GetPeriodsParams = {

  }
  fetchPeriods(params);
}

onMounted(() => {
  loadPeriods();
})

</script>

<style>
.tag-btn:hover {
  background: #dfe6e9;
}

.tag-btn.active {
  background: #3498db;
  color: white;
  border-color: #2980b9;
}

/* Pour rendre les boutons inline */
button {
  display: inline-block;
  margin-right: 0.5rem;
}
</style>
