<template>
  <div id="app">
    <donut-chart :value="data.value1" radius="100" color="steelblue"></donut-chart>
    <donut-chart :value="data.value2" radius="100" color="orangered"></donut-chart>
  </div>
</template>

<script>
import config from '../../config'

export default {
  name: 'app',
  data () {
    return {
      data: {
        value1: undefined,
        value2: undefined
      }
    }
  },
  mounted () {
    this.$http.get(config.api.url + '/status/')
      .then( (response) => {
        let data = response.body.data;
        console.log(data);
        this.data.value1 = data.videos_n_total > 0 ? data.videos_n_watched / data.videos_n_total : 0;
        this.data.value2 = data.counts_sum > 0 ? 1 : 0;
      }, (response) => {
        alert('Error occurred getting status from the server, try refreshing.\n\nIf the problem continues, please contact Jeff Walker at jeff@walkerenvres.com.');
        console.log(response);
      });
  }
}
</script>

<style scoped>
</style>
