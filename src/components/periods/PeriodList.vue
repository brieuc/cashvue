<template>
<div class="header-bar">
  <h2>Mes Périodes</h2>
  <button class="add-btn" @click="showModal = true">+</button>
</div>
<div v-if="showModal">
  <PeriodModal :period="selectedPeriod" @submit="handleSubmit" @close="close"></PeriodModal>
</div>
<div class="card" v-for="period in periods" v-bind:key="period.id" @click="selectPeriod(period)">
  <PeriodView :period="period"></PeriodView>
</div>
</template>

<script setup lang="ts">
import { usePeriods } from '@/composables/usePeriods';
import PeriodView from './PeriodView.vue';
import { ref } from 'vue';
import PeriodModal from './PeriodModal.vue';
import { createPeriod, updatePeriod, type PeriodDto } from '@/api/generated';

const { periods } = usePeriods();
const selectedPeriod = ref<PeriodDto>();
const showModal = ref<boolean>(false);

const selectPeriod = ( period: PeriodDto) => {
  showModal.value = true;
  console.log("selectPeriod");
  if (period) {
    selectedPeriod.value = period;
    console.log("selected period " + JSON.stringify(selectedPeriod.value));
  }
};

const newPeriod : PeriodDto = {
  title: "",
  startDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  endDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  hidden: false
};

const handleSubmit = ( period: PeriodDto) => {
  if (period.id) {
    updatePeriod(period.id, period).then(response => {
      if (response.status === 200) {
        const index = periods.value.findIndex(prd => period.id === prd.id);
        if (index !== -1) {
          periods.value[index] = response.data;
        }
      }
    })
  }
  else {
    createPeriod(period).then(response => {
    if (response.status === 201) {
      const newPeriod = response.data;
      periods.value.unshift(newPeriod)
    }
  });}

  showModal.value = false;
  selectedPeriod.value = undefined;
};

const close = () => {
  showModal.value = false;
  selectedPeriod.value = undefined;
};

</script>

<style scoped>
.card {
  border-bottom: 0.1px solid #e1e8ed;
  padding: 1rem;
}

.add-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background 0.2s;
}
.add-btn:hover {
  background: #2980b9;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
</style>
