<template>
  <div>
    <p>Thanks!</p>
    <button @click="restart()">Watch Another</button>
    <router-link to="/status" tag="button">See Count Status</router-link>
  </div>
</template>

<script>
export default {
  props: ['video', 'loadVideo'],
  methods: {
    restart: function () {
      var query = this.query ? this.query.data : {};
      this.loadVideo(query);
      this.$router.push('/video');
    }
  }
};
</script>

<style scoped>
</style>
