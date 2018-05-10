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
              <form v-on:submit.prevent="login" @submit="$v.$touch()">
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
                    <span v-if="submitted && !$v.email.required" class="is-danger">
                      Field is required.
                    </span>
                    <span v-if="submitted && !$v.email.email" class="is-danger">
                      Email address is not valid.
                    </span>
                  </div>
                  <div class="form-item field password required">
                    <label class="title" for="password-field">
                      Password <span class="required">*</span>
                    </label>
                    <input
                      class="field-element"
                      type="password"
                      name="password"
                      id="password-field"
                      v-model="password">
                    <span v-if="submitted && !$v.password.required" class="is-danger">
                      Password is required.
                    </span>
                    <span v-if="submitted && !$v.password.minLength" class="is-danger">
                      Password must be at least 6 characters.
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
              <div v-if="error" class="is-danger" style="margin-top:20px">
                {{ error }}
              </div>
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
import { required, email, minLength } from 'vuelidate/lib/validators';

export default {
  name: 'login',
  data() {
    return {
      email: null,
      password: null,
      submitted: false,
      error: null,
      loading: false
    };
  },
  validations: {
    email: {
      required,
      email
    },
    password: {
      required,
      minLength: minLength(6)
    }
  },
  methods: {
    login() {
      if (this.loading) return;
      this.submitted = true;
      if (!this.$v.$invalid) {
        console.log('login', this.email, this.password);
        this.loading = true;
        this.$auth.login(this.email, this.password)
          .then(() => this.$router.push(this.$route.query.redirect || '/'))
          .catch((err) => {
            console.log(err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
              this.error = 'Email or password is incorrect.';
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
