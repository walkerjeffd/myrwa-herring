<template>
  <div class="sqs-block html-block sqs-block-html">
    <div class="sqs-block-content">
      <h1>My Account</h1>

      <h2 class="account-heading">My Data</h2>
      <ul v-if="user">
        <li><strong>Username</strong>: {{ user.username }}</li>
        <li><strong># Videos Watched</strong>: 34</li>
        <li><strong># Fish Counted</strong>: 123</li>
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
                  Your Username may be shown publicly on the Leaderboard.
                </div>
                <input
                  class="field-element text"
                  type="text"
                  id="username-field"
                  v-model="username.value">
              </div>
            </div>
            <div class="form-button-wrapper form-button-wrapper--align-left">
              <input
                class="button sqs-system-button sqs-editable-button" type="submit" value="Submit">
            </div>
          </form>
          <p v-if="username.message">{{ username.message }}</p>
          <p v-if="username.error">{{ username.error }}</p>
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
                  v-model="email.value">
              </div>
            </div>
            <div class="form-button-wrapper form-button-wrapper--align-left">
              <input
                class="button sqs-system-button sqs-editable-button" type="submit" value="Submit">
            </div>
          </form>
          <p v-if="email.message">{{ email.message }}</p>
          <p v-if="email.error">{{ email.error }}</p>
          <p v-if="email.loginRequired">
            Please <router-link to="/login?redirect=/account">log in</router-link> again to change
            your email.
          </p>
        </div>
      </div>

      <h2 class="account-heading">Change Password</h2>
      <div class="form-wrapper">
        <div class="form-inner-wrapper">
          <form v-on:submit.prevent="updatePassword">
            <div class="field-list clear">
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
                  v-model="password.value">
              </div>
              <div class="form-item field password required">
                <label class="title" for="password2-field">
                  Confirm Password <span class="required">*</span>
                </label>
                <input
                  class="field-element"
                  type="password"
                  id="password2-field"
                  v-model="password.value2">
              </div>
            </div>
            <div class="form-button-wrapper form-button-wrapper--align-left">
              <input
                class="button sqs-system-button sqs-editable-button" type="submit" value="Submit">
            </div>
          </form>
          <p v-if="password.message"><span v-html="password.message"></span></p>
          <p v-if="password.error">{{ password.error }}</p>
          <p v-if="password.loginRequired">
            Please <router-link to="/login?redirect=/account">log in</router-link> again to change
            your password.
          </p>
        </div>
      </div>

      <h2 class="account-heading">Delete Account</h2>
      <p><strong>Warning</strong>:&nbsp;This cannot be undone!</p>

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
      <p v-if="deleteButton.loginRequired">
        Please <router-link to="/login?redirect=/account">log in</router-link> again then return
        to this page to delete your account.
      </p>
      <p v-if="deleteButton.message"><span v-html="deleteButton.message"></span></p>
      <p v-if="deleteButton.error">{{ deleteButton.error }}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'account',
  data() {
    return {
      username: {
        value: null,
        message: null,
        error: null
      },
      email: {
        value: null,
        message: null,
        error: null,
        loginRequired: false
      },
      password: {
        value: null,
        value2: null,
        message: null,
        error: null,
        loginRequired: false
      },
      deleteButton: {
        message: null,
        error: null,
        loginRequired: false
      }
    };
  },
  computed: {
    ...mapGetters({
      user: 'auth/user'
    })
  },
  methods: {
    updateUsername() {
      this.username.message = null;
      this.username.error = null;

      this.$auth.updateUsername(this.username.value)
        .then(() => {
          this.username.value = null;
          this.username.message = 'Username has been updated';
        })
        .catch((err) => {
          this.username.error = err.message || 'Unknown error occurred.';
          console.log(err);
        });
    },
    updateEmail() {
      this.email.loginRequired = false;
      this.email.message = null;
      this.email.error = null;

      this.$auth.updateEmail(this.email.value)
        .then(() => {
          this.email.value = null;
          this.email.message = 'Email has been updated';
        })
        .catch((err) => {
          if (err.code === 'auth/requires-recent-login') {
            this.email.loginRequired = true;
          } else {
            this.email.error = err.message || 'Unknown error occurred.';
            console.log(err);
          }
        });
    },
    updatePassword() {
      this.password.loginRequired = false;
      this.password.message = null;
      this.password.error = null;

      this.$auth.updatePassword(this.password.value)
        .then(() => {
          this.password.value = null;
          this.password.value2 = null;
          this.password.message = 'Password has been updated';
        })
        .catch((err) => {
          if (err.code === 'auth/requires-recent-login') {
            this.password.loginRequired = true;
          } else {
            this.password.error = err.message || 'Unknown error occurred.';
            console.log(err);
          }
        });
    },
    deleteAccount() {
      this.$auth.delete()
        .then(() => {
          this.deleteButton.message = 'Your account has been deleted. You will be redirected to the home page.';
          setTimeout(() => {
            this.$router.push('/');
          }, 3000);
        })
        .catch((err) => {
          if (err.code === 'auth/requires-recent-login') {
            this.deleteButton.loginRequired = true;
          } else {
            this.deleteButton.error = err.message || 'Unknown error occurred.';
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
