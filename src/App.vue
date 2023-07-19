<template>
  <Splash v-if="!state" @start="state = true"/>
  <Game v-else/>
</template>

<style scoped>

</style>

<script setup>
import Game from './components/Game.vue'
import Splash from './components/Splash.vue'
import { ref } from 'vue'

const state = ref(false)
</script>

