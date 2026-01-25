<template>
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 1rem;">
      <span><h2>{{ nbEntries }} entrées</h2></span>
      <span><h2>{{ currency }} {{ totalAmount }}</h2></span>
    </div>
</template>

<script setup lang="ts">
import { type TagDto, type PeriodDto, type ComputationRequestDto } from '@/api/generated';
import { useComputation } from '@/composables/useComputation';
import { onMounted, ref, watch } from 'vue';

/*
const selectedPeriod = ref<PeriodDto>();
const selectedTags = ref<TagDto[]>([]);
*/

interface Props {
  selectedPeriod : PeriodDto | undefined,
  selectedTags : TagDto[]
}

const { fetchComputation, computationResponse } = useComputation();

const { selectedPeriod, selectedTags } = defineProps<Props>();

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

watch(() => selectedPeriod, (period) => {
  getComputation(period, selectedTags);
});

watch(() => selectedTags, (tags) => {
  getComputation(selectedPeriod, tags);
})

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
