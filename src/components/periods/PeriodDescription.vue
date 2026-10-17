<template>
<div class="period-description">{{ description }}</div>
</template>

<script setup lang="ts">
interface props {
  description: string
}

const { description } = defineProps<props>();
</script>

<style scoped>
.period-description {
  max-height: 40vh;
  overflow-y: auto;
  /* Le défilement du panneau ne doit pas entraîner la page */
  overscroll-behavior: contain;
  padding: 0.75rem 1rem;
  background: white;
  border-bottom: 1px solid #e1e8ed;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  font-size: 0.9rem;
  color: #2c3e50;
  overflow-wrap: break-word;
  word-break: break-word;
  /* La description est stockée avec ses \n (saisis dans le <textarea> de
     PeriodModal) ; par défaut ils sont collapsés au rendu. pre-line les
     respecte tout en laissant les lignes longues revenir à la ligne. */
  white-space: pre-line;
}
</style>
