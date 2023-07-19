<template>
  <div ref="hero" class="hero" :class="{ 'fade-out': transition === 'out', 'fade-in': transition === 'in' }">
    <h1>The<br>Floor<br>Is<br>Lava</h1>
    <div class="buttons">
      <button class="start button" @click="onPlay">Play</button>
      <!-- <button class="reload button" @click="emit('start')">Restart</button> -->
      <div class="sound-control">
        <button @click="music = !music">
          <VolumeOn v-if="music" />
          <VolumeOff v-else />
        </button>
      </div>
    </div>
    <div class="keyboard">
      <SplashKeyboard />
    </div>
    <div class="touch">
      <SplashTouch />
    </div>
  </div>
</template>

<style scoped>
h1 {
  position: absolute;
  font-size: 6rem;
  top: 10%;
  left: 10%;
  line-height: 6rem;
  color: #FFD2C6;
}

.keyboard {
  position: absolute;
  top: 0%;
  right: 0%;
  width: 100%;
  max-width: 64rem;
}

.touch {
  position: absolute;
  bottom: 0%;
  right: 0%;
  width: 100%;
  max-width: 32rem;
}

.hero {
  aspect-ratio: 16 / 9;
  width: 100vw;
  height: 56.25vw;
  max-height: 100vh;
  max-width: 177.78vh;
  box-shadow: 0px 0px 33px 13px rgba(0, 0, 0, 0.75);
  background-image: url('/images/background.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
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

.button {
  font-size: 2.5rem;
  color: #FFEFDF;
  font-family: Corben;
  border: none;
  background-color: transparent;
  text-transform: uppercase;
}

.button:hover {
  color: #FFF;
}

.sound-control svg {
  font-size: 4rem;
  stroke: #FFEFDF;
  fill: none;
  background-color: transparent;
  height: 2.5rem;
  width: 2.5rem;
}

.sound-control svg:hover {
  stroke: #FFF;
}

.sound-control button {
  border: none;
  background-color: transparent;
}

.fade-in > h1,
.fade-in > .buttons,
.fade-in > .keyboard,
.fade-in > .touch {
  transition: opacity 1s ease-out;
  opacity: 1;
}

.fade-out > h1,
.fade-out > .buttons,
.fade-out > .keyboard,
.fade-out > .touch {
  transition: opacity 1s ease-out;
  opacity: 0;
}

</style>

<script setup>
import { onMounted, ref, watch } from 'vue'
import VolumeOff from '~/components/icons/VolumeOff.vue'
import VolumeOn from '~/components/icons/VolumeOn.vue'
import SplashKeyboard from '~/components/SplashKeyboard.vue'
import SplashTouch from '~/components/SplashTouch.vue'

const hero = ref(null)
const transition = ref(null)
const emit = defineEmits(['start'])
const music = ref(localStorage.getItem('music') === 'true' ?? true)

watch(music, (newValue, oldValue) => {
  localStorage.setItem('music', newValue)
})

function onPlay() {
  transition.value = 'out'
  hero.value.ontransitionend = () => emit('start')
}
</script>
