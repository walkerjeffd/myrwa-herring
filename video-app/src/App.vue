<template>
  <div id="app">
    <h1>Mystic River Herring Video Count Application</h1>
    <router-view :video="video" :load-video="loadVideo"></router-view>
  </div>
</template>

<script>
import config from './config'

export default {
  name: 'app',
  data: function () {
    return {
      video: undefined
    }
  },
  mounted: function () {
    console.log('App:mounted');
  },
  methods: {
    loadVideo: function () {
      console.log('App:loadVideo');
      var vm = this;
      vm.$http.get(config.api_url + '/watch/')
        .then(function(response) {
          var video = vm.video = response.body.data;

          // vm.player.src({type: 'video/mp4', src: video.url});
          // vm.player.load();

          // vm.loading = false;
        }, function(response) {
          alert('Error occurred getting video from the server');
          console.log(response);
        });
    }
  }
};
</script>

<style scoped>
</style>
