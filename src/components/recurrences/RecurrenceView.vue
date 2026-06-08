<template>
  <div class="card-layout">
    <div class="card-left">
      <h3>{{ recurrence.title }}</h3>
      <p v-if="recurrence.description" class="desc">{{ recurrence.description }}</p>
    </div>
    <div class="card-right">
      <span class="date">{{ formatDate(recurrence.startDate) }}</span>
      <div class="amount-line">
        <span class="amount">{{ recurrence.amount }}</span>
        <span class="currency">{{ recurrence.currencyCode }}</span>
      </div>
    </div>
  </div>
  <div v-if="recurrence.tags?.length">
    <span v-for="tag in recurrence.tags" :key="tag.id">
      <img class="tag-icon" :src="`${uploadsUrl}/${tag!.icon}`" />
    </span>
  </div>
  <div style="text-align: right;">
    {{ frequencyLabel }}
  </div>
</template>

<script setup lang="ts">
import type { RecurrenceDto } from '@/api/generated';
import { computed } from 'vue';

interface props {
  recurrence: RecurrenceDto
}

const uploadsUrl = import.meta.env.VITE_UPLOADS_URL;

const { recurrence } = defineProps<props>();

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const frequencyLabel = computed(() => {
  const labels: Record<string, string> = {
    DAILY: 'Quotidien',
    WEEKLY: 'Hebdomadaire',
    MONTHLY: 'Mensuel',
    QUARTERLY: 'Trimestriel',
    YEARLY: 'Annuel',
    NONE: 'Aucun',
  };
  return labels[recurrence.frequency] ?? recurrence.frequency;
});
</script>

<style scoped>
.card-layout {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.15rem;
}
.card-left { flex: 1; }
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
.currency {
  font-weight: 600;
  color: black;
  font-size: 1rem;
}
.tag-icon {
  margin-left: 0.25rem;
  border-radius: 3px;
  width: 20px;
  height: 20px;
  object-fit: contain;
}
</style>
