<template>
  <header>

    <div>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/tags">Tags</RouterLink>
        <RouterLink to="/periods">Periods</RouterLink>
        <RouterLink to="/recurrency">Periods</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />


</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router'

  onMounted(() => {
    setTimeout(() => {
      window.scrollTo({ top: 40, behavior: 'smooth'})
    }, 100)
  })

</script>

<style scoped>
  nav a {
    margin-right: 1rem;
  }

  nav a:last-child {
    margin-right: 0;
  }
</style>
