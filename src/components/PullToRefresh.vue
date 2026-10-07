<template>
  <div ref="root" class="pull-root"
    @touchstart.passive="onTouchStart" @touchmove="onTouchMove"
    @touchend="onTouchEnd" @touchcancel="onTouchEnd">
    <div class="pull-indicator" :class="{ animating: !pulling }" :style="{ height: pullDistance + 'px' }">
      <div v-if="pullDistance > 0" class="pull-spinner" :class="{ spinning: isRefreshing }"
        :style="isRefreshing ? undefined : { transform: `rotate(${pullDistance * 4}deg)`, opacity: Math.min(pullDistance / THRESHOLD, 1) }"
        aria-label="Refreshing"></div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const THRESHOLD = 70 // px à tirer avant de déclencher le refresh
const MAX_PULL = 120
const RESISTANCE = 0.5
const REFRESH_DISPLAY_MS = 500 // durée d'affichage du spinner après le relâchement

const emit = defineEmits<{ refresh: [] }>()

const root = ref<HTMLElement | null>(null)
const pullDistance = ref(0)
const isRefreshing = ref(false)
const pulling = ref(false)
let startY = 0

const onTouchStart = (e: TouchEvent) => {
  if (isRefreshing.value || (root.value?.scrollTop ?? 0) > 0) return
  startY = e.touches[0].clientY
  pulling.value = true
}

const onTouchMove = (e: TouchEvent) => {
  if (!pulling.value) return
  const delta = e.touches[0].clientY - startY
  if (delta <= 0 || (root.value?.scrollTop ?? 0) > 0) {
    pullDistance.value = 0
    return
  }
  if (e.cancelable) e.preventDefault() // bloque le scroll natif pendant le tirage
  pullDistance.value = Math.min(delta * RESISTANCE, MAX_PULL)
}

const onTouchEnd = () => {
  if (!pulling.value) return
  pulling.value = false
  if (pullDistance.value < THRESHOLD) {
    pullDistance.value = 0
    return
  }
  isRefreshing.value = true
  pullDistance.value = THRESHOLD
  emit('refresh')
  setTimeout(() => {
    isRefreshing.value = false
    pullDistance.value = 0
  }, REFRESH_DISPLAY_MS)
}
</script>

<style scoped>
.pull-root {
  overscroll-behavior-y: contain;
}
.pull-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.pull-indicator.animating {
  transition: height 0.2s;
}
.pull-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #d6e9f8;
  border-top-color: #5dade2;
  border-radius: 50%;
}
.pull-spinner.spinning {
  animation: pull-spin 0.7s linear infinite;
}
@keyframes pull-spin {
  to { transform: rotate(360deg); }
}
</style>
