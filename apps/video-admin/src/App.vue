<template>
  <div id="app">
    <div>
      Select video:
      <select v-model="selected">
        <option v-for="row in videos.data" v-bind:value="row.url">
          {{ row.filename }}
        </option>
      </select>
    </div>
    <div style="margin-top:20px">
      <span>Selected: <a v-bind:href="selected" target="_blank">{{ selected }}</a></span>
    </div>
    <div class="video-container" style="margin-top:20px">
      <video id="video" class="video-js vjs-big-play-centered"></video>
    </div>
  </div>
</template>

<script>
var d3 = require('d3-request');
var config = require('../../../config');
import videojs from 'video.js'

export default {
  name: 'app',
  data () {
    return {
      videos: {
        url: config.api.url + '/videos/?location=UML'
      },
      selected: ''
    }
  },
  watch: {
    selected: function () {
      console.log('watch:selected', this.selected);
      this.player.src({type: 'video/mp4', src: this.selected});
      this.player.load();
    }
  },
  mounted: function () {
    console.log('app:mounted');

    const vm = this;

    videojs('video', {
        controls: true,
        autoplay: false,
        width: 800,
        height: 600,
        playbackRates: [0.1, 0.25, 0.5, 1]
      }).ready(function () {
        vm.player = this;
      });

    d3.json(this.videos.url)
      .get((response) => {
        this.$set(this.videos, 'data', response.data);
        console.log(response);
      })
  }
}
</script>

<style scoped>
.btn {
  width: 20px;
  height: 20px;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  padding: 5px;
  margin: 2px;
  border: 2px solid #999;
  color: #999;
  font-family: sans-serif;
}

.btn:hover {
  background: #EEE;
  cursor: pointer;
}

.btn.active {
  border: 2px solid black;
  color: black;
  background-color: #EEE;
}
</style>
