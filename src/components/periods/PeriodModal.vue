<template>
<div class="modal-overlay" @click="$emit('close')">
  <div class="modal" @click.stop>
    <div class="modal-header">
      <button type="button" class="btn-cancel" @click="cancel">Cancel</button>
      <h2>{{ period ? period.title : "New Period" }}</h2>
      <button type="submit" class="btn-submit" @click="handleSubmit">Save</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <input v-model="form.title" type="text">
      </div>
      <div class="form-group">
        <input v-model="form.startDate" type="datetime-local">
      </div>
      <div class="form-group">
        <input v-model="form.endDate" type="datetime-local">
      </div>
      <div class="form-group checkbox-group">
        <input type="checkbox" id="hiddenChk" v-model="form.hidden" />
        <label for="hiddenChk">Hidden</label>
      </div>

      <hr>
      <button class="btn-simulate" @click="simulateEntries" :disabled="!form.startDate || !form.endDate">Simuler les récurrences</button>

      <div v-if="entries.length" class="entries-list">
        <div v-for="(entry, i) in entries" :key="i" class="entry-card" @click="selected[i] = !selected[i]">
          <input type="checkbox" v-model="selected[i]" @click.stop>
          <div class="entry-card-content">
            <EntryView :entry="entry" />
          </div>
        </div>
        <button class="btn-create-entries" @click="handleCreate" :disabled="!hasSelected">Créer les entrées sélectionnées</button>
      </div>
      <p v-else-if="simulated" class="empty">Aucune entrée générée sur cette période.</p>
    </div>
  </div>
</div>

</template>

<script setup lang="ts">
import type { PeriodDto, EntryDto } from '@/api/generated';
import { useRecurrences } from '@/composables/useRecurrences';
import { useEntries } from '@/composables/useEntries';
import { reactive, ref, computed, watch } from 'vue';
import EntryView from '@/components/EntryView.vue';


interface props {
  period?: PeriodDto
}
const { period } = defineProps<props>();

interface emits {
  close: [],
  submit: [PeriodDto]
}
const emit = defineEmits<emits>();



// Attention à la syntaxe compact => ({}); si nous renvoyons un objet
// à la place de => { return ... };
const getFormPeriod = (prd : PeriodDto) : PeriodDto => ({
  id: prd.id,
  title: prd.title,
  startDate: prd.startDate?.slice(0, 16),
  endDate: prd.endDate?.slice(0, 16),
  currencyCode: prd.currencyCode,
  hidden: prd.hidden
});

const defaultForm : PeriodDto = {
  id: undefined,
  title: "",
  startDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  endDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  currencyCode: null,
  hidden: false
};

const form = reactive<PeriodDto>({...defaultForm});


watch(() => period, (prd) => {
  if (prd)
    Object.assign(form, getFormPeriod(prd))
  else
    Object.assign(form, defaultForm);
}, {immediate: true});



const { simulate } = useRecurrences();
const { addEntries } = useEntries();

const entries = ref<EntryDto[]>([]);
const selected = ref<boolean[]>([]);
const simulated = ref(false);
const hasSelected = computed(() => selected.value.some(Boolean));

const simulateEntries = async () => {
  const response = await simulate({
    fromDate: form.startDate,
    toDate: form.endDate,
  });
  if (response.status === 200) {
    entries.value = response.data;
    selected.value = entries.value.map(() => true);
    simulated.value = true;
  }
};

const handleCreate = async () => {
  const toCreate = entries.value.filter((_, i) => selected.value[i]);
  await addEntries(toCreate);
};

const handleSubmit = () => {
  const submitData : PeriodDto = {...form};
  emit("submit", submitData);
};

const cancel = () => {
  emit("close");
};

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

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
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

.entry-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
}
.entry-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.entry-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.entry-card .card-layout {
  margin-bottom: 0;
}
.entry-card .currency { color: #2c3e50; }
</style>
