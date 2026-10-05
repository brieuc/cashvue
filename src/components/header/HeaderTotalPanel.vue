<template>
  <div class="header-panel">
    <span>
      <h2>{{ nbEntries }} entrées</h2>
      <small v-if="startDate && endDate" class="header-range">{{ formatDay(startDate) }} → {{ formatDay(endDate) }}</small>
    </span>
    <span><h2>{{ formatAmount(totalAmount, currency) }}</h2></span>
  </div>
</template>

<script setup lang="ts">
import { formatAmount } from '@/utils/formatAmount';

interface Props {
  nbEntries: number | undefined,
  totalAmount: number,
  currency: string,
  startDate?: string,
  endDate?: string,
}

defineProps<Props>();

// "YYYY-MM-DD[THH:mm...]" -> "DD.MM.YYYY" (sans passer par Date, pour éviter tout décalage de fuseau)
const formatDay = (date: string): string => {
  const [year, month, day] = date.slice(0, 10).split('-');
  return `${day}.${month}.${year}`;
};
</script>

<style scoped>
.header-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 0.75rem;
  color: #fff;
}

.header-range {
  display: block;
  font-size: 0.65rem;
  opacity: 0.7;
}

.header-panel h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}
</style>
