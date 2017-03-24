<template>
  <div>
    <h2>Status</h2>
    <div v-show="loading">
      <p>Loading...</p>
    </div>
    <ul v-show="!loading">
      <li>Total Number of Videos: {{status.count}}</li>
    </ul>
  </div>
</template>

<script>
import config from '../config'

export default {
  name: 'status',
  data: function () {
    return {
      loading: true,
      status: {
        count: 0
      }
    }
  },
  mounted: function () {
    this.$http.get(config.api_url + '/status/')
        .then((response) => {
          let data = response.body.data;
          console.log(data);
          this.status.count = data.count;
          this.loading = false;
        }, function(response) {
          alert('Error occurred getting status from the server');
          console.log(response);
        });
  }
};
</script>

<style scoped>
</style>
