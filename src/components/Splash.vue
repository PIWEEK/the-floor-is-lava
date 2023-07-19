<template>
  <div class="hero">
    <div class="buttons">
      <button class="start" @click="emit('start')">Play</button>
      <button class="reload" @click="emit('start')">Restart</button>
      <div class="sound-control">
        <button @click="music = !music">
          <VolumeOn v-if="music" />
          <VolumeOff v-else />
        </button>
      </div>
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
  box-shadow: 0px 0px 33px 13px rgba(0, 0, 0, 0.75);
  background-image: url('/images/intro.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  position: relative;
}

.buttons {
  position: absolute;
  bottom: 20%;
  left: 10%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1.5rem;
}
.sound-control svg {
  font-size: 4rem;
  stroke: #FFEFDF;
  fill: none;
  background-color: transparent;
  height: 2.5rem;
  width: 2.5rem;
}

.sound-control button {
  border: none;
  background-color: transparent;
}
.start,
.reload {
  font-size: 2.5rem;
  color: #FFEFDF;
  font-family: sans-serif;
  border: none;
  background-color: transparent;
  text-transform: uppercase;
}
.reload {
  bottom: 21%;
}
</style>

<script setup>
import { ref, watch } from 'vue'
import VolumeOff from '~/components/icons/VolumeOff.vue'
import VolumeOn from '~/components/icons/VolumeOn.vue'

const emit = defineEmits(['start'])
const music = ref(localStorage.getItem('music') === 'true' ?? true)

watch(music, (newValue, oldValue) => {
  localStorage.setItem('music', newValue)
})
</script>
