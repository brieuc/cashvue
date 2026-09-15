<template>
  <div class="header-panel">
    <span><h2>{{ nbEntries }} entrées</h2></span>
    <span><h2>{{ formatAmount(totalAmount, currency) }}</h2></span>
  </div>
</template>

<script setup lang="ts">
import { formatAmount } from '@/utils/formatAmount';

interface Props {
  nbEntries: number | undefined,
  totalAmount: number,
  currency: string,
}

defineProps<Props>();
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

.header-panel h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}
</style>
