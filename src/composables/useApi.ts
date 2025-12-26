// src/composables/useApi.ts - Helper générique pour les appels API
import { ref } from 'vue'
import type { UseApiReturn } from '@/types'
//import { useDailyStore } from '@/dailyStore.ts'

export function useApi(): UseApiReturn {
  //const store = useDailyStore()
  const loading = ref(false)

  const execute = async <T>(apiCall: () => Promise<T>, successMessage = ''): Promise<T> => {
    loading.value = true
    //store.errorMessage = ''

    try {
      const result = await apiCall()
      if (successMessage) {
        //store.errorMessage = successMessage
      }
      return result
    } catch (error) {
      //store.errorMessage = error.message
      console.log(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return { loading, execute }
}
