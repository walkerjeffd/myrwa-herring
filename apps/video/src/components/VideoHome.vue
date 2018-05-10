<template>
  <div>
    <user-bar></user-bar>
    <video-bar></video-bar>
    <video-player></video-player>
    <!-- <div class="row sqs-row" style="border:1px solid black">
      <div class="col sqs-col-4 span-4">Welcome, walkerjeffd!</div>
      <div class="col sqs-col-4 span-4 text-align-center">Stats: 32 videos, 132 fish</div>
      <div class="col sqs-col-4 span-4 text-align-right">Logout | Account</div>
    </div>
     -->
<!--<div class="view-container">
      <div v-show="error">
        <p>
          Error occurred fetching video from the server, please refresh the page and try again.
        </p>
        <p>
          If the problem continues, please contact us at
          <a href="mailto:herring.education@mysticriver.org">herring.education@mysticriver.org</a>.
        </p>
      </div>
      <router-view
        :loading="loading"
        :video="video"
        :load-video="loadVideo"
        :session="session"
        v-show="!error">
      </router-view> -->
    <!-- </div> -->
    <pre>
loading: {{ loading }}
error: {{ error }}
    </pre>
  </div>
</template>

<script>
// import videojs from 'video.js';
import UserBar from './UserBar';
import VideoBar from './VideoBar';
import VideoPlayer from './VideoPlayer';

export default {
  name: 'videoHome',
  data() {
    return {
      loading: true,
      error: false
      // video: undefined
    };
  },
  components: {
    UserBar,
    VideoBar,
    VideoPlayer
  },
  mounted() {
    console.log('videoHome:mounted');
    this.$store.dispatch('fetchVideo')
      .catch(err => console.log(err));
    this.$store.dispatch('fetchRun')
      .catch(err => console.log(err));


  //   this.player = videojs('video', {
  //     controls: true,
  //     autoplay: false,
  //     width: 700,
  //     height: 480,
  //     playbackRates: [0.1, 0.25, 0.5, 1],
  //     inactivityTimeout: 0
  //   });

  //   this.player.ready(() => {
  //     // player = this;
  //     // if (vm.session.count === 0) {
  //     //   vm.player;
  //     // }

  //     this.player.on('loadstart', () => {
  //       console.log('video:loadstart');
  //     });
  //     this.player.on('loadeddata', () => {
  //       console.log('video:loadeddata', this.player.currentSource());
  //       this.loading = false;
  //     });
  //     this.player.on('error', () => {
  //       console.log('video:error');
  //       this.error = true;
  //     });
  //     this.player.on('abort', () => {
  //       console.log('video:abort');
  //       this.error = true;
  //     });
  //     this.player.on('ended', () => {
  //       console.log('video:ended');
  //     });

  //     // this.loadVideo();
  //   });
  },
  // beforeDestroy() {
  //   console.log('video:beforeDestroy');
  //   this.player.dispose();
  // },
  methods: {
    loadVideo() {
      console.log('video:loadVideo start');

      this.loading = true;

      const params = this.query ? this.query.data : {};

      if (this.session.count === 0) {
        params.first = true;
      } else {
        params.first = false;
      }

      this.$http.get('/video/', { params })
        .then((response) => {
          const videos = response.data.data;

          if (!videos || videos.length === 0) {
            this.loading = false;
            this.error = true;
          } else {
            this.video = videos[0];
            if (this.video) {
              console.log('video:loadVideo loaded id=', this.video.id);

              const src = [];
              src.push({ type: 'video/mp4', src: this.video.url });

              if (this.video.url_webm) {
                src.push({ type: 'video/webm', src: this.video.url_webm });
              }

              this.player.src(src);
              this.player.load();
            }
          }
        })
        .catch((response) => {
          this.loading = false;
          this.error = true;
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
