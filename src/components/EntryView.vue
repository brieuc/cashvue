<template>
  <div class="card-layout">
    <div class="card-left">
      <h3>{{ entry.title }}</h3>
      <p v-if="entry.description" class="desc">{{ entry.description }}</p>
    </div>
    <div class="card-right">
      <span class="date">{{ formatDate(entry.accountingDate) }}</span>
      <div class="amount-line">
        <span class="amount">{{ entry.amount }}</span>
        <span class="currency">{{ entry.currencyCode }}</span>
      </div>
    </div>
  </div>
  <div v-if="entry.tags?.length" class="tags">
    <span v-for="tag in entry.tags" :key="tag.id" class="tag">#{{ tag.title }}</span>
  </div>
</template>


<script setup lang="ts">
import type { EntryDto } from '@/api/generated';

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

defineProps<props>();
</script>

<style>
.card {
  background: #fff;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
  transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.card-layout {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.card-left {
  flex: 1;
}
.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}
.date {
  font-size: 0.85rem;
  color: #7f8c8d;
}
.desc {
  font-size: 0.9rem;
  color: #5a6c7d;
  margin: 0;
}
.amount-line {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}
.amount {
  font-weight: 600;
  font-size: 1.25rem;
  color: #2c3e50;
}
.currency {
  font-weight: 600;
  color: #27ae60;
  font-size: 1rem;
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
