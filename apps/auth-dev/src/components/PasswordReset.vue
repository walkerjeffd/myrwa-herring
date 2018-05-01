<template>
  <div>
    <h3>Log In</h3>
    <form>
      <input type="text" placeholder="Email" v-model="email"><br>
      <input type="submit" @click="requestReset" value="Log In">
    </form>
    <p v-if="sent">
      Password reset email has been sent. Please follow the instructions in this email,
      and then return to the <router-link to="/login">log in</router-link> page.
    </p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import firebase from 'firebase';

export default {
  name: 'login',
  data() {
    return {
      email: '',
      sent: false,
      error: null
    };
  },
  methods: {
    requestReset() {
      const auth = firebase.auth();
      this.error = null;
      auth.sendPasswordResetEmail(this.email)
        .then(() => {
          this.sent = true;
        })
        .catch((err) => {
          this.error = err.message || 'Unknown error occurred.';
        });
    }
  }
};
</script>

<style>
</style>
