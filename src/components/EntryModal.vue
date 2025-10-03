<template>
  <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Nouvelle dépense</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>Titre *</label>
            <input v-model="form.title" type="text" required />
          </div>

          <div class="form-group">
            <label>Date *</label>
            <input v-model="form.accountingDate" type="date" required />
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
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>Tags</label>
          <div class="tags-container">
            <label
              v-for="tag in availableTags"
              :key="tag.id"
              class="tag-checkbox"
            >
              <input
                type="checkbox"
                :value="tag.id"
                v-model="form.tagIds"
              />
              <span>{{ tag.title }}</span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Annuler</button>
          <button type="submit" class="btn-submit">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import { useTags } from '@/composables/useTags.js'

defineProps({
  isOpen: Boolean,
})

const emit = defineEmits(['close', 'submit'])

const { getAll } = useTags()
const availableTags = ref([])

const form = reactive({
  title: '',
  amount: null,
  currencyCode: 'EUR',
  accountingDate: new Date().toISOString().split('T')[0],
  description: '',
  tagIds: [],
})

const loadTags = async () => {
  const tags = await getAll()
  if (tags) {
    availableTags.value = tags
  }
}

const handleSubmit = () => {
  const submitData = { ...form }
  if (submitData.tagIds.length === 0) {
    delete submitData.tagIds
  }
  emit('submit', submitData)
}

onMounted(() => {
  loadTags()
})
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
  padding: 1.5rem;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #7f8c8d;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #2c3e50;
}

.modal-body {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 1rem;
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

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.tag-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ecf0f1;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.tag-checkbox:hover {
  background: #dfe6e9;
}

.tag-checkbox input[type='checkbox'] {
  width: auto;
  margin: 0;
  cursor: pointer;
}

.tag-checkbox input[type='checkbox']:checked + span {
  font-weight: 600;
  color: #3498db;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-cancel:hover {
  background: #dfe6e9;
}

.btn-submit {
  background: #3498db;
  color: white;
}

.btn-submit:hover {
  background: #2980b9;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
