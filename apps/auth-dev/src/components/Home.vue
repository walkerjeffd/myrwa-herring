<template>
  <div>
    <h1>Home</h1>
    <p v-if="!username">
      <router-link to="/login">Log in</router-link> or
      <router-link to="/sign-up">sign up</router-link>.
    </p>
    <p v-else>
      Welcome {{ username }}!
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Home',
  data() {
    return {};
  },
  computed: {
    ...mapGetters(['username', 'user'])
  },
  methods: {}
};
</script>

<style>
</style>
