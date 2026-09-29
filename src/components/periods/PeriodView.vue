<template>
<div class="period-view">
  <svg v-if="period.hidden" class="hidden-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
  <div>
    <h3>{{ period.title }}</h3>
  </div>
  <div>

    <span style="color:cadetblue;">{{ formatDate(period.startDate) }} - {{ formatDate(period.endDate) }}</span>
  </div>
</div>
</template>

<script setup lang="ts">
import type { PeriodDto } from '@/api/generated';

interface props {
  period: PeriodDto
}

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

const { period } = defineProps<props>();
</script>

<style scoped>
.period-view {
  position: relative;
}

.hidden-icon {
  position: absolute;
  top: 0;
  right: 0;
  color: #7f8c8d;
}
</style>
