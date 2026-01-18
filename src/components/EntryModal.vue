<template>
  <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <button type="button" class="btn-cancel" @click="$emit('close')">Annuler</button>
        <h2>{{ props.entry ? props.entry.title : "Nouvelle dépense" }}</h2>
        <button type="submit" class="btn-submit" @click="handleSubmit">Enregistrer</button>
      </div>
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>Titre *</label>
            <input v-model="form.title" type="text" required />
          </div>

          <div class="form-group">
            <label>Date *</label>
            <input v-model="form.accountingDate" type="datetime-local" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Montant *</label>
            <input v-model.number="form.amount" type="number" step="0.01" required />
          </div>

          <div class="form-group">
            <label>Devise *</label>
            <select v-model="form.currencyCode" required>
              <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                {{ currency.code }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" rows="2"></textarea>
        </div>

        <TagFilter v-model="form.tags" />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch, onUpdated } from 'vue'
import TagFilter from './TagFilter.vue';
import type { EntryDto, GetCurrenciesParams, TagDto } from '@/api/generated';
import type { CreateEntryRequest } from '@/types/types';
import { useCurrencies } from '@/composables/useCurrencies';

const { currencies, fetchCurrencies } = useCurrencies();

interface Props {
  isOpen: boolean,
  entry?: EntryDto
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: []
  submit: [data: CreateEntryRequest]
}>()

const getFormEntry = (entry : CreateEntryRequest) : CreateEntryRequest => ({
  title: entry.title,
  amount: entry.amount,
  currencyCode: entry.currencyCode,
  accountingDate: entry.accountingDate,
  description: entry.description,
  tags: entry.tags,
});

const defaultForm : CreateEntryRequest = {
  title: '',
  amount: null as number | null,
  currencyCode: 'CHF',
  accountingDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  description: '',
  tags: [] as Array<TagDto>,
};

const form = reactive<CreateEntryRequest>({...defaultForm});

watch(() => props.entry, (entry) => {
  if(entry)
    Object.assign(form, getFormEntry(entry));
  else
    Object.assign(form, {...defaultForm});
}, {immediate: true});



const handleSubmit = () => {
  const submitData = { ...form }
  if (submitData.tags && submitData.tags.length === 0) {
    delete submitData.tags
  }
  emit('submit', submitData)
}

const loadCurrencies = () => {
  const params : GetCurrenciesParams = {

  };
  fetchCurrencies(params);
}

onMounted(() => {
  loadCurrencies();
})

onUpdated(() => {
  console.log("props.entry" + props.entry);
});

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
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
  font-size: 0.95rem;
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

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
