// src/composables/useApi.js - Helper générique pour les appels API
import { ref } from 'vue'
//import { useDailyStore } from '@/dailyStore.js'

export function useApi() {
  //const store = useDailyStore()
  const loading = ref(false)

  const execute = async (apiCall, successMessage = '') => {
    loading.value = true
    //store.errorMessage = ''

    try {
      const result = await apiCall()
      if (successMessage) {
        //store.errorMessage = successMessage
      }
      return result
    } catch (error) {
      //store.errorMessage = error.message¨
      console.log(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return { loading, execute }
}
