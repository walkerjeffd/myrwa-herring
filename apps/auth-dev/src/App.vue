<template>
  <div id="app">
    <div v-if="ready">
      <strong>Navigation</strong>
      <ul>
        <li><router-link to="/">Home</router-link></li>
        <li v-show="!username"><router-link to="/login">Log In</router-link></li>
        <li v-show="!username"><router-link to="/sign-up">Sign Up</router-link></li>
        <li v-show="username"><router-link to="/account">Account</router-link></li>
        <li v-show="username"><a href="#" @click="logout">Logout</a></li>
        <li><router-link to="/video">Watch Video</router-link></li>
        <li><router-link to="/leaderboard">Leaderboard</router-link></li>
      </ul>
      <router-view/>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'App',
  computed: {
    ...mapGetters(['username', 'user', 'ready'])
  },
  methods: {
    logout() {
      this.$auth.logout()
        .then(() => this.$router.replace({ name: 'home' }));
    }
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
