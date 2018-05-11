// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App2 from './App2';

Vue.config.productionTip = false;

/* eslint-disable no-new */
const app2 = new Vue({
  el: '#app2',
  components: { App2 },
  template: '<App2/>',
});
