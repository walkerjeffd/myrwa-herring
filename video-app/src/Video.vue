<template>
  <div>
    <h2>Video</h2>
    <p>
      <router-link to="/">Home</router-link>
      <router-link to="/instructions">Instructions</router-link>
    </p>
    <div id="video-container" >
      <video id="video" class="video-js"></video>
    </div>
    <div>
      <router-link to="/count" tag="button">Enter Your Count</router-link>
    </div>
  </div>
</template>

<script>
import videojs from 'video.js'
import config from './config'

export default {
  name: 'video',
  props: ['video', 'loadVideo'],
  watch: {
    video: function () {
      console.log('Video:watch:video');
      if (this.video) {
        this.player.src({type: 'video/mp4', src: this.video.url});
        this.player.load();
      }
    }
  },
  mounted: function () {
    console.log('Video:mounted');
    const vm = this;

    videojs('video', {
        controls: true,
        autoplay: false,
        width: 640,
        height: 480,
        playbackRates: [0.1, 0.25, 0.5, 1]
      }).ready(function () {
        vm.player = this;
        vm.loadVideo();
      });
  },
  beforeDestroy: function () {
    console.log('Video:beforeDestroy');
    this.player.dispose();
  }
};
</script>

<style scoped>
</style>
