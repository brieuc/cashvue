<template>
<div class="modal-overlay" @click="$emit('close')">
  <div class="modal" @click.stop>
    <div class="modal-header">
      <button type="button" class="btn-cancel" @click="cancel">Cancel</button>
      <h2>{{ tag ? tag.title : "New Tag" }}</h2>
      <button type="submit" class="btn-submit" @click="handleSubmit">Save</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <input v-model="form.title" type="text" placeholder="Title">
      </div>
      <div class="form-group">
        <input v-model="form.description" type="text" placeholder="Description">
      </div>
      <div class="form-group">
        <input v-model="form.icon" type="text" placeholder="Icon">
      </div>
    </div>
  </div>
</div>

</template>

<script setup lang="ts">
import type { TagDto } from '@/api/generated';
import { reactive, watch } from 'vue';


interface props {
  tag?: TagDto
}
const { tag } = defineProps<props>();

interface emits {
  close: [],
  submit: [TagDto]
}
const emit = defineEmits<emits>();



// Attention à la syntaxe compact => ({}); si nous renvoyons un objet
// à la place de => { return ... };
const getFormTag = (t : TagDto) : TagDto => ({
  id: t.id,
  title: t.title,
  description: t.description,
  icon: t.icon,
  hidden: t.hidden
});

const defaultForm : TagDto = {
  id: undefined,
  title: "",
  description: "",
  icon: "",
  hidden: false
};

const form = reactive<TagDto>({...defaultForm});


watch(() => tag, (t) => {
  if (t)
    Object.assign(form, getFormTag(t))
  else
    Object.assign(form, defaultForm);
}, {immediate: true});



const handleSubmit = () => {
  const submitData : TagDto = {...form};
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
</style>
