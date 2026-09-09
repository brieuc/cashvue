<template>
  <span class="app-version">v{{ appVersion }}</span>
  <header>

    <div>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/tags">Tags</RouterLink>
        <RouterLink to="/periods">Periods</RouterLink>
        <RouterLink to="/recurrences">Recurrences</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />


</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router'

  const appVersion = __APP_VERSION__

  onMounted(() => {
    setTimeout(() => {
      window.scrollTo({ top: 40, behavior: 'smooth'})
    }, 100)
  })

</script>

<style scoped>
  .app-version {
    position: fixed;
    top: 0;
    left: 1px;
    font-size: 0.5rem;
    opacity: 0.5;
    z-index: 1000;
    pointer-events: none;
  }

  nav a {
    margin-right: 1rem;
  }

  nav a:last-child {
    margin-right: 0;
  }
</style>
