<template>
<div class="modal-overlay" @click="$emit('close')">
  <div class="modal" @click.stop>
    <div class="modal-header">
      <button type="button" class="btn-cancel" @click="cancel">Cancel</button>
      <h2>{{ recurrence ? recurrence.title : "New Recurrence" }}</h2>
      <button type="submit" class="btn-submit" @click="handleSubmit">Save</button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <input id="startDate" v-model="form.startDate" type="datetime-local" required class="date-input" />

        <button
            type="button"
            class="amount-toggle"
            :class="isPositive ? 'positive' : 'negative'"
            @click="isPositive = !isPositive">
            {{ isPositive ? '+' : '−' }}
        </button>
        <input v-model.number="form.amount"
          type="number"
          inputmode="decimal"
          step="any"
          class="amount-input"
          ref="inputRef"/>
        <select v-model="form.currencyCode" required class="currency-select">
          <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
            {{ currency.code }}
          </option>
        </select>
      </div>

      <div class="tag-filter-wrapper">
        <TagFilter v-model="form.tags" />
      </div>

      <div class="form-group">
        <label for="title">Titre</label>
        <input id="title" v-model="form.title" type="text">
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" v-model="form.description"></textarea>
      </div>

      <div class="form-group">
        <label for="frequency">Fréquence</label>
        <select id="frequency" v-model="form.frequency">
          <option value="DAILY">Quotidien</option>
          <option value="WEEKLY">Hebdomadaire</option>
          <option value="MONTHLY">Mensuel</option>
          <option value="QUARTERLY">Trimestriel</option>
          <option value="YEARLY">Annuel</option>
          <option value="NONE">Aucun</option>
        </select>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { type GetCurrenciesParams, type RecurrenceDto, RecurrenceDtoFrequency } from '@/api/generated';
import { onMounted, reactive, ref, watch } from 'vue';
import { useCurrencies } from '@/composables/useCurrencies';
import TagFilter from '../filter/TagFilter.vue';

const { currencies, fetchCurrencies } = useCurrencies();
interface props {
  recurrence?: RecurrenceDto
}
const { recurrence } = defineProps<props>();

interface emits {
  close: [],
  submit: [RecurrenceDto]
}
const emit = defineEmits<emits>();

const getFormRecurrence = (rec: RecurrenceDto): RecurrenceDto => ({
  id: rec.id,
  title: rec.title,
  description: rec.description,
  amount: Math.abs(rec.amount as number),
  currencyCode: rec.currencyCode,
  startDate: rec.startDate?.slice(0, 16),
  frequency: rec.frequency,
  tags: rec.tags,
});

const defaultForm: RecurrenceDto = {
  id: undefined,
  title: '',
  description: '',
  amount: 0,
  currencyCode: '',
  startDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  frequency: RecurrenceDtoFrequency.MONTHLY,
  tags: [],
};

const isPositive = ref<boolean>();
const form = reactive<RecurrenceDto>({ ...defaultForm });

watch(() => recurrence, (rec) => {
  if (rec) {
    isPositive.value = rec.amount > 0.0 ? true : false;
    Object.assign(form, getFormRecurrence(rec));
  }
  else {
    isPositive.value = false;
    Object.assign(form, defaultForm);
  }
}, { immediate: true });

const handleSubmit = () => {
  const submitData: RecurrenceDto = { ...form };
    // Put the right amount depending on -/+ button
  if (isPositive.value === false)
    submitData.amount = (submitData.amount ?? 0) * -1.00;
  console.log("submit recurrence " + JSON.stringify(submitData));
  emit('submit', submitData);
};

const cancel = () => {
  emit('close');
};

const loadCurrencies = () => {
  const params : GetCurrenciesParams = {
  };
  fetchCurrencies(params);
}

onMounted(() => {
  loadCurrencies();
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
}

.modal-body {
  padding: 1.25rem;
}

.form-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.date-input,
.currency-select {
  padding: 0.4rem;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
}

.date-input:focus,
.currency-select:focus {
  outline: none;
  border-color: #3498db;
}

.date-input {
  flex: 1 1 100px;
  min-width: 0;
  max-width: 100%;
  -webkit-appearance: none;
}

/* Contrairement à EntryModal, .modal-body a ici un padding horizontal
   (1.25rem, ligne 177) : une marge négative égale l'annule pour que
   TagFilter atteigne les bords de la modale, comme dans EntryModal. */
.tag-filter-wrapper {
  margin: 0 -1.25rem 0.75rem;
  border-top: 1px solid #e1e8ed;
  padding-top: 0.5rem;
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-group textarea {
  resize: vertical;
}

.btn-cancel,
.btn-submit {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-size: 0.95rem;
}

.btn-cancel {
  background: transparent;
  color: #3498db;
}

.btn-cancel:hover {
  background: #ecf0f1;
}

.btn-submit {
  background: transparent;
  color: #3498db;
  font-weight: 600;
}

.btn-submit:hover {
  background: #ecf0f1;
}
.amount-toggle {
  flex: 0 0 auto;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.amount-input {
  font-size: 1.3rem;
  font-weight: 600;
  text-align: right;
  width: 6ch;
  flex: 0 0 auto;
  padding: 0.4rem 0.5rem;
  height: 2.25rem;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-family: inherit;
}

.amount-input:focus {
  outline: none;
  border-color: #3498db;
}

.amount-toggle.positive {
  background-color: #22c55e; /* vert */
}

.amount-toggle.negative {
  background-color: #ef4444; /* rouge */
}
</style>
