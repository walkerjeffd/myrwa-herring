<template>
  <!-- <div>
    <p>How many fish did you count? <input type="number" name="" v-model="form.count"></p>
    <p>Did you notice anything interesting in the video, or have any other comments</p>
    <p><textarea v-model="form.comment"></textarea></p>
    <div>
      <button @click="submit()">Submit</button>
      <router-link to="/video" tag="button">Cancel</router-link>
    </div>
  </div> -->
  <div class="form-wrapper">
    <div class="form-inner-wrapper">
      <form>
        <div class="field-list clear">
          <div id="" class="form-item field number">
            <label class="title" for="name">How many fish did you count?</label>
            <input class="field-element" type="text" name="count" v-model="form.count">
          </div>
          <div class="form-item field textarea">
            <label class="title" for="comment">Any comments about the video? Did you see anything interesting?</label>
            <textarea class="field-element" name="comment" v-model="form.comment"></textarea>
          </div>
        </div>
        <div class="form-button-wrapper form-button-wrapper--align-left">
          <div class="row sqs-row">
            <div class="col sqs-col-12 span-12">
              <div class="sqs-block button-block sqs-block-button" data-block-type="53">
                <div class="sqs-block-content">
                  <div class="sqs-block-button-container--center">
                    <a class="sqs-block-button-element--medium sqs-block-button-element" @click="submit()">Submit</a>
                    <router-link to="/" tag="a" class="sqs-block-button-element--medium sqs-block-button-element">Cancel</router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import config from '../../../config'

export default {
  props: ['video', 'session'],
  data: function () {
    return {
      form: {
        count: '',
        comment: ''
      }
    }
  },
  created: function () {
    console.log('form:created');
  },
  methods: {
    submit: function () {
      console.log('form:submit(%s)', this.video.id);

      var payload = {
        video_id: this.video.id,
        count: +this.form.count,
        comment: this.form.comment,
        session: this.session
      };

      this.$http.post(config.api.url + '/count/', payload)
        .then((response) => {
          this.form.count = 0;
          this.form.comment = '';
          this.$router.push({path: '/confirm'});
        }, (response) => {
          alert('Error occurred saving count to the server, try submitting again.\n\nIf the problem continues, please contact Jeff Walker at jeff@walkerenvres.com.');
          console.log(response);
        });
    }
  }
};
</script>

<style scoped>
label {
  font-size:1.2em
}
</style>
