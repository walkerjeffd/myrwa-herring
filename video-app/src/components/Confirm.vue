<template>
  <div>
    <p>Thanks!</p>
    <button @click="restart()">Watch Another</button>
  </div>
</template>

<script>
export default {
  props: ['video', 'loadVideo'],
  methods: {
    restart: function () {
      this.loadVideo();
      this.$router.push('/video');
    }
  }
};
</script>

<style scoped>
</style>
