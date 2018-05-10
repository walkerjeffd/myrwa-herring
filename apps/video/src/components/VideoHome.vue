<template>
  <div>
    <user-bar></user-bar>
    <video-bar></video-bar>
    <video-player></video-player>
    <div class="sqs-block button-block sqs-block-button" v-if="!showForm">
      <div class="sqs-block-content">
        <div class="sqs-block-button-container--center">
          <a href="" class="sqs-block-button-element--medium sqs-block-button-element" v-on:click.prevent="showForm = true">
            Enter Count
          </a>
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
                v-on:click.prevent="cancelForm">
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { required, numeric } from 'vuelidate/lib/validators';

import UserBar from './UserBar';
import VideoBar from './VideoBar';
import VideoPlayer from './VideoPlayer';

export default {
  name: 'videoHome',
  data() {
    return {
      showForm: false,
      showConfirm: false,
      loading: false,
      submitted: false,
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
  computed: {
    ...mapGetters({
      video: 'video',
      user: 'auth/user',
      session: 'session'
    })
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
  },
  methods: {
    submitCount() {
      if (this.loading) return;
      this.submitted = true;
      if (!this.$v.$invalid) {
        console.log('submitCount', this.video.id, this.form.count, this.form.comment);
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

        console.log('submitCount', payload);

        this.$http.post('/count/', payload)
          .then(() => this.$store.dispatch('updateSession', payload.count))
          .then(() => this.$auth.refreshUser())
          .then(() => this.$store.dispatch('fetchVideo'))
          .then(() => this.$router.push('/confirm'))
          .catch((response) => {
            alert('Error occurred saving count to the server, try submitting again.\n\nIf the problem continues, please let us know using the Contact Us form, or email us at herring.education@mysticriver.org.');
            console.log(response);
            this.loading = false;
          });
      }
    },
    cancelForm() {
      this.form.count = null;
      this.form.comment = null;
      this.submitted = false;
      this.showForm = false;
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

.form-wrapper {
  margin-top: 20px;
}


.is-danger {
  color: red;
}
</style>
