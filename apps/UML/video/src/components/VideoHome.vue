<template>
  <div>
    <video-bar></video-bar>
    <video id="video" class="video-js vjs-big-play-centered">
      <p class="vjs-no-js">
        To view this video please enable JavaScript, and consider upgrading to a
        web browser that
        <a href="http://videojs.com/html5-video-support/" target="_blank">
          supports HTML5 video
        </a>
      </p>
    </video>
    <div class="sqs-block button-block sqs-block-button" v-if="!showForm && !showConfirm && !!video">
      <div class="sqs-block-content">
        <div class="sqs-block-button-container--center">
          <a
            href=""
            class="sqs-block-button-element--medium sqs-block-button-element"
            v-on:click.prevent="showForm = true">
            Enter Count
          </a>
          <p style="color:#666" v-if="!user">Don't forget! You can <router-link to="/signup">sign up</router-link> for an account to track your progress <br> and compete for a top spot on the <router-link to="/leaderboard">Leaderboard</router-link>!</p>
        </div>
      </div>
    </div>
    <div class="form-wrapper" v-if="showForm">
      <div class="form-inner-wrapper">
        <form v-on:submit.prevent="submitCount" @submit="$v.$touch()">
          <div class="field-list clear">
            <div id="" class="form-item field number">
              <label class="title" for="count">How many fish did you count?</label>
              <input
                class="field-element"
                type="text"
                name="count"
                v-model="form.count">
              <span v-if="submitted && !$v.form.count.required" class="is-danger">
                Count is required and must be a number.
              </span>
              <span v-if="submitted && !$v.form.count.numeric" class="is-danger">
                Count must be a number (no commas, spaces, or periods!).
              </span>
            </div>
            <div class="form-item field number">
              <label class="title" for="comment">
                Any comments about the video? See anything interesting? <i>(optional)</i>
              </label>
              <input type="text" class="field-element" name="comment" v-model="form.comment">
            </div>
            <div class="form-button-wrapper form-button-wrapper--align-left" v-if="!submitting">
              <input
                class="button sqs-system-button sqs-editable-button"
                type="submit"
                value="Submit">
              <input
                class="button sqs-system-button sqs-editable-button"
                type="submit"
                value="Cancel"
                v-on:click.prevent="resetForm">
            </div>
            <p v-if="submitting">
              <strong>Submitting count, please wait...</strong>
            </p>
          </div>
        </form>
      </div>
    </div>
    <div v-if="showConfirm" class="confirm-container">
      <h2 v-if="!flag">{{ confirmMessage }}</h2>
      <div v-else>
        <h2>Hmmm...</h2>
        <p>{{flag}}</p>
      </div>
      <div class="sqs-block button-block sqs-block-button">
        <div class="sqs-block-content">
          <div class="sqs-block-button-container--center">
            <a
              href=""
              class="sqs-block-button-element--medium sqs-block-button-element"
              v-on:click.prevent="showNext">
              Let's watch another!
            </a>
          </div>
        </div>
      </div>
      <p>Share your count with friends and family!</p>
      <social-sharing
        url="https://mysticherring.org/"
        :title="title"
        description="Help document the Mystic River herring migration in Medford and Winchester, MA and learn more about this amazing wildlife migration."
        hashtags="mysticriver,citizenscience"
        twitter-user="MysticMyRWA"
        inline-template>
        <div class="network-icons">
          <network network="facebook">
            <icon name="brands/facebook-square" scale="4"></icon>
          </network>
          <network network="twitter">
            <icon name="brands/twitter-square" scale="4"></icon>
          </network>
        </div>
      </social-sharing>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { required, numeric } from 'vuelidate/lib/validators';
import videojs from 'video.js';

import { number } from '@/filters';
import VideoBar from './VideoBar';

const messages = [
  'Great job!',
  'Thank you!',
  'Nice work!',
  'Bravo!',
  'Well done!',
  'Excellent!',
  'Fantastic!',
  'Way to go!'
];

export default {
  name: 'videoHome',
  data() {
    return {
      showForm: false,
      showConfirm: false,
      loading: false,
      submitted: false,
      submitting: false,
      confirmMessage: null,
      form: {
        count: null,
        comment: null
      },
      flag: undefined
    };
  },
  validations: {
    form: {
      count: {
        required,
        numeric
      }
    }
  },
  filters: {
    number
  },
  computed: {
    ...mapGetters({
      video: 'video',
      user: 'auth/user',
      session: 'session',
      run: 'run'
    }),
    title() {
      return `I just counted ${this.session.total} river herring migrating up the Mystic River!`;
    }
  },
  components: {
    VideoBar
  },
  mounted() {
    // console.log('videoHome:mounted');
    this.$store.dispatch('fetchVideo')
      .catch(err => console.log(err));
    this.$store.dispatch('fetchRun')
      .catch(err => console.log(err));
    // console.log('videoPlayer:mounted');

    this.player = videojs('video', {
      controls: true,
      autoplay: false,
      width: 683,
      height: 480,
      playbackRates: [0.1, 0.25, 0.5, 1],
      inactivityTimeout: 0
    });

    // this.player.ready(() => {
    //   this.player.on('loadstart', () => {
    //     console.log('video:loadstart');
    //   });
    //   this.player.on('loadeddata', () => {
    //     console.log('video:loadeddata', this.player.currentSource());
    //     // this.loading = false;
    //   });
    //   this.player.on('error', () => {
    //     console.log('video:error');
    //     // this.error = true;
    //   });
    //   this.player.on('abort', () => {
    //     console.log('video:abort');
    //     // this.error = true;
    //   });
    //   this.player.on('ended', () => {
    //     console.log('video:ended');
    //   });
    // });

    if (this.video) {
      this.loadVideo(this.video);
    }
  },
  beforeDestroy() {
    // console.log('video:beforeDestroy');
    this.player.dispose();
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
    },
    submitCount() {
      if (this.loading) return;

      this.submitted = true;

      const duration = this.player.duration();
      const timeRanges = this.player.played();

      let totalTimeWatched = 0;
      for (let i = 0; i < timeRanges.length; i++) {
        const start = timeRanges.start(i);
        const end = timeRanges.end(i);
        totalTimeWatched += (end - start);
      }
      const percentWatched = totalTimeWatched / duration;

      if (percentWatched < 0.01) {
        this.flag = 'It doesn\'t look like you watched any of the video. This count has been flagged for review.';
      } else if (percentWatched < 0.9) {
        this.flag = 'It doesn\'t look like you watched the entire video. This count has been flagged for review.';
      }

      if (!this.$v.$invalid) {
        this.submitting = true;

        const payload = {
          video_id: this.video.id,
          count: +this.form.count,
          comment: this.form.comment,
          session: this.session.id,
          users_uid: null,
          flagged: !!this.flag
        };

        if (this.user) {
          payload.users_uid = this.user.uid;
        }

        this.$http.post('/count/', payload)
          .then((response) => {
            if (response.data && response.data.data && response.data.data.length > 0) {
              if (!this.flag && response.data.data[0].flagged) {
                this.flag = 'That count seems a little questionable. It has been flagged for our review.';
              }
            }
            this.$store.dispatch('updateSession', payload.count);
          })
          .then(() => this.$auth.refreshUser())
          .then(() => this.$store.dispatch('fetchRun'))
          .then(() => {
            this.resetForm();
            this.updateConfirmMessage();
            this.submitting = false;
            this.showConfirm = true;
          })
          .catch((response) => {
            alert('Error occurred saving count to the server, try submitting again.\n\nIf the problem continues, please let us know using the Contact Us form, or email us at herring.education@mysticriver.org.');
            console.log(response);
            this.submitting = false;
            this.loading = false;
          });
      }
    },
    updateConfirmMessage() {
      if (this.session.lastCount === 0) {
        this.confirmMessage = 'No fish in that one? Thanks for letting us know!';
      } else {
        this.confirmMessage = messages[Math.floor(Math.random() * messages.length)];
      }
    },
    resetForm() {
      this.form.count = null;
      this.form.comment = null;
      this.submitted = false;
      this.showForm = false;
    },
    showNext() {
      this.showForm = false;
      this.showConfirm = false;
      this.flag = undefined;
      this.$store.dispatch('fetchVideo');
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

.confirm-container {
  width: 100%;
  text-align: center;
  margin-top: 20px;
}

.form-wrapper {
  margin-top: 20px;
}

.is-danger {
  color: red;
}


.network-icons {
  color: #888;
  cursor: pointer;
}
.fa-icon {
  margin-left: 10px !important;
  margin-right: 10px !important;
}
.fa-icon:hover {
  color: #222;
  cursor: pointer;
}
</style>
