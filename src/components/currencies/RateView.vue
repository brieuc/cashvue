<template>
<div>
  <h3>{{ formatDate(rate.valueDate) }}</h3>
</div>
<div>
  <span style="color:cadetblue;">1 {{ rate.targetCurrencyCode }} = {{ Math.round(10000 / rate.rate) / 10000 }} {{ rate.sourceCurrencyCode }}</span>
</div>
</template>

<script setup lang="ts">
import type { RateDto } from '@/api/generated';

interface props {
  rate: RateDto
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  if (dateString.startsWith('1000-01-01')) return 'Taux initial'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const { rate } = defineProps<props>();
</script>
