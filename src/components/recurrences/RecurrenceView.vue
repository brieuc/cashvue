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
