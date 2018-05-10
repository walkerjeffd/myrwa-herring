<template>
  <div>
    <video id="video" class="video-js vjs-big-play-centered">
      <p class="vjs-no-js">
        To view this video please enable JavaScript, and consider upgrading to a
        web browser that
        <a href="http://videojs.com/html5-video-support/" target="_blank">
          supports HTML5 video
        </a>
      </p>
    </video>

    <pre>
video: {{ video }}
    </pre>
  </div>
</template>

<script>
import videojs from 'video.js';
import { mapGetters } from 'vuex';

export default {
  name: 'videoPlayer',
  data() {
    return {
      player: null
    };
  },
  computed: {
    ...mapGetters(['video'])
  },
  mounted() {
    console.log('videoPlayer:mounted');

    this.player = videojs('video', {
      controls: true,
      autoplay: false,
      width: 700,
      height: 480,
      playbackRates: [0.1, 0.25, 0.5, 1],
      inactivityTimeout: 0
    });

    this.player.ready(() => {
      this.player.on('loadstart', () => {
        console.log('video:loadstart');
      });
      this.player.on('loadeddata', () => {
        console.log('video:loadeddata', this.player.currentSource());
        // this.loading = false;
      });
      this.player.on('error', () => {
        console.log('video:error');
        // this.error = true;
      });
      this.player.on('abort', () => {
        console.log('video:abort');
        // this.error = true;
      });
      this.player.on('ended', () => {
        console.log('video:ended');
      });
    });

    if (this.video) {
      this.loadVideo(this.video);
    }
  },
  watch: {
    video(video) {
      console.log('videoPlayer:watch(video)', video);
      if (video) {
        this.loadVideo(video);
      } else {
        console.log('video:loadVideo no video');
      }
    }
  },
  beforeDestroy() {
    console.log('video:beforeDestroy');
    this.player.dispose();
  },
  methods: {
    loadVideo(video) {
      console.log('video:loadVideo loaded id=', video.id);

      const src = [];
      src.push({ type: 'video/mp4', src: video.url });

      if (video.url_webm) {
        src.push({ type: 'video/webm', src: video.url_webm });
      }

      this.player.src(src);
      this.player.load();
    }
  }
};
</script>

<style scoped>
</style>
