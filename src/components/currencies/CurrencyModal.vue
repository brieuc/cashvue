<template>
<div class="modal-overlay" @click="$emit('close')">
  <div class="modal" @click.stop>
    <div class="modal-header">
      <button type="button" class="btn-cancel" @click="cancel">Cancel</button>
      <h2>New Currency</h2>
      <button type="submit" class="btn-submit" :disabled="!isValid" @click="handleSubmit">Save</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="code">Code ISO</label>
        <input id="code" v-model="code" type="text" maxlength="3" placeholder="EUR" autocapitalize="characters" @keyup.enter="handleSubmit">
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import type { CurrencyDto } from '@/api/generated';
import { computed, ref } from 'vue';

interface emits {
  close: [],
  submit: [CurrencyDto]
}
const emit = defineEmits<emits>();

const code = ref<string>('');

const isValid = computed(() => /^[A-Z]{3}$/.test(code.value.trim().toUpperCase()));

const handleSubmit = () => {
  if (!isValid.value) return;
  emit("submit", { code: code.value.trim().toUpperCase() });
};

const cancel = () => {
  emit("close");
};
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

.form-group input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
  text-transform: uppercase;
}

.form-group input:focus {
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

.btn-submit:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
