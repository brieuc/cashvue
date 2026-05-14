<template>
  <div class="text-filter-wrapper">
    <input
      ref="inputRef"
      v-model="inputText"
      type="text"
      placeholder="Rechercher titre ou description..."
      class="text-filter-input"
    />
    <button v-if="inputText" class="clear-btn" @click="clear">&times;</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const searchText = defineModel<string>({ default: '' })
const inputText = ref(searchText.value)
const inputRef = ref<HTMLInputElement>()

let timeout: ReturnType<typeof setTimeout>

watch(inputText, (val) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    searchText.value = val
  }, 300)
})

const clear = () => {
  inputText.value = ''
  searchText.value = ''
  inputRef.value?.focus()
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<style scoped>
.text-filter-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.text-filter-input {
  width: 100%;
  padding: 0.4rem 2rem 0.4rem 0.6rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.9rem;
}

.clear-btn {
  position: absolute;
  right: 4px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.2rem;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
</style>
