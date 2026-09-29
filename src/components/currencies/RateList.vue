<template>
<div class="header-bar">
  <h1>{{ currencyCode }}</h1>
  <button class="add-btn" @click="showModal = true">+</button>
</div>
<div v-if="showModal">
  <RateModal :rate="selectedRate" :source-currency-code="currencyCode" :target-currency-code="referenceCurrency?.code" @submit="handleSubmit" @delete="handleDelete" @close="close"></RateModal>
</div>
<div class="card" v-for="rate in rates" v-bind:key="rate.id" @click="selectRate(rate)">
  <RateView :rate="rate"></RateView>
</div>
</template>

<script setup lang="ts">
import { useRates } from '@/composables/useRates';
import RateView from './RateView.vue';
import { computed, onMounted, ref } from 'vue';
import RateModal from './RateModal.vue';
import { useRoute } from 'vue-router';
import type { RateDto } from '@/api/generated';
import { useCurrencies } from '@/composables/useCurrencies.ts';

// impossible d'avoir des props, c'est lancé depuis le routeur
/*
interface props {
  targetCurrencyCode: string
}
const { targetCurrencyCode } = defineProps<props>();
*/

const { fetchReferenceCurrency, referenceCurrency } = useCurrencies();
const route = useRoute();
const currencyCode = computed(() => route.params.code as string);

const { rates, fetchRatesByCurrency, addRate, editRate, removeRate } = useRates();
const selectedRate = ref<RateDto>();
const showModal = ref<boolean>(false);

const selectRate = (rate: RateDto) => {
  showModal.value = true;
  if (rate) {
    selectedRate.value = rate;
  }
};

const handleSubmit = (rate: RateDto) => {
  if (rate.id) {
    editRate(rate.id, rate).then(response => {
      if (response.status === 200) {
        const index = rates.value.findIndex(r => rate.id === r.id);
        if (index !== -1) {
          rates.value[index] = response.data;
        }
      }
    })
  }
  else {
    addRate(rate).then(response => {
    if (response.status === 201) {
      const newRate = response.data;
      rates.value.unshift(newRate)
    }
  });}

  showModal.value = false;
  selectedRate.value = undefined;
};

const handleDelete = (id: number) => {
  removeRate(id).then(response => {
    if (response.status === 204) {
      rates.value = rates.value.filter(r => r.id !== id);
    }
  });
  close();
};

const close = () => {
  showModal.value = false;
  selectedRate.value = undefined;
};

onMounted(() => {
  fetchRatesByCurrency(currencyCode.value);
  fetchReferenceCurrency();
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
  background: #57afea;
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
