<template>
<div class="header-bar">
  <h1>Currencies</h1>
  <button class="add-btn" @click="showModal = true">+</button>
</div>
<div v-if="showModal">
  <CurrencyModal @submit="handleSubmit" @close="showModal = false"></CurrencyModal>
</div>
<div class="card" v-for="currency in currencies" v-bind:key="currency.code" @click="selectCurrency(currency)">
  <CurrencyView :currency="currency"></CurrencyView>
</div>
</template>

<script setup lang="ts">
import { useCurrencies } from '@/composables/useCurrencies';
import CurrencyView from './CurrencyView.vue';
import CurrencyModal from './CurrencyModal.vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { CurrencyDto } from '@/api/generated';

const { currencies, fetchCurrencies, addCurrency } = useCurrencies();
const router = useRouter();
const showModal = ref<boolean>(false);

const handleSubmit = (currency: CurrencyDto) => {
  addCurrency(currency).then(response => {
    if (response.status === 201) {
      currencies.value.push(response.data);
    }
  });
  showModal.value = false;
};

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
.add-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #2980b9;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
</style>
