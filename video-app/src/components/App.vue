<template>
  <div id="app">
    <p>
      <router-link to="/">Home</router-link> | 
      <router-link to="/instructions">Instructions</router-link> | 
      <router-link to="/video">Watch Video</router-link> | 
      <router-link to="/status">Count Status</router-link>
    </p>

    <router-view :video="video" :query="query" :load-video="loadVideo"></router-view>
  </div>
</template>

<script>
import config from '../config'
import queryString from 'query-string'

export default {
  name: 'app',
  data: function () {
    return {
      video: undefined,
      query: {
        data: undefined
      }
    }
  },
  created: function () {
    console.log('App:created');

    if (location.search) {
      var qry = queryString.parse(location.search);

      if (qry) {
        this.$set(this.query, 'data', qry);
      }
    }
  },
  methods: {
    loadVideo: function (params) {
      console.log('App:loadVideo');

      var vm = this;
      vm.$http.get(config.api_url + '/watch/', {
          params: params
        })
        .then(function(response) {
          var videos = response.body.data;

          if (!videos || videos.length === 0) {
            alert('No videos are available, try refreshing.\n\nIf the problem continues, please contact Jeff Walker at jeff@walkerenvres.com.');
            console.log(response);
          } else {
            vm.video = videos[0];
          }
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
