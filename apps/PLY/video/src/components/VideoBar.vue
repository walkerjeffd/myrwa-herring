<template>
  <div>
    <div class="run-bar">
      2019 Estimated Total Run (so far):
      <span><span id="odometer-total" class="odometer">0</span> +/- <span id="odometer-range" class="odometer">0</span></span>
      <icon name="question-circle" scale="1" v-tooltip="'Based on all video counts so far, <br>this is the total number of herring we<br>estimate have passed through the<br>fish ladder so far.'"></icon>
    </div>
    <div class="video-bar">
      Video Recorded:
      <span v-if="video">{{ video.start_timestamp | datetime }}</span>
      <span v-else>...</span>
    </div>
  </div>
</template>

<script>
import Odometer from 'odometer';
import { mapGetters } from 'vuex';
import { datetime } from '@/filters';

export default {
  data() {
    return {
      odometer: {
        total: null,
        range: null
      }
    };
  },
  computed: {
    ...mapGetters(['video', 'run'])
  },
  filters: {
    datetime
  },
  watch: {
    run() {
      if (this.run && this.run.total) {
        this.odometer.total.update(this.run.total.y);
        this.odometer.range.update(this.run.total.range);
      }
    }
  },
  mounted() {
    this.odometer.total = new Odometer({
      el: document.getElementById('odometer-total'),
      value: 0
    });
    this.odometer.range = new Odometer({
      el: document.getElementById('odometer-range'),
      value: 0
    });
  }
};
</script>

<style scoped>
.run-bar {
  border-radius: 8px 8px 0px 0px;
  text-align: center;
  border: 1px solid black;
  font-family: "proxima-nova","Helvetica Neue",Helvetica,Arial,sans-serif;
  font-size: 1.2em;
  padding-top: 10px;
  padding-bottom: 5px;
}
.odometer {
  font-family: adobe-garamond-pro, serif;
  font-weight: 600;
}
.video-bar {
  /*background-color: #36B3A8;*/
  background-color: #000;
  padding-top: 10px;
  color: #EEE;
  font-size: 16px;
  font-family: "proxima-nova","Helvetica Neue",Helvetica,Arial,sans-serif;
  line-height: 1em;
  text-align: center;
}
.float-right {
  float: right;
}
</style>
