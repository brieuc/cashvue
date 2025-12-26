<template>
  <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <button type="button" class="btn-cancel" @click="$emit('close')">Annuler</button>
        <h2>Nouvelle dépense</h2>
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
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" rows="2"></textarea>
        </div>

        <div class="form-group">
          <label>Tags</label>
          <div class="tags-container">
            <button
              v-for="tag in availableTags"
              :key="tag.id"
              type="button"
              @click="toggleTag(tag.id)"
              :class="['tag-btn', { active: form.tags.some(t => t.id === tag.id) }]"
            >
              {{ tag.title }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { useTags } from '@/composables/useTags'
import type { Tag, CreateEntryRequest } from '@/types'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [data: CreateEntryRequest]
}>()

const { getAll } = useTags()
const availableTags = ref<Tag[]>([])

const form = reactive({
  title: '',
  amount: null as number | null,
  currencyCode: 'EUR',
  accountingDate: new Date().toISOString().slice(0, 16),
  description: '',
  tags: [] as Array<{ id: string; title: string }>,
})

const loadTags = async () => {
  const tags = await getAll()
  if (tags) {
    availableTags.value = tags
  }
}

const toggleTag = (tagId: string) => {
  const index = form.tags.findIndex((tag) => tag.id === tagId)
  if (index > -1) {
    form.tags.splice(index, 1)
  } else {
    const tag = availableTags.value.find((t) => t.id === tagId)
    if (tag) {
      form.tags.push({ id: tag.id, title: tag.title })
    }
  }
}

const handleSubmit = () => {
  const submitData = { ...form } as CreateEntryRequest
  if (submitData.tags && submitData.tags.length === 0) {
    delete submitData.tags
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

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-btn {
  padding: 0.4rem 0.9rem;
  background: #ecf0f1;
  color: #2c3e50;
  border: 1px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
}

.tag-btn:hover {
  background: #dfe6e9;
}

.tag-btn.active {
  background: #3498db;
  color: white;
  border-color: #2980b9;
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
