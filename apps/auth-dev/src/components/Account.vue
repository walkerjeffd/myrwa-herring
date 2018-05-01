<template>
  <div>
    <h1>My Account</h1>
    <button @click="logout">Log Out</button>
    <p>Welcome {{ username }}!</p>
    <h3>Update Username</h3>
    <form>
      <input type="text" placeholder="New Username" v-model="usernameForm.value"><br>
      <input type="submit" @click="updateUsername" value="Submit">
    </form>
    <p v-if="usernameForm.message">{{ usernameForm.message }}</p>
    <p v-if="usernameForm.error">{{ usernameForm.error }}</p>
    <h3>Update Email</h3>
    <form>
      <input type="text" placeholder="New Email" v-model="emailForm.value"><br>
      <input type="submit" @click="updateEmail" value="Submit">
    </form>
    <p v-if="emailForm.message">{{ emailForm.message }}</p>
    <p v-if="emailForm.error">{{ emailForm.error }}</p>
    <p v-if="emailForm.loginRequired">
      Please <router-link to="/login?redirect=/account">log in</router-link> again to change
      your email.
    </p>
    <h3>Change Password</h3>
    <form>
      <input type="password" placeholder="New Password" v-model="passwordForm.value"><br>
      <input type="submit" @click="changePassword" value="Submit">
    </form>
    <p v-if="passwordForm.message"><span v-html="passwordForm.message"></span></p>
    <p v-if="passwordForm.error">{{ passwordForm.error }}</p>
    <p v-if="passwordForm.loginRequired">
      Please <router-link to="/login?redirect=/account">log in</router-link> again to change
      your password.
    </p>
    <h3>Delete Account</h3>
    <button @click="deleteAccount">Delete Account</button>
    <p v-if="deleteForm.loginRequired">
      Please <router-link to="/login?redirect=/account">log in</router-link> again to delete your
      account.
    </p>
    <p v-if="deleteForm.message"><span v-html="deleteForm.message"></span></p>
    <p v-if="deleteForm.error">{{ deleteForm.error }}</p>
    <p>Warning! This action cannot be undone.</p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'account',
  data() {
    return {
      usernameForm: {
        value: '',
        message: null,
        error: null
      },
      emailForm: {
        value: '',
        message: null,
        error: null,
        loginRequired: false
      },
      passwordForm: {
        value: '',
        message: null,
        error: null,
        loginRequired: false
      },
      deleteForm: {
        message: null,
        error: null,
        loginRequired: false
      }
    };
  },
  computed: {
    ...mapGetters(['user', 'username'])
  },
  methods: {
    logout() {
      this.$auth.logout()
        .then(() => this.$router.replace({ name: 'home' }));
    },
    updateUsername() {
      this.usernameForm.message = null;
      this.usernameForm.error = null;

      this.$auth.updateUsername(this.usernameForm.value)
        .then(() => {
          this.usernameForm.message = 'Username has been updated';
        })
        .catch((err) => {
          this.usernameForm.error = err.message || 'Unknown error occurred.';
          console.log(err);
        });
    },
    updateEmail() {
      this.emailForm.loginRequired = false;
      this.emailForm.message = null;
      this.emailForm.error = null;

      this.$auth.updateEmail(this.emailForm.value)
        .then(() => {
          this.emailForm.message = 'Email has been updated';
        })
        .catch((err) => {
          if (err.code === 'auth/requires-recent-login') {
            this.emailForm.loginRequired = true;
          } else {
            this.emailForm.error = err.message || 'Unknown error occurred.';
            console.log(err);
          }
        });
    },
    changePassword() {
      this.passwordForm.loginRequired = false;
      this.passwordForm.message = null;
      this.passwordForm.error = null;

      this.$auth.updatePassword(this.passwordForm.value)
        .then(() => {
          this.passwordForm.value = '';
          this.passwordForm.message = 'Password has been updated';
        })
        .catch((err) => {
          if (err.code === 'auth/requires-recent-login') {
            this.passwordForm.loginRequired = true;
          } else {
            this.passwordForm.error = err.message || 'Unknown error occurred.';
            console.log(err);
          }
        });
    },
    deleteAccount() {
      this.$auth.delete()
        .then(() => {
          this.deleteForm.message = 'Your account has been deleted. You will be redirected to the home page.';
          setTimeout(() => {
            this.$router.push({ name: 'home' });
          }, 3000);
        })
        .catch((err) => {
          if (err.code === 'auth/requires-recent-login') {
            this.deleteForm.loginRequired = true;
          } else {
            this.deleteForm.error = err.message || 'Unknown error occurred.';
            console.log(err);
          }
        });
    }
  }
};
</script>

<style>
</style>
