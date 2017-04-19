<template>
  <div id="app">
    <div class="video-container">
      <video id="video" class="video-js vjs-big-play-centered"></video>
    </div>
    <div class="view-container">
      <router-view :video="video" :load-video="loadVideo" :session="session"></router-view>
    </div>
  </div>
</template>

<script>
import videojs from 'video.js'
import videojsOverlay from 'videojs-overlay'
import config from '../../../config'
import queryString from 'query-string'

// https://gist.github.com/jed/982883
var uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)};

export default {
  name: 'app',
  data: function () {
    return {
      session: uuid(),
      video: undefined,
      query: {
        data: undefined
      }
    }
  },
  created: function () {
    console.log('app:created');

    if (location.search) {
      var qry = queryString.parse(location.search);

      if (qry) {
        this.$set(this.query, 'data', qry);
      }
    }
  },
  mounted: function () {
    console.log('app:mounted');
    const vm = this;

    var tips = "<div class=\"counting-tips\">" +
      "<h2>Counting Tips</h2>" +
      "<ol>" +
        "<li>Only count fish that swim completely out of view across the left edge of the video (going upstream), including any you might see at the start of the video</li>" +
        "<li>If a fish swims into the video from the left side (going downstream), subtract it</li>" +
        "<li>If you don't see any fish, submit a count of zero</li>" +
        "<li>Use pause, slow down, or full screen if there are too many fish to count</li>" +
      "</ol>" +
      "See <a class=\"vjs-overlay-link\" href=\"/video/instructions\">Instructions</a> page for more details."
    "</div>";


    var player = videojs('video', {
        controls: true,
        autoplay: false,
        width: 700,
        height: 525,
        playbackRates: [0.1, 0.25, 0.5, 1]
      }).ready(function () {
        vm.player = this;
        var query = vm.query ? vm.query.data : {};
        vm.loadVideo(query);
      });

    player.overlay({
      overlays: [
        {
          content: tips,
          align: 'top-left',
          start: 'loadstart',
          end: 'playing',
          class: 'overlay'
        }
      ]
    });
  },
  beforeDestroy: function () {
    console.log('app:beforeDestroy');
    // this.player.dispose();
  },
  methods: {
    loadVideo: function (params) {
      console.log('app:loadVideo');

      var vm = this;
      vm.$http.get(config.api.url + '/video/', {
          params: params
        })
        .then(function(response) {
          var videos = response.body.data;

          if (!videos || videos.length === 0) {
            alert('No videos are available, try refreshing.\n\nIf the problem continues, please contact Jeff Walker at jeff@walkerenvres.com.');
            console.log(response);
          } else {
            vm.video = videos[0];
            if (vm.video) {
              vm.player.src({type: 'video/mp4', src: vm.video.url});
              vm.player.load();
            }
          }
        }, function(response) {
          alert('Error occurred getting video from the server, try refreshing.\n\nIf the problem continues, please contact Jeff Walker at jeff@walkerenvres.com.');
          console.log(response);
        });
    }
  }
};
</script>

<style scoped>
.video-container {
  margin-bottom: 25px;
}
.view-container {
  max-width: 701px;
}
</style>
