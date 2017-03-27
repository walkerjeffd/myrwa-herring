<template>
  <div>
    <h2>Watch Video</h2>
    <div id="video-container" >
      <video id="video" class="video-js"></video>
    </div>
    <router-view :video="video" :load-video="loadVideo"></router-view>
  </div>
</template>

<script>
import videojs from 'video.js'

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
