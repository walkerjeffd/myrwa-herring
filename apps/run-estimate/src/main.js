// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import axios from 'axios';
import highcharts from 'highcharts';

import App from './App';
import config from '../../config';

require('highcharts/highcharts-more.js')(highcharts);

Vue.config.productionTip = false;

axios.defaults.baseURL = config.api.url;

highcharts.setOptions({
  lang: {
    thousandsSep: ','
  }
});

window.onload = () => {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    components: { App },
    template: '<App/>'
  });
};
