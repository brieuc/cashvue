import type { User } from "@/types/user"
import { defineStore } from "pinia"
import { computed, ref } from "vue"

const STORAGE_KEY = 'auth_token_cashtag';

// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(STORAGE_KEY))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  const setSession = (tkn: string, u: User) => {
    localStorage.setItem(STORAGE_KEY, tkn);
    token.value = tkn
    user.value = u
  }

  const clear = () => {
    token.value = null
    user.value = null
  }

  return { token, user, isAuthenticated, setSession, clear }
})
