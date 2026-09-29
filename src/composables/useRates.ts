import { createRate, deleteRate, getRatesByCurrency, updateRate, type RateDto } from "@/api/generated";
import { ref } from "vue";

const rates = ref<RateDto[]>([]);

export function useRates() {

  const fetchRatesByCurrency = async (currencyCode: string) => {
    const response = await getRatesByCurrency(currencyCode);
    if (response.status === 200) {
      rates.value = response.data || [];
    }
  };

  const fetchLatestRate = async (currencyCode: string): Promise<RateDto | undefined> => {
    const response = await getRatesByCurrency(currencyCode);
    if (response.status === 200) {
      return response.data?.[0];
    }
  };

  const addRate = (rate: RateDto) => {
    return createRate(rate);
  };

  const editRate = (id: number, rate: RateDto) => {
    return updateRate(id, rate);
  };

  const removeRate = (id: number) => {
    return deleteRate(id);
  };

  return { rates, fetchRatesByCurrency, fetchLatestRate, addRate, editRate, removeRate };
}
