<template>
  <div class="sqs-block html-block sqs-block-html">
    <div class="sqs-block-content">
      <h1>My Account</h1>

      <h2 class="account-heading">My Data</h2>
      <ul v-if="user">
        <li><strong>Username</strong>: {{ user.username }}</li>
        <li><strong># Videos Watched</strong>: {{ user.n_count }}</li>
        <li><strong># Fish Counted</strong>: {{ user.sum_count }}</li>
      </ul>

      <h2 class="account-heading">Change Username</h2>

      <div class="form-wrapper">
        <div class="form-inner-wrapper">
          <form v-on:submit.prevent="updateUsername">
            <div class="field-list clear">
              <div class="form-item field text required">
                <label class="title" for="username-field">
                  Username <span class="required">*</span>
                </label>
                <div class="description">
                  Your Username may be shown publicly on the Leaderboard. Must be at least 3
                  characters.
                </div>
                <input
                  class="field-element text"
                  type="text"
                  id="username-field"
                  name="username"
                  v-model="username">
                <span v-if="usernameForm.submitted && !$v.username.required" class="is-danger">
                  Username is required.
                </span>
                <span v-if="usernameForm.submitted && !$v.username.minLength" class="is-danger">
                  Must be at least 3 characters.
                </span>
              </div>
            </div>
            <div class="form-button-wrapper form-button-wrapper--align-left">
              <input
                class="button sqs-system-button sqs-editable-button" type="submit" value="Submit">
            </div>
            <p v-if="usernameForm.message">{{ usernameForm.message }}</p>
            <p v-if="usernameForm.error" class="is-danger">{{ usernameForm.error }}</p>
          </form>
        </div>
      </div>

      <h2 class="account-heading">Change Email</h2>
      <div class="form-wrapper">
        <div class="form-inner-wrapper">
          <form v-on:submit.prevent="updateEmail">
            <div class="field-list clear">
              <div class="form-item field email required">
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
                <span v-if="emailForm.submitted && !$v.email.required" class="is-danger">
                  Email is required.
                </span>
                <span v-if="emailForm.submitted && !$v.email.email" class="is-danger">
                  Email address is not valid.
                </span>
              </div>
            </div>
            <div class="form-button-wrapper form-button-wrapper--align-left">
              <input
                class="button sqs-system-button sqs-editable-button" type="submit" value="Submit">
            </div>
            <p v-if="emailForm.message">{{ emailForm.message }}</p>
            <p v-if="emailForm.error" class="is-danger">{{ emailForm.error }}</p>
            <p v-if="emailForm.loginRequired" class="is-danger">
              Please <router-link to="/login?redirect=/account">log in</router-link> again to change
              your email.
            </p>
          </form>
        </div>
      </div>

      <h2 class="account-heading">Change Password</h2>
      <div class="form-wrapper">
        <div class="form-inner-wrapper">
          <form v-on:submit.prevent="updatePassword">
            <div class="field-list clear">
              <div class="form-item field password required">
                <label class="title" for="password-field">
                  New Password <span class="required">*</span>
                </label>
                <div class="description">
                  Password must be at least 6 characters.
                </div>
                <input
                  class="field-element"
                  type="password"
                  id="password-field"
                  name="password"
                  v-model="password">
                <span v-if="passwordForm.submitted && !$v.password.required" class="is-danger">
                  Password is required.
                </span>
                <span v-if="passwordForm.submitted && !$v.password.minLength" class="is-danger">
                  Password must be at least 6 characters.
                </span>
              </div>
              <div class="form-item field password required">
                <label class="title" for="password2-field">
                  Confirm New Password <span class="required">*</span>
                </label>
                <input
                  class="field-element"
                  type="password"
                  id="password2-field"
                  name="password2"
                  v-model="password2">
                <span
                  v-if="passwordForm.submitted && !$v.password2.sameAsPassword"
                  class="is-danger">
                  Passwords must be identical.
                </span>
              </div>
            </div>
            <div class="form-button-wrapper form-button-wrapper--align-left">
              <input
                class="button sqs-system-button sqs-editable-button" type="submit" value="Submit">
            </div>
          </form>
          <p v-if="passwordForm.message"><span v-html="passwordForm.message"></span></p>
          <p v-if="passwordForm.error">{{ passwordForm.error }}</p>
          <p v-if="passwordForm.loginRequired">
            Please <router-link to="/login?redirect=/account">log in</router-link> again to change
            your password.
          </p>
        </div>
      </div>

      <h2 class="account-heading">Delete Account</h2>
      <div class="sqs-block button-block sqs-block-button delete-button">
        <div class="sqs-block-content">
          <div class="sqs-block-button-container--left">
            <a
              class="sqs-block-button-element--medium sqs-block-button-element"
              href="#"
              v-on:click.stop="deleteAccount">
              Delete Account
            </a>
          </div>
        </div>
      </div>
      <p class="is-danger"><strong>Warning</strong>:&nbsp;This cannot be undone!</p>
      <p v-if="deleteButtonForm.loginRequired">
        Please <router-link to="/login?redirect=/account">log in</router-link> again then return
        to this page to delete your account.
      </p>
      <p v-if="deleteButtonForm.error">{{ deleteButtonForm.error }}</p>
    </div>
  </div>
</template>

<script>
import { required, email, minLength, sameAs } from 'vuelidate/lib/validators';
import { mapGetters } from 'vuex';

export default {
  name: 'account',
  data() {
    return {
      username: null,
      email: null,
      password: null,
      password2: null,
      usernameForm: {
        message: null,
        error: null,
        submitted: false
      },
      emailForm: {
        message: null,
        error: null,
        submitted: false,
        loginRequired: false
      },
      passwordForm: {
        message: null,
        error: null,
        submitted: false,
        loginRequired: false
      },
      deleteButtonForm: {
        error: null,
        submitted: false,
        loginRequired: false
      }
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
  computed: {
    ...mapGetters({
      user: 'auth/user'
    })
  },
  methods: {
    updateUsername() {
      console.log('updateUsername', this.$v.username.$invalid);
      this.usernameForm.submitted = true;
      this.usernameForm.message = null;
      this.usernameForm.error = null;

      if (!this.$v.username.$invalid) {
        this.$auth.updateUsername(this.username)
          .then(() => {
            this.username = null;
            this.usernameForm.message = 'Username has been updated';
            this.usernameForm.submitted = false;
            setTimeout(() => {
              this.usernameForm.message = null;
            }, 3000);
          })
          .catch((err) => {
            this.usernameForm.error = err.message || 'Unknown error occurred.';
            console.log(err);
          });
      }
    },
    updateEmail() {
      this.emailForm.submitted = true;
      this.emailForm.loginRequired = false;
      this.emailForm.message = null;
      this.emailForm.error = null;

      if (!this.$v.email.$invalid) {
        this.$auth.updateEmail(this.email)
          .then(() => {
            this.email = null;
            this.emailForm.message = 'Email has been updated';
            this.emailForm.submitted = false;
            setTimeout(() => {
              this.emailForm.message = null;
            }, 3000);
          })
          .catch((err) => {
            if (err.code === 'auth/requires-recent-login') {
              this.emailForm.loginRequired = true;
            } else {
              this.emailForm.error = err.message || 'Unknown error occurred.';
              console.log(err);
            }
          });
      }
    },
    updatePassword() {
      this.passwordForm.submitted = true;
      this.passwordForm.loginRequired = false;
      this.passwordForm.message = null;
      this.passwordForm.error = null;

      if (!this.$v.password.$invalid && !this.$v.password2.$invalid) {
        this.$auth.updatePassword(this.password)
          .then(() => {
            this.password = null;
            this.password2 = null;
            this.passwordForm.message = 'Password has been updated';
            this.passwordForm.submitted = false;
            setTimeout(() => {
              this.passwordForm.message = null;
            }, 3000);
          })
          .catch((err) => {
            if (err.code === 'auth/requires-recent-login') {
              this.passwordForm.loginRequired = true;
            } else {
              this.passwordForm.error = err.message || 'Unknown error occurred.';
              console.log(err);
            }
          });
      }
    },
    deleteAccount() {
      this.$auth.delete()
        .then(() => {
          this.$router.push('/deleted');
        })
        .catch((err) => {
          if (err.code === 'auth/requires-recent-login') {
            this.deleteButtonForm.loginRequired = true;
          } else {
            this.deleteButtonForm.error = err.message || 'Unknown error occurred.';
            console.log(err);
          }
        });
    }
  }
};

</script>

<style scoped>
h2.account-heading {
  margin-top: 40px;
}
.delete-button {
  padding-left: 0;
}
.description {
  white-space: normal !important;
}
</style>
