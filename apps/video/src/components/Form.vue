<template>
  <div class="form-wrapper">
    <div class="form-inner-wrapper">
      <div>
        <div class="field-list clear">
          <div id="" class="form-item field number">
            <label class="title" for="count">How many fish did you count?</label>
            <input
              v-validate="'required|numeric'"
              :class="{'input': true, 'is-danger': errors.has('email') }"
              class="field-element"
              type="text"
              name="count"
              v-model="form.count"
              @keydown.enter="submit">
            <span
              v-show="errors.has('count')"
              class="help is-danger">
              {{ errors.first('count') }}
            </span>
          </div>
          <div class="form-item field number">
            <label class="title" for="comment">
              Any comments about the video? See anything interesting? <i>(optional)</i>
            </label>
            <input type="text" class="field-element" name="comment" v-model="form.comment">
          </div>
        </div>
        <div class="form-button-wrapper form-button-wrapper--align-left">
          <div class="row sqs-row">
            <div class="col sqs-col-12 span-12">
              <div class="sqs-block button-block sqs-block-button" data-block-type="53">
                <div class="sqs-block-content">
                  <div class="sqs-block-button-container--center">
                    <a
                      class="sqs-block-button-element--medium sqs-block-button-element"
                      @click="submit()">Submit</a>
                    <router-link
                      to="/"
                      tag="a"
                      class="sqs-block-button-element--medium sqs-block-button-element">
                      Cancel</router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['video', 'session'],
  data() {
    return {
      form: {
        count: '',
        comment: ''
      }
    };
  },
  created() {
    console.log('form:created');
  },
  methods: {
    submit() {
      console.log('form:submit(%s)', this.video.id);

      this.$validator.validateAll()
        .then(() => {
          const payload = {
            video_id: this.video.id,
            count: +this.form.count,
            comment: this.form.comment,
            session: this.session.id
          };

          this.$http.post('/count/', payload)
            .then(() => {
              this.session.count += 1;
              this.session.total = payload.count;

              this.form.count = '';
              this.form.comment = '';
              this.$router.push({ path: '/confirm' });
            })
            .catch((response) => {
              alert('Error occurred saving count to the server, try submitting again.\n\nIf the problem continues, please let us know using the Contact Us form, or email us at herring.education@mysticriver.org.');
              console.log(response);
            });
        })
        .catch(() => {
          alert('A count is required and must be a whole number. Do not use commas or periods in your count.');
        });
    }
  }
};
</script>

<style scoped>
label {
  font-size:1.2em
}
.is-danger {
  color: red;
}
</style>
