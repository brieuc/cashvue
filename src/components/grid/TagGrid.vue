<template>
  <div class="tag-grid-view">
    <p v-if="!tagAmounts?.length" class="empty">Aucun montant</p>
    <div v-else class="grid">
      <div v-for="item in sortedTagAmounts" :key="item.tag?.id" class="card" @click="selectTagAmount(item)">
        <img v-if="item.tag?.icon" class="tag-icon" :src="`${uploadsUrl}/${item.tag.icon}`" />
        <h3>{{ item.tag?.title }}</h3>
        <div class="amount-line">
          <span class="amount" :class="(item.amount ?? 0) >= 0 ? 'positive' : 'negative'">{{ formatAmount(absoluteAmount(item.amount), targetCurrencyCode) }}</span>
        </div>
      </div>
    </div>

    <div class="fab-wrapper">
      <button class="toggle-btn" @click="emit('toggleView')" aria-label="Voir les entrées">≡</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useComputation } from '@/composables/useComputation'
import { formatAmount } from '@/utils/formatAmount'
import type { ComputationRequestDto, TagAmountDto, TagDto } from '@/api/generated'

const uploadsUrl = import.meta.env.VITE_UPLOADS_URL;

const { tags, startDate, endDate, searchText, targetCurrencyCode } = defineProps<{
  tags: TagDto[];
  startDate: string;
  endDate: string;
  searchText: string;
  targetCurrencyCode: string;
}>();

const emit = defineEmits<{
  toggleView: [];
}>();

const selectedTag = defineModel<TagDto>();

const { fetchTagAmounts, tagAmounts } = useComputation();

const absoluteAmount = (amount: number | undefined) => {
  const value = amount ?? 0.0
  return value < 0.0 ? value * -1.0 : value;
};

const selectTagAmount = (tagAmountDto: TagAmountDto) => {
  if (tagAmountDto.tag)
    selectedTag.value = tagAmountDto.tag;
};

const sortedTagAmounts = computed(() => {
  if (!tagAmounts.value) return [];
      return [...tagAmounts.value].sort((a, b) => Number(a.amount ?? 0) - Number(b.amount ?? 0));
});

watchEffect(async () => {
  const request: ComputationRequestDto = {
    startDate: startDate,
    endDate: endDate,
    tags: tags,
    searchText: searchText,
    targetCurrencyCode: targetCurrencyCode,
  };
  await fetchTagAmounts(request);
});
</script>

<style scoped>
.tag-grid-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  margin: 0 auto;
  padding: 0.75rem;
}
.empty {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}
.grid {
  display: grid;
  gap: 0.6rem;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
}
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
  background: #fff;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 0.75rem 0.5rem;
  transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.tag-icon {
  border-radius: 4px;
  width: 32px;
  height: 32px;
  object-fit: contain;
}
h3 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  color: #2c3e50;
  overflow-wrap: break-word;
  word-break: break-word;
}
.amount-line {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  align-items: center;
}
.amount {
  font-weight: 600;
  font-size: 1rem;
  color: #2c3e50;
}
.amount.positive { color: #27ae60; }
.amount.negative { color: #0c0a22; }
.fab-wrapper {
  position: sticky;
  bottom: 0.25rem;
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  padding-right: 0.25rem;
  pointer-events: none;
}
.toggle-btn {
  pointer-events: auto;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ecf0f1;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  transition: background 0.2s;
}
.toggle-btn:hover {
  background: #dfe4e6;
}
</style>
