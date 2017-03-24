<template>
  <div>
    <p>How many fish did you count? <input type="number" name=""></p>
    <p>Did you notice anything interesting in the video, or have any other comments</p>
    <p><textarea></textarea></p>
    <div>
      <button @click="submit()">Submit</button>
      <router-link to="/video" tag="button">Cancel</router-link>
    </div>
  </div>
</template>

<script>
export default {
  props: ['video'],
  methods: {
    submit: function () {
      console.log('Form:submit()', this.video.id);
      this.$router.push({path: '/video/confirm'});
    }
  }
};
</script>

<style scoped>
</style>
