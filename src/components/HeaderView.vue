<template>
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 1rem;">
      <span><h2>{{ nbEntries }} entrées</h2></span>
      <span><h2>{{ formatAmount(totalAmount, currency) }}</h2></span>
    </div>
</template>

<script setup lang="ts">
import { type TagDto, type PeriodDto, type ComputationRequestDto, updateEntry } from '@/api/generated';
import { useComputation } from '@/composables/useComputation';
import { onMounted, ref, watch } from 'vue';

/*
const selectedPeriod = ref<PeriodDto>();
const selectedTags = ref<TagDto[]>([]);
*/

interface Props {
  selectedPeriod : PeriodDto | undefined,
  selectedTags : TagDto[],
  entriesUpdated : number
}

const { fetchComputation, computationResponse } = useComputation();

const { selectedPeriod, selectedTags, entriesUpdated } = defineProps<Props>();

const totalAmount = ref<number>(0.0);
const currency = ref<string>("");
const nbEntries = ref<number>();

watch(computationResponse, (computationResponse) => {
  if (computationResponse) {
    totalAmount.value = (computationResponse.totalAmount ?? 0.0) < 0.0 ?
      (computationResponse.totalAmount ?? 0.0) * -1.0 : (computationResponse.totalAmount ?? 0.0);
    currency.value = computationResponse.targetCurrencyCode ?? "";
    nbEntries.value = computationResponse.numberOfEntries;
  }
});

watch(() => entriesUpdated, () => {
  getComputation(selectedPeriod, selectedTags);
});

watch(() => selectedPeriod, (period) => {
  getComputation(period, selectedTags);
});

watch(() => selectedTags, (tags) => {
  getComputation(selectedPeriod, tags);
})

// For an obscure reason, the fr-FR local doesn't manage the quote correctly and the currency code
// which should be before the amount.
const formatAmount = (amount: number, currencyCode: string, locale = 'de-CH') => {
  if (!currencyCode)
    return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount)
}

const getComputation = (period : PeriodDto | undefined, selectedTags : TagDto[]) => {
  if (!period)
    return;

  console.log("HeaderView tags " + selectedTags.length);
  console.log("headerview tags" + JSON.stringify(selectedTags[0]));
  const request : ComputationRequestDto = {
    startDate: period.startDate,
    endDate: period.endDate,
    tags: selectedTags,
    targetCurrencyCode: "CHF"
  }
  fetchComputation(request);
}
/*
onMounted(() => {
  getComputation(selectedPeriod, selectedTags);
});
*/

</script>
