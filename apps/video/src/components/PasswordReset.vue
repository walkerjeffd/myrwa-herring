<template>
  <div>
    <h1>Password Reset</h1>
    <p>
      Enter your email address to request a password reset.
    </p>
    <div class="form-wrapper">
      <div class="form-inner-wrapper">
        <form v-on:submit.prevent="submit" @submit="$v.$touch()">
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
    <p v-if="sent">
      Password reset email has been sent. Please follow the instructions in this email,
      and then return to the <router-link to="/login" class="router-link">log in</router-link> page.
    </p>
  </div>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators';

export default {
  name: 'login',
  data() {
    return {
      email: '',
      sent: false,
      error: null,
      loading: false,
      submitted: false
    };
  },
  validations: {
    email: {
      required,
      email
    }
  },
  methods: {
    submit() {
      if (this.loading) return;
      this.error = null;
      this.submitted = true;
      if (!this.$v.$invalid) {
        this.loading = true;
        this.$auth.passwordReset(this.email)
          .then(() => {
            this.sent = true;
            this.loading = false;
          })
          .catch((err) => {
            this.error = err.message || 'Unknown error occurred.';
            this.loading = false;
          });
      }
    }
  }
};
</script>

<style scoped>
.button.sqs-system-button.sqs-editable-button.disabled {
  background-color: #aaa !important;
  cursor: default;
}
a.router-link {
  text-decoration: underline;
}
</style>
