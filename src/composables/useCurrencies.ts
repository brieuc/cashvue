import { getCurrencies, type CurrencyDto, type GetCurrenciesParams } from "@/api/generated";
import { ref } from "vue";

export function useCurrencies() {

  const currencies = ref<CurrencyDto[]>([]);

  const fetchCurrencies = async (params : GetCurrenciesParams) => {
    getCurrencies(params).then(response => {
      currencies.value = response.data.content || [];
    });
  }

  return { currencies, fetchCurrencies };
}
