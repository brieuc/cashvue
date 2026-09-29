<template>
<div class="modal-overlay" @click="$emit('close')">
  <div class="modal" @click.stop>
    <div class="modal-header">
      <button type="button" class="btn-cancel" @click="cancel">Cancel</button>
      <h2>{{ rate ? formatDate(rate.valueDate) : "New Rate" }}</h2>
      <button type="submit" class="btn-submit" @click="handleSubmit">Save</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>1 {{ form.targetCurrencyCode }} = XX {{ form.sourceCurrencyCode }}</label>
      </div>
      <div class="form-group">
        <input v-model="form.valueDate" type="date">
      </div>
      <div class="form-group">
        <input v-model.number="form.rate" type="number" step="any" placeholder="Taux">
      </div>
      <button v-if="rate?.id" type="button" class="btn-delete" @click="handleDelete">Supprimer</button>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import type { RateDto } from '@/api/generated';
import { computed, reactive, watch } from 'vue';

interface props {
  rate?: RateDto
  sourceCurrencyCode: string
  targetCurrencyCode: string | undefined
}

const { rate, sourceCurrencyCode, targetCurrencyCode } = defineProps<props>();

interface emits {
  close: [],
  submit: [RateDto],
  delete: [number]
}
const emit = defineEmits<emits>();

// Attention à la syntaxe compact => ({}); si nous renvoyons un objet
// à la place de => { return ... };
const getFormRate = (r : RateDto) : RateDto => ({
  id: r.id,
  sourceCurrencyCode: r.sourceCurrencyCode,
  targetCurrencyCode: r.targetCurrencyCode,
  valueDate: r.valueDate?.slice(0, 10),
  rate: r.rate ? Math.round(10000 / r.rate) / 10000 : 0
});

const defaultForm = computed<RateDto>(() => ({
  id: undefined,
  sourceCurrencyCode: sourceCurrencyCode,
  targetCurrencyCode: targetCurrencyCode,
  valueDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
  rate: 0
}));

const form = reactive<RateDto>({...defaultForm.value});

watch(() => rate, (r) => {
  if (r)
    Object.assign(form, getFormRate(r))
  else
    Object.assign(form, defaultForm.value);
}, {immediate: true});

const handleSubmit = () => {
  if (!form.rate) return;
  const submitData : RateDto = {...form, rate: 1 / form.rate};
  emit("submit", submitData);
};

const handleDelete = () => {
  if (rate?.id)
    emit("delete", rate.id);
};

const cancel = () => {
  emit("close");
};

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  if (dateString.startsWith('1000-01-01')) return 'Taux initial'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

</script>

<style>
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

.modal-body {
  padding: 1.25rem;
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

.btn-delete {
  width: 100%;
  padding: 0.6rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #e74c3c;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
}

.btn-delete:hover {
  background: #fdecea;
}
</style>
