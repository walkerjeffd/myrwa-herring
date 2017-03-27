<template>
  <div>
    <p>How many fish did you count? <input type="number" name="" v-model="form.count"></p>
    <p>Did you notice anything interesting in the video, or have any other comments</p>
    <p><textarea v-model="form.comment"></textarea></p>
    <div>
      <button @click="submit()">Submit</button>
      <router-link to="/video" tag="button">Cancel</router-link>
    </div>
  </div>
</template>

<script>
import config from '../config'

export default {
  props: ['video'],
  data: function () {
    return {
      form: {
        count: 0,
        comment: ''
      }
    }
  },
  methods: {
    submit: function () {
      console.log('Form:submit(%s)', this.video.id);
      var payload = {
        video_id: this.video.id,
        count: +this.form.count,
        comment: this.form.comment
      };

      this.$http.post(config.api_url + '/count/', payload)
        .then((response) => {
          this.form.count = 0;
          this.form.comment = '';
          this.$router.push({path: '/video/confirm'});
        }, function(response) {
          alert('Error occurred saving count to the server, try submitting again.\n\nIf the problem continues, please contact Jeff Walker at jeff@walkerenvres.com.');
          console.log(response);
        });;
    }
  }
};
</script>

<style scoped>
</style>
