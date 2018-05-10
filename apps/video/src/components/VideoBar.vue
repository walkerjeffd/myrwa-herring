<template>
  <div style="border:1px solid black">
    Video:
    <span v-if="video">{{ video.start_timestamp | datetime }}</span>
    <span v-else>...</span>
    |
    Current Run Estimate:
    <span v-if="run">{{ run.total.y | number }} +/- {{ run.total.range | number }}</span>
    <span v-else>...</span>
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
