<template>
  <div class="row sqs-row">
    <div class="col sqs-col-12 span-12">
      <div class="sqs-block html-block sqs-block-html">
        <div class="sqs-block-content">
          <h1>Sign Up for an Account</h1>
        </div>
      </div>
      <div class="sqs-block form-block sqs-block-form">
        <div class="sqs-block-content">
          <div class="form-wrapper">
            <div class="form-inner-wrapper">
              <form v-on:submit.prevent="signup">
                <div class="field-list clear">
                  <div class="form-item field text required">
                    <label class="title" for="username-field">
                      Username <span class="required">*</span>
                    </label>
                    <div class="description">
                      Your Username will be shown publicly on the Leaderboard page.
                    </div>
                    <input
                      class="field-element text"
                      type="text"
                      id="username-field"
                      v-model="username">
                  </div>
                  <div class="form-item field email required">
                    <label class="title" for="email-field">
                      Email Address <span class="required">*</span>
                    </label>
                    <div class="description">
                      Use your email address to log in. Your Email Address will *not* be shown
                      publicly.
                    </div>
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
                    <div class="description">
                      Password must be at least 6 characters.
                    </div>
                    <input
                      class="field-element"
                      type="password"
                      id="password-field"
                      v-model="password">
                  </div>
                  <div class="form-item field password required">
                    <label class="title" for="password2-field">
                      Confirm Password <span class="required">*</span>
                    </label>
                    <input
                      class="field-element"
                      type="password"
                      id="password2-field"
                      v-model="password2">
                  </div>
                </div>
                <div class="form-button-wrapper form-button-wrapper--align-left">
                  <input
                    class="button sqs-system-button sqs-editable-button"
                    type="submit"
                    value="Submit">
                </div>
              </form>
              <p v-if="error" style="color:red">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'signup',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      password2: '',
      error: ''
    };
  },
  methods: {
    signup() {
      this.$auth.signUp(this.email, this.password, this.username)
        .then(() => this.$router.push(this.$route.query.redirect || '/'))
        .catch((err) => {
          if (err.message) {
            this.error = err.message;
          } else {
            this.error = 'Unknown Error Occurred';
          }
          console.log('Sign up failed');
          console.log(err.code, err.message);
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
