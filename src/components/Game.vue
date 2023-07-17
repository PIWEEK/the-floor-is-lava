<template>
  <canvas ref="canvas"></canvas>
</template>

<style scoped>
canvas {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;

  box-shadow: 0px 0px 33px 13px rgba(0,0,0,0.75);
}

/*
@media (min-aspect-ratio: 16 / 9) {
  canvas {
    width: auto;
    height: 100%;
  }
}
*/
</style>

<script setup>
import { ref, onMounted } from 'vue'
import main from '~/game/main.js'

const canvas = ref(null)

onMounted(() => main(canvas.value))
</script>
