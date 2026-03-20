<template>
<div class="header-bar">
  <h2>Mes Récurrences</h2>
  <button class="add-btn" @click="showModal = true">+</button>
</div>
<div v-if="showModal">
  <RecurrenceModal :recurrence="selectedRecurrence" @submit="handleSubmit" @close="close"></RecurrenceModal>
</div>
<div class="card" v-for="recurrence in recurrences" v-bind:key="recurrence.id" @click="selectRecurrence(recurrence)">
  <RecurrenceView :recurrence="recurrence"></RecurrenceView>
</div>
</template>

<script setup lang="ts">
import { useRecurrences } from '@/composables/useRecurrences';
import RecurrenceView from './RecurrenceView.vue';
import RecurrenceModal from './RecurrenceModal.vue';
import { ref, onMounted } from 'vue';
import { createRecurrence, updateRecurrence, type RecurrenceDto, RecurrenceDtoFrequency, GetRecurrencesFrequenciesItem, type GetRecurrencesParams } from '@/api/generated';

const { recurrences, fetchRecurrences } = useRecurrences();
const selectedRecurrence = ref<RecurrenceDto>();
const showModal = ref<boolean>(false);

onMounted(() => {
  const params: GetRecurrencesParams = {
    size: 1000,
    sort: ['startDate:desc']
  };
  fetchRecurrences(params);
});

const selectRecurrence = (recurrence: RecurrenceDto) => {
  selectedRecurrence.value = recurrence;
  showModal.value = true;
};

const newRecurrence: RecurrenceDto = {
  title: '',
  amount: 0,
  currencyCode: '',
  startDate: new Date().toISOString().slice(0, 10),
  frequency: RecurrenceDtoFrequency.MONTHLY,
};

const handleSubmit = (recurrence: RecurrenceDto) => {
  if (recurrence.id) {
    updateRecurrence(recurrence.id, recurrence).then(response => {
      if (response.status === 200) {
        const index = recurrences.value.findIndex(r => recurrence.id === r.id);
        if (index !== -1) {
          recurrences.value[index] = response.data;
        }
      }
    });
  } else {
    createRecurrence(recurrence).then(response => {
      if (response.status === 201) {
        recurrences.value.unshift(response.data);
      }
    });
  }

  showModal.value = false;
  selectedRecurrence.value = undefined;
};

const close = () => {
  showModal.value = false;
  selectedRecurrence.value = undefined;
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
