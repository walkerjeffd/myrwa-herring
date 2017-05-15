<template>
  <div>
    <div class="video-container">
      <video id="video" class="video-js vjs-big-play-centered">
        <p class="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to a
          web browser that
          <a href="http://videojs.com/html5-video-support/" target="_blank">
            supports HTML5 video
          </a>
        </p>
      </video>
    </div>
    <div class="view-container">
      <div v-show="error">
        <p>Error occurred fetching video from the server, please refresh the page and try again.</p>
        <p>If the problem continues, please contact us at <a href="mailto:herring.education@mysticriver.org">herring.education@mysticriver.org</a>.</p>
      </div>
      <router-view :loading="loading" :video="video" :load-video="loadVideo" :session="session" v-show="!error"></router-view>
    </div>
  </div>
</template>

<script>
import videojs from 'video.js'
import videojsOverlay from 'videojs-overlay'
import config from '../../../config'

export default {
  name: 'video',
  props: ['session', 'query'],
  data: function () {
    return {
      loading: true,
      error: false,
      video: undefined
    }
  },
  mounted: function () {
    console.log('video:mounted');
    const vm = this;

    var tips = "<div class=\"counting-tips\">" +
      "<h2>Counting Tips</h2>" +
      "<ol>" +
        "<li>Only count fish that swim completely upstream (across the left edge of the video), including any you might see at the start of the video</li>" +
        "<li>Ignore any fish that swim back downstream (to the right)</li>" +
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
        playbackRates: [0.1, 0.25, 0.5, 1],
        inactivityTimeout: 0
      }).ready(function () {
        vm.player = this;

        vm.player.on('loadstart', function() {
          console.log('video:loadstart');
        });
        vm.player.on('loadeddata', function() {
          console.log('video:loadeddata', vm.player.currentSource());
          vm.loading = false;
        });
        vm.player.on('error', function() {
          console.log('video:error');
          vm.error = true;
        });
        vm.player.on('abort', function() {
          console.log('video:abort');
          vm.error = true;
        });
        vm.player.on('ended', function() {
          console.log('video:ended');
        });

        vm.loadVideo();
      });

    if (vm.session.count === 0) {
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
    }
  },
  beforeDestroy: function () {
    console.log('video:beforeDestroy');
    this.player.dispose();
  },
  methods: {
    loadVideo: function (params) {
      console.log('video:loadVideo start');
      var vm = this;

      vm.loading = true;

      var params = vm.query ? vm.query.data : {};

      if (vm.session.count === 0) {
        params.first = true;
      } else {
        params.first = false;
      }

      vm.$http.get(config.api.url + '/video/', {
          params: params
        })
        .then(function(response) {
          var videos = response.body.data;

          if (!videos || videos.length === 0) {
            vm.loading = false;
            vm.error = true;
            console.log(response);
          } else {
            vm.video = videos[0];
            if (vm.video) {
              console.log('video:loadVideo loaded id=', vm.video.id);

              var src = [];
              src.push({type: 'video/mp4', src: vm.video.url});

              if (vm.video.url_webm) {
                src.push({type: 'video/webm', src: vm.video.url_webm});
              }

              vm.player.src(src);
              vm.player.load();
            }
          }
        }, function(response) {
          vm.loading = false;
          vm.error = true;
          console.log(response);
        });
    }
  }
};
</script>

<style scoped>
.vjs-volume-menu-button { display: none !important; }

.video-container {
  margin-bottom: 25px;
}
.view-container {
  max-width: 701px;
}
</style>
