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
              <form v-on:submit.prevent="signup" @submit="$v.$touch()">
                <div class="field-list clear">
                  <div class="form-item field text required">
                    <label class="title" for="username-field">
                      Username <span class="required">*</span>
                    </label>
                    <div class="description">
                      Your Username will be shown publicly on the Leaderboard page. Must be at least
                      3 characters.
                    </div>
                    <input
                      class="field-element text"
                      type="text"
                      id="username-field"
                      v-model="username">
                    <span v-if="submitted && !$v.username.required" class="is-danger">
                      Username is required.
                    </span>
                    <span v-if="submitted && !$v.username.minLength" class="is-danger">
                      Username must be at least 3 characters.
                    </span>
                  </div>
                  <div class="form-item field email required">
                    <label class="title" for="email-field">
                      Email Address <span class="required">*</span>
                    </label>
                    <div class="description">
                      Use your email address to log in. Your Email Address will <strong>not</strong>
                      be shown publicly.
                    </div>
                    <input
                      class="field-element"
                      name="email"
                      x-autocompletetype="email"
                      type="text"
                      spellcheck="false"
                      id="email-field"
                      v-model="email">
                    <span v-if="submitted && !$v.email.required" class="is-danger">
                      Email is required.
                    </span>
                    <span v-if="submitted && !$v.email.email" class="is-danger">
                      Email address is not valid.
                    </span>
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
                    <span v-if="submitted && !$v.password.required" class="is-danger">
                      Password is required.
                    </span>
                    <span v-if="submitted && !$v.password.minLength" class="is-danger">
                      Password must be at least 6 characters.
                    </span>
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
                    <span v-if="submitted && !$v.password2.sameAsPassword" class="is-danger">
                      Passwords must be identical.
                    </span>
                  </div>
                </div>
                <div class="form-button-wrapper form-button-wrapper--align-left">
                  <input
                    class="button sqs-system-button sqs-editable-button"
                    :class="{ disabled: loading }"
                    type="submit"
                    value="Submit">
                </div>
              </form>
              <p v-if="error" class="is-danger">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { required, email, minLength, sameAs } from 'vuelidate/lib/validators';

export default {
  name: 'signup',
  data() {
    return {
      username: null,
      email: null,
      password: null,
      password2: null,
      error: null,
      submitted: false,
      loading: false
    };
  },
  validations: {
    username: {
      required,
      minLength: minLength(3)
    },
    email: {
      required,
      email
    },
    password: {
      required,
      minLength: minLength(6)
    },
    password2: {
      sameAsPassword: sameAs('password')
    }
  },
  methods: {
    signup() {
      if (this.loading) return;
      this.submitted = true;
      this.error = null;
      if (!this.$v.$invalid) {
        console.log('signup', this.username, this.email);
        this.loading = true;
        this.$auth.signUp(this.email, this.password, this.username)
          .then(() => this.$router.push(this.$route.query.redirect || '/'))
          .catch((err) => {
            console.log(err);
            if (err.code && err.code === 'auth/username-already-in-use') {
              this.error = 'Username is not available.';
            } else {
              this.error = err.message || 'Unknown error occurred.';
            }
            this.loading = false;
          });
      }
    }
  }
};
</script>

<style scoped>
.description {
  white-space: normal !important;
}
.button.sqs-system-button.sqs-editable-button.disabled {
  background-color: #aaa !important;
  cursor: default;
}
</style>
