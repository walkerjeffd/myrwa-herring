<template>
  <div>
    <div class="sqs-block button-block sqs-block-button" data-block-type="53" v-show="loading">
      <div class="sqs-block-content">
        <div class="sqs-block-button-container--center">
          <div class="sqs-block-button-element--medium sqs-block-button-element">
            <div style="margin-bottom:10px">
              Loading
            </div>
            <icon name="spinner" scale="2" spin></icon>
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
import config from '../../../config'

export default {
  props: ['loading'],
  created: function () {
    console.log('watch:created');
  }
};
</script>

<style>
.fa-spin {
  animation: fa-spin 2s 0s infinite linear;
}
</style>
