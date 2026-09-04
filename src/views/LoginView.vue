<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="onSubmit">

      <label for="username">Username</label>
      <input id="username" v-model="username" type="text" autocomplete="username" required />

      <label for="password">Password</label>
      <input id="password" v-model="password" type="password" autocomplete="current-password" required />

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Connection...' : 'Connect' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const { doLogin } = useAuth()
const route = useRoute()
const router = useRouter()

const onSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    const success = await doLogin({ username: username.value, password: password.value })
    if (!success) {
      error.value = 'Incorrect login'
      return
    }

    const redirect = route.query.redirect
    router.push(typeof redirect === 'string' ? redirect : '/')
  } catch {
    error.value = 'Incorrect password'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.login-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 20rem;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.login-card h1 {
  margin: 0 0 1rem;
  font-size: .25rem;
  text-align: center;
}

.login-card input {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.login-card button {
  margin-top: 1rem;
  padding: 0.6rem;
  cursor: pointer;
}

.error {
  color: #c00;
  font-size: 0.9rem;
  margin: 0;
}
</style>
