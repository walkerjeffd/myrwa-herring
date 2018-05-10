<template>
  <div class="row sqs-row">
    <div class="col sqs-col-12 span-12">
      <div class="sqs-block html-block sqs-block-html">
        <div class="sqs-block-content">
          <h1>Log In</h1>
        </div>
      </div>
      <div class="sqs-block form-block sqs-block-form">
        <div class="sqs-block-content">
          <div class="form-wrapper">
            <div class="form-inner-wrapper">
              <form v-on:submit.prevent="login">
                <div class="field-list clear">
                  <div
                    class="form-item field email required">
                    <label class="title" for="email-field">
                      Email Address <span class="required">*</span>
                    </label>
                    <input
                      class="field-element"
                      name="email"
                      x-autocompletetype="email"
                      type="text"
                      spellcheck="false"
                      id="email-field"
                      v-model="email">
                  </div>
                  <div class="form-item field password required">
                    <label class="title" for="password-field">
                      Password <span class="required">*</span>
                    </label>
                    <input
                      class="field-element"
                      type="password"
                      id="password-field"
                      v-model="password">
                  </div>
                </div>
                <div class="form-button-wrapper form-button-wrapper--align-left">
                  <input
                    class="button sqs-system-button sqs-editable-button"
                    type="submit"
                    value="Submit">
                </div>
                <!-- <div class="hidden form-submission-text">Thank you!</div>
                <div class="hidden form-submission-html" data-submission-html=""></div> -->
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="sqs-block html-block sqs-block-html">
        <div class="sqs-block-content">
          <p>
            You don't have an account? You can <router-link to="/signup">create one</router-link>.
          </p>
          <p>
            Forgot you're password? Request a <router-link to="/password-reset">password
            reset</router-link>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data() {
    return {
      email: '',
      password: '',
      error: null
    };
  },
  methods: {
    login() {
      this.$auth.login(this.email, this.password)
        .then(() => this.$router.push(this.$route.query.redirect || '/'))
        .catch((err) => {
          this.error = err.message || 'Unknown error occurred.';
        });
    }
  }
};
</script>

<style scoped>
.description {
  white-space: normal !important;
}
</style>
