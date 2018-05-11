<template>
  <div class="video-bar">
    Video:
    <span v-if="video">{{ video.start_timestamp | datetime }}</span>
    <span v-else>...</span>
    <span class="float-right">
      Current Run Estimate:
      <span v-if="run">{{ run.total.y | number }} +/- {{ run.total.range | number }}</span>
      <span v-else>...</span>
    </span>
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
.video-bar {
  border-radius: 8px 8px 0px 0px;
  background-color: #36B3A8;
  padding: 10px;
  color: #EEE;
  font-size: 16px;
  font-family: "proxima-nova","Helvetica Neue",Helvetica,Arial,sans-serif;
  line-height: 1.4em;
}
.float-right {
  float: right;
}
</style>
