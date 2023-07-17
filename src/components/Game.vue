<template>
  <canvas ref="canvas"></canvas>
</template>

<style scoped>
.canvas {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}

@media (min-aspect-ratio: 16 / 9) {
  .canvas {
    width: auto;
    height: 100%;
  }
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import main from '~/game/main.js'

const canvas = ref(null)

onMounted(() => main(canvas.value))
</script>
