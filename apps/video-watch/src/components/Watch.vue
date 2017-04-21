<template>
  <div>
    <div class="sqs-block button-block sqs-block-button" data-block-type="53" v-show="loading">
      <div class="sqs-block-content">
        <div class="sqs-block-button-container--center">
          <div class="sqs-block-button-element--medium sqs-block-button-element">
            <img src="//localhost:8000/static/video-watch/loading.gif" width="32" height="32" alt="">
            <div>
              Loading
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="sqs-block button-block sqs-block-button" data-block-type="53" v-show="!loading">
      <div class="sqs-block-content">
        <div class="sqs-block-button-container--center">
          <router-link to="/form" tag="a" class="sqs-block-button-element--medium sqs-block-button-element">
            Enter Count
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['loading'],
  created: function () {
    console.log('watch:created');
    console.log(this.loading);
  }
};
</script>

<style scoped>
</style>
