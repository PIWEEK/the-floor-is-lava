<template>
<div class="hero">

  <button class="start" @click="emit('start')">Start</button>
  <div class="sound-control">
    Sound control
    <div>Music</div>
    <label for="music-yes">yes</label>
    <input name="music" id ="music-yes" type="radio">
    <label for="music-no">no</label>
    <input name="music" id="music-no" type="radio">

    <div>Sound</div>
    <label for="sound-yes" >yes</label>
    <input  id="sound-yes" name="sound" type="radio">
    <label for="sound-no" >no</label>
    <input  id="sound-no" name="sound" type="radio">
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
const emit = defineEmits(["start"])
const mi_variable = 0
</script>
