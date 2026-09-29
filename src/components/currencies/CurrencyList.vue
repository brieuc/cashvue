<template>
<div class="header-bar">
  <h1>Currencies</h1>
</div>
<div class="card" v-for="currency in currencies" v-bind:key="currency.code" @click="selectCurrency(currency)">
  <CurrencyView :currency="currency"></CurrencyView>
</div>
</template>

<script setup lang="ts">
import { useCurrencies } from '@/composables/useCurrencies';
import CurrencyView from './CurrencyView.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { CurrencyDto } from '@/api/generated';

const { currencies, fetchCurrencies } = useCurrencies();
const router = useRouter();

const selectCurrency = (currency: CurrencyDto) => {
  router.push(`/currencies/${currency.code}`);
};

onMounted(() => {
  fetchCurrencies();
});
</script>

<style scoped>
.card {
  border-bottom: 0.1px solid #e1e8ed;
  padding: 1rem;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
</style>
