<template>
<div>
  <h3>{{ period.title }}</h3>
</div>
<div>

  <span style="color:cadetblue;">{{ formatDate(period.startDate) }} - {{ formatDate(period.endDate) }}</span>
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
