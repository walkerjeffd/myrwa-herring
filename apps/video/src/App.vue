<template>
  <div>
    <div class="row sqs-row">
      <div class="col sqs-col-3 span-3">
        <video-nav></video-nav>
      </div>
      <div class="col sqs-col-9 span-9">
        <div class="sqs-block code-block sqs-block-code">
          <div class="sqs-block-content">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import queryString from 'query-string';

import VideoNav from '@/components/VideoNav';

// https://gist.github.com/jed/982883
const uuid = function b(a) {
  return a ? (a^Math.random()*16>>a/4) // eslint-disable-line
    .toString(16) : // eslint-disable-line
    ([1e7]+-1e3+ -4e3+ -8e3+ -1e11).replace(/[018]/g,b); // eslint-disable-line
};

export default {
  name: 'app',
  components: {
    VideoNav
  },
  data() {
    return {
      // query: {
      //   data: {}
      // }
    };
  },
  created() {
    console.log('app:created');

    this.$store.dispatch('setSessionId', uuid());

    // if (location.search) {
    //   const qry = queryString.parse(location.search);

    //   if (qry) {
    //     this.$set(this.query, 'data', qry);
    //   }
    // }
  },
  mounted() {
    console.log('app:mounted');
  }
};
</script>

<style scoped>
</style>
