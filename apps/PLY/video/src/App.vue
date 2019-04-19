<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
// https://gist.github.com/jed/982883
const uuid = function b(a) {
  return a ? (a^Math.random()*16>>a/4) // eslint-disable-line
    .toString(16) : // eslint-disable-line
    ([1e7]+-1e3+ -4e3+ -8e3+ -1e11).replace(/[018]/g,b); // eslint-disable-line
};

export default {
  name: 'app',
  components: {
  },
  created() {
    console.log('app:created');

    this.$store.dispatch('setSessionId', uuid());
  },
  mounted() {
    console.log('app:mounted');
  }
};
</script>

<style scoped>
</style>
