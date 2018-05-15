<template>
  <div>
    <video-bar></video-bar>
    <video-player></video-player>
    <div class="sqs-block button-block sqs-block-button" v-if="!showForm & !showConfirm">
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
            <div class="form-button-wrapper form-button-wrapper--align-left">
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
          </div>
        </form>
      </div>
    </div>
    <div v-if="showConfirm" class="confirm-container">
      <h2>{{ confirmMessage }}</h2>
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
          <network network="googleplus">
            <icon name="brands/google-plus-square" scale="4"></icon>
          </network>
        </div>
      </social-sharing>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { required, numeric } from 'vuelidate/lib/validators';

import { number } from '@/filters';
import VideoBar from './VideoBar';
import VideoPlayer from './VideoPlayer';

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
      confirmMessage: null,
      form: {
        count: null,
        comment: null
      }
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
    VideoBar,
    VideoPlayer
  },
  mounted() {
    console.log('videoHome:mounted');
    this.$store.dispatch('fetchVideo')
      .catch(err => console.log(err));
    this.$store.dispatch('fetchRun')
      .catch(err => console.log(err));
  },
  methods: {
    submitCount() {
      if (this.loading) return;
      this.submitted = true;
      if (!this.$v.$invalid) {
        const payload = {
          video_id: this.video.id,
          count: +this.form.count,
          comment: this.form.comment,
          session: this.session.id,
          users_uid: null
        };

        if (this.user) {
          payload.users_uid = this.user.uid;
        }

        this.$http.post('/count/', payload)
          .then(() => this.$store.dispatch('updateSession', payload.count))
          .then(() => this.$auth.refreshUser())
          .then(() => this.$store.dispatch('fetchRun'))
          .then(() => {
            this.resetForm();
            this.updateConfirmMessage();
            this.showConfirm = true;
          })
          .catch((response) => {
            alert('Error occurred saving count to the server, try submitting again.\n\nIf the problem continues, please let us know using the Contact Us form, or email us at herring.education@mysticriver.org.');
            console.log(response);
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
