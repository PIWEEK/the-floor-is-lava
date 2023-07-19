<template>
  <canvas ref="canvas"></canvas>
</template>

<style scoped>
canvas {
  aspect-ratio: 16 / 9;
  width: 100vw;
  height: 56.25vw;
  max-height: 100vh;
  max-width: 177.78vh;
  box-shadow: 0px 0px 33px 13px rgba(0,0,0,0.75);
}

</style>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { start, stop } from '~/game/main.js'

const canvas = ref(null)

onMounted(() => start(canvas.value))
onUnmounted(() => stop())
</script>
