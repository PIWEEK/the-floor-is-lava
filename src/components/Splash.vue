<template>
  <div class="hero">
    <button class="start" @click="emit('start')">Start</button>
    <div class="sound-control">
      <button @click="music = !music">
        <p v-if="music">on</p>
        <p v-else>off</p>
      </button>
    </div>
  </div>
</template>

<style scoped>
.hero {
  aspect-ratio: 16 / 9;
  width: 100vw;
  height: 56.25vw;
  max-height: 100vh;
  max-width: 177.78vh;
  box-shadow: 0px 0px 33px 13px rgba(0,0,0,0.75);
  background-image: url("/images/intro.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}
.sound-control {
  background-color: gray;
}
.start {
  width: 300px;
  height: 100px;
}
</style>

<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(["start"])
const music = ref(localStorage.getItem("music") === "true" ?? true)

watch(music, (newValue, oldValue) => {
  localStorage.setItem("music", newValue)
})
</script>
