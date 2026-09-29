<template>
<div>
  <h3>{{ currency.code }}</h3>
</div>
<div>
  <span v-if="currency.reference" style="color:cadetblue;">Devise de référence</span>
  <span v-else-if="latestRate" style="color:cadetblue;">
    1 {{ latestRate.targetCurrencyCode }} = {{ Math.round(10000 / latestRate.rate) / 10000 }} {{ latestRate.sourceCurrencyCode }}
  </span>
  <span v-else style="color:cadetblue;">Aucun taux connu</span>
</div>
</template>

<script setup lang="ts">
import type { CurrencyDto, RateDto } from '@/api/generated';
import { useRates } from '@/composables/useRates';
import { onMounted, ref } from 'vue';

interface props {
  currency: CurrencyDto
}

const { currency } = defineProps<props>();
const { fetchLatestRate } = useRates();

const latestRate = ref<RateDto>();

onMounted(async () => {
  if (!currency.reference) {
    latestRate.value = await fetchLatestRate(currency.code);
  }
});
</script>
