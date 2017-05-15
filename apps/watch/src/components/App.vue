<template>
  <div id="app">
    <router-view :session="session" :query="query"></router-view>
  </div>
</template>

<script>
import queryString from 'query-string'

// https://gist.github.com/jed/982883
var uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)};

export default {
  name: 'app',
  data: function () {
    return {
      session: {
        id: uuid(),
        count: 0,
        total: 0
      },
      query: {
        data: {}
      }
    }
  },
  created: function () {
    console.log('app:created');

    if (location.search) {
      var qry = queryString.parse(location.search);

      if (qry) {
        this.$set(this.query, 'data', qry);
      }
    }
  },
  mounted: function () {
    console.log('app:mounted');
  },
  methods: {
  }
};
</script>

<style scoped>
</style>
