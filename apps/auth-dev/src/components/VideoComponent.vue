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
    <div>
      <p v-if="video">
        <a :href="video.url" target="_blank">{{ video.url }}</a>
      </p>
    </div>
    <div class="view-container">
      <div v-show="error">
        <p>Error occurred fetching video from the server, please refresh the page and try again.</p>
        <p>
          If the problem continues, please contact us at
          <a href="mailto:herring.education@mysticriver.org">herring.education@mysticriver.org</a>.
        </p>
      </div>
      <router-view :video="video" v-show="!error"></router-view>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import videojs from 'video.js';
// import videojsOverlay from 'videojs-overlay';

export default {
  name: 'videoComponent',
  props: ['session', 'query'],
  data() {
    return {
      loading: true,
      error: false
    };
  },
  computed: {
    ...mapGetters(['video'])
  },
  watch: {
    video() {
      if (this.video && this.player) {
        const src = [];
        src.push({ type: 'video/mp4', src: this.video.url });

        if (this.video.url_webm) {
          src.push({ type: 'video/webm', src: this.video.url_webm });
        }

        this.player.src(src);
        this.player.load();
      }
    }
  },
  mounted() {
    console.log('video:mounted');

    // const tips = '<div class="counting-tips">' +
    //   '<h2>Counting Tips</h2>' +
    //   '<ol>' +
    //     '<li>Only count fish that swim completely upstream (across the left edge of the ' +
    //     'video), including any you might see at the start of the video</li>' +
    //     '<li>Ignore any fish that swim back downstream (to the right)</li>' +
    //     '<li>If you don\'t see any fish, submit a count of zero</li>' +
    //     '<li>Use pause, slow down, or full screen if there are too many fish to count</li>' +
    //   '</ol>' +
    //   'See <a class="vjs-overlay-link" href="/video/instructions">Instructions</a> page ' +
    //   'for more details.' +
    //   '</div>';

    const vm = this;

    videojs('video', {
      controls: true,
      autoplay: false,
      width: 700,
      height: 480,
      playbackRates: [0.1, 0.25, 0.5, 1],
      inactivityTimeout: 0
    }).ready(function playerReady() {
      vm.player = this;

      vm.player.on('loadstart', () => console.log('video:loadstart'));
      vm.player.on('loadeddata', () => {
        console.log('video:loadeddata', vm.player.currentSource());
        vm.loading = false;
      });
      vm.player.on('error', () => {
        console.log('video:error');
        vm.error = true;
      });
      vm.player.on('abort', () => {
        console.log('video:abort');
        vm.error = true;
      });
      vm.player.on('ended', () => console.log('video:ended'));

      vm.$store.dispatch('getVideo')
        .then(() => {
          vm.loading = false;
        });
    });

    // if (vm.session.count === 0) {
    // player.overlay({
    //   overlays: [
    //     {
    //       content: tips,
    //       align: 'top-left',
    //       start: 'loadstart',
    //       end: 'playing',
    //       class: 'overlay'
    //     }
    //   ]
    // });
    // }
  },
  beforeDestroy() {
    console.log('video:beforeDestroy');
    this.player.dispose();
  },
  methods: {
    loadVideo() {
      console.log('video:loadVideo start');

      // this.loading = true;

      // const params = this.query ? this.query.data : {};
      // const params = {};

      // if (this.session.count === 0) {
      // params.first = true;
      // } else {
      //   params.first = false;
      // }
      // this.$store.dispatch('getVideo');


      // axios.get(`${config.api.url}/video/`, { params })
      //   .then((response) => {
      //     const videos = response.data.data;

      //     if (!videos || videos.length === 0) {
      //       this.loading = false;
      //       this.error = true;
      //       console.log(response);
      //     } else {
      //       this.video = videos[0];
      //       if (this.video) {
      //         console.log('video:loadVideo loaded id=', this.video.id);

      //         const src = [];
      //         src.push({ type: 'video/mp4', src: this.video.url });

      //         if (this.video.url_webm) {
      //           src.push({ type: 'video/webm', src: this.video.url_webm });
      //         }

      //         this.player.src(src);
      //         this.player.load();
      //       }
      //     }
      //   })
      //   .catch((response) => {
      //     this.loading = false;
      //     this.error = true;
      //     console.log(response);
      //   });
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
.fa-spin {
  animation: fa-spin 2s 0s infinite linear;
}
</style>
