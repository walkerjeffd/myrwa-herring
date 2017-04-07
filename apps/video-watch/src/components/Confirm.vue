<template>
  <!-- <div>
    <p>Thanks!</p>
    <button @click="restart()">Watch Another</button>
    <router-link to="/status" tag="button">See Count Status</router-link>
  </div> -->
  <div>
    <p>Thanks! You're count has been received. What would you like to do next?</p>
    <div class="sqs-block button-block sqs-block-button" data-block-type="53">
      <div class="sqs-block-content">
        <div class="sqs-block-button-container--center">
          <a class="sqs-block-button-element--medium sqs-block-button-element" @click="restart()">Watch Another</a>
          <a href="/video/status" class="sqs-block-button-element--medium sqs-block-button-element">View Count Status</a>
          <a href="/data" class="sqs-block-button-element--medium sqs-block-button-element">Explore Data</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['video', 'loadVideo'],
  methods: {
    restart: function () {
      var query = this.query ? this.query.data : {};
      this.loadVideo(query);
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
p {
  font-size:1.2em
}
</style>
