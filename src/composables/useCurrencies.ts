import { createCurrency, getCurrencies, getReferenceCurrency, type CurrencyDto } from "@/api/generated";
import { ref } from "vue";

export function useCurrencies() {

  const currencies = ref<CurrencyDto[]>([]);
  const referenceCurrency = ref<CurrencyDto>();

  const fetchCurrencies = async () => {
    getCurrencies().then(response => {
      currencies.value = response.data || [];
    });
  }

  const fetchReferenceCurrency = async () => {
    getReferenceCurrency().then(response => {
      referenceCurrency.value = response.data || undefined;
    })
  };

  const addCurrency = async (currency: CurrencyDto) => {
    return createCurrency(currency);
  };

  return { currencies, addCurrency, fetchCurrencies, fetchReferenceCurrency, referenceCurrency };
}
