<template>
  <div id="app">
    <p>
      <router-link to="/">Home</router-link> | 
      <router-link to="/instructions">Instructions</router-link> | 
      <router-link to="/video">Watch Video</router-link> | 
      <router-link to="/status">Count Status</router-link>
    </p>

    <router-view :video="video" :load-video="loadVideo"></router-view>
  </div>
</template>

<script>
import config from '../config'

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
        }, function(response) {
          alert('Error occurred getting video from the server, try refreshing.\n\nIf the problem continues, please contact Jeff Walker at jeff@walkerenvres.com.');
          console.log(response);
        });
    }
  }
};
</script>

<style scoped>
</style>
