<template>
  <div class="header-panel">
    <div class="header-panel-label">jusqu'à aujourd'hui</div>
    <div class="header-panel-row">
      <span><h2>{{ nbEntries }} entrées</h2></span>
      <span><h2>{{ formatAmount(totalAmount, currency) }}</h2></span>
    </div>
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
  flex-direction: column;
  justify-content: center;
  gap: 0.1rem;
  height: 100%;
  padding: 0 0.75rem;
  color: #fff;
}

.header-panel-label {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.75);
}

.header-panel-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-panel-row h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}
</style>
