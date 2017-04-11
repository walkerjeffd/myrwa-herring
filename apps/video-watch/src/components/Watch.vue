<template>
  <div class="sqs-block button-block sqs-block-button" data-block-type="53">
    <div class="sqs-block-content">
      <div class="sqs-block-button-container--center">
        <router-link to="/form" tag="a" class="sqs-block-button-element--medium sqs-block-button-element">
          Enter Count
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  created: function () {
    console.log('watch:created');
  }
};
</script>

<style scoped>
</style>
