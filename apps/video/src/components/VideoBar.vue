<template>
  <div class="row sqs-row" style="border:1px solid black">
    <div class="col sqs-col-4 span-4">
      Video:
      <span v-if="video">{{ video.start_timestamp | datetime }}</span>
      <span v-else>...</span>
    </div>
    <div class="col sqs-col-4 span-4 text-align-right">
      Current Run Estimate:
      <span v-if="run">{{ run.total.y | number }} +/- {{ run.total.range | number }}</span>
      <span v-else>...</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { number, datetime } from '@/filters';

export default {
  computed: {
    ...mapGetters(['video', 'run'])
  },
  filters: {
    number,
    datetime
  }
};
</script>

<style scoped>
</style>
