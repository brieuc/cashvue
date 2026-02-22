<template>
  <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <button type="button" class="btn-cancel" @click="cancel">Cancel</button>
        <h2>{{ props.entry ? props.entry.title : "New Entry" }}</h2>
        <button type="submit" class="btn-submit" @click="handleSubmit">Save</button>
      </div>
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-row">
            <div class="form-group" style="display: flex; justify-content: space-evenly; align-items: center; padding: 0 1rem;">
            <span>
              <button
                  type="button"
                  class="amount-toggle"
                  :class="isPositive ? 'positive' : 'negative'"
                  @click="isPositive = !isPositive">
                  {{ isPositive ? '+' : '−' }}
              </button>
            </span>
            <span><input v-model.number="form.amount"
              type="number"
              inputmode="decimal"
              step="any"
              class="amount-input"
              ref="inputRef"/>
            </span>
            <span><select v-model="form.currencyCode" required>
              <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                {{ currency.code }}
              </option>
            </select></span>
            </div>
          <div class="form-group">
            <input v-model="form.title" type="text" placeholder="Titre" />
          </div>

          <div class="form-group">
            <input v-model="form.accountingDate" type="datetime-local" required />
          </div>


        </div>

        <div class="form-row">

        </div>

        <div class="form-group">
          <textarea v-model="form.description" rows="2" placeholder="Description"></textarea>
        </div>

        <TagFilter v-model="form.tags" />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch, onUpdated, ref, nextTick } from 'vue'
import TagFilter from './TagFilter.vue';
import type { EntryDto, GetCurrenciesParams, TagDto } from '@/api/generated';
import type { CreateEntryRequest } from '@/types/types';
import { useCurrencies } from '@/composables/useCurrencies';

const { currencies, fetchCurrencies } = useCurrencies();

interface Props {
  isOpen: boolean,
  entry?: EntryDto
}

const inputRef = ref<HTMLInputElement | null>(null);
const props = defineProps<Props>();

const emit = defineEmits<{
  close: []
  submit: [data: CreateEntryRequest]
}>()

const isPositive = ref<boolean>(false);

const getFormEntry = (entry : CreateEntryRequest) : CreateEntryRequest => ({
  title: entry.title,
  amount: Math.abs(entry.amount as number),
  currencyCode: entry.currencyCode,
  accountingDate: entry.accountingDate,
  description: entry.description,
  tags: entry.tags,
});

const defaultForm : CreateEntryRequest = {
  title: '',
  amount: null,
  currencyCode: 'CHF',
  accountingDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  description: '',
  tags: [] as Array<TagDto>,
};

const form = reactive<CreateEntryRequest>({...defaultForm});

watch(() => props.entry, (entry) => {
  console.log("watch " + JSON.stringify(entry));
  if(entry) {
    Object.assign(form, getFormEntry(entry));
    isPositive.value = entry.amount > 0.0 ? true : false;
  }
  else {
    Object.assign(form, {...defaultForm});
    isPositive.value = false;
  }
}, {immediate: true});

watch(() => props.isOpen, (open) => {
  if (open) {
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});

const cancel = () => {
  // Need to verifiy if there is an entry because if we clear the data
  // and we try to launch again the same entry, the watch props.entry
  // is not triggered again so the form stays blank.
  if (!props.entry) {
    Object.assign(form, {...defaultForm});
    isPositive.value = false;
  }
  emit("close");
};


const handleSubmit = () => {
  const submitData = { ...form }
  // Put the right amount depending on -/+ button
  if (isPositive.value === false)
    submitData.amount = (submitData.amount ?? 0) * -1.00;
  if (submitData.tags && submitData.tags.length === 0) {
    delete submitData.tags
  }
  emit('submit', submitData)
  // Reset the form
  Object.assign(form, defaultForm);
  isPositive.value = false;
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
  /*font-size: 0.95rem;*/
  font-size: 16px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-group input[type="datetime-local"] {
  max-width: 100%;
  -webkit-appearance: none;
}

.form-group textarea {
  resize: vertical;
}

.amount-toggle {
  width: 2.5rem;
  height: 2.5rem; /* même hauteur qu'un input standard */
  border: none;
  border-radius: 4px;
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.form-group input.amount-input {
  font-size: 1.75rem;
  font-weight: 600;
  text-align: right;
  width: 8ch;
  padding: 0.5rem 0.75rem;
  height: 3rem;
}

.amount-toggle.positive {
  background-color: #22c55e; /* vert */
}

.amount-toggle.negative {
  background-color: #ef4444; /* rouge */
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
