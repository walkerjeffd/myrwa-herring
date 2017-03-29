<template>
  <div>
    <h2>Count Status</h2>
    <div v-if="loading">
      <p>Loading...</p>
    </div>
    <ul v-if="!loading && status.data">
      <li>Total Number of Videos: {{status.data.videos.count}}</li>
      <li>Total Duration of Videos: {{status.data.videos.duration / 60 | number}} min</li>
      <li>Total Number of Counts: {{status.data.counts.count}}</li>
      <li>Total Number of Fish Counted: {{status.data.counts.sum}}</li>
    </ul>
  </div>
</template>

<script>
import config from '../../../config'
import * as d3 from 'd3'

export default {
  name: 'status',
  filters: {
    number: (value) => {
      if (!value) return ''
      const f = d3.format('.1f')
      return f(value)
    }
  },
  data: function () {
    return {
      loading: true,
      status: {
      }
    }
  },
  mounted: function () {
    this.$http.get(config.videoApp.apiUrl + '/status/')
        .then((response) => {
          let data = response.body.data;
          this.$set(this.status, 'data', data);
          this.loading = false;
        }, function(response) {
          alert('Error occurred getting status from the server, try refreshing.\n\nIf the problem continues, please contact Jeff Walker at jeff@walkerenvres.com.');
          console.log(response);
        });
  }
};
</script>

<style scoped>
</style>
