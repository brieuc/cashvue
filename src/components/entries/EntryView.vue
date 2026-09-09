<template>
  <div class="card-layout">
    <div class="card-left">
      <h3>{{ entry.title }}</h3>
      <p v-if="entry.description" class="desc">{{ entry.description }}</p>
    </div>
    <div class="card-right">
      <span class="date">{{ formatDate(entry.accountingDate) }}</span>
      <div class="amount-line">
        <span class="amount" :class="entry.amount >= 0 ? 'positive' : 'negative'">{{ entry.amount }}</span>
        <span class="currency">{{ entry.currencyCode }}</span>
      </div>
    </div>
  </div>
  <div class="tags-line">
    <div v-if="entry.tags?.length">
      <span v-for="tag in entry.tags" :key="tag.id">
        <img class="tag-icon" :src="`${uploadsUrl}/${tag!.icon}`" />
      </span>
    </div>
    <span v-else></span>
    <div class="actions-wrapper">
      <button type="button" class="actions-btn" aria-label="Actions" @click.stop="toggleMenu">⋮</button>
      <div v-if="showMenu" class="actions-menu" @click.stop>
        <button type="button" class="menu-item" @click="onDuplicate">Dupliquer</button>
        <button type="button" class="menu-item" @click="onDuplicateToNow">Dupliquer à maintenant</button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { EntryDto } from '@/api/generated';

const uploadsUrl = import.meta.env.VITE_UPLOADS_URL;
const showMenu = ref(false);

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

interface props {
  entry: EntryDto
}

const props = defineProps<props>();
const emit = defineEmits<{
  duplicate: [entry: EntryDto]
  duplicateToNow: [entry: EntryDto]
}>();

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const closeMenu = () => {
  showMenu.value = false;
};

const onDuplicate = () => {
  closeMenu();
  emit('duplicate', props.entry);
};

const onDuplicateToNow = () => {
  closeMenu();
  emit('duplicateToNow', props.entry);
};

onMounted(() => document.addEventListener('click', closeMenu));
onUnmounted(() => document.removeEventListener('click', closeMenu));
</script>

<style scoped>

.tag-icon {
    margin-left: 0.25rem;
    border-radius: 3px;
    width: 20px;
    height: 20px;
    object-fit: contain;
}
.tags-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-layout {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.15rem;
}
.card-left {
  flex: 1;
  min-width: 0;
}
h3 {
  overflow-wrap: break-word;
  word-break: break-word;
}
.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}
.date {
  font-size: 0.75rem;
  color: #7f8c8d;
}
.desc {
  font-size: 0.8rem;
  color: #5a6c7d;
  margin: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}
.amount-line {
  display: flex;
  gap: 0.35rem;
  align-items: baseline;
}
.amount {
  font-weight: 600;
  font-size: 1rem;
  color: #2c3e50;
}
.amount.positive { color: #27ae60; }
.amount.negative { color: #e74c3c; }
.currency {
  font-weight: 600;
  color:grey;
  font-size: 1rem;
}
.actions-wrapper {
  position: relative;
}
.actions-btn {
  background: transparent;
  border: none;
  padding: 0.1rem 0.3rem;
  color: #7f8c8d;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
}
.actions-btn:hover {
  color: #2c3e50;
}
.actions-menu {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  background: #fff;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.menu-item {
  background: transparent;
  border: none;
  text-align: left;
  padding: 0.6rem 0.85rem;
  font-size: 0.95rem;
  color: #2c3e50;
  cursor: pointer;
  white-space: nowrap;
}
.menu-item:hover {
  background: #f5f6f7;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}
.tag {
  padding: 0.2rem 0.6rem;
  background: #ecf0f1;
  color: #34495e;
  border-radius: 12px;
  font-size: 0.8rem;
}
</style>
