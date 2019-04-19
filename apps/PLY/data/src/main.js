import Vue from 'vue';

import HttpPlugin from './plugins/http';
import HighchartsPlugin from './plugins/highcharts';

import App from './App';

require('./css/app.css');

Vue.use(HighchartsPlugin);
Vue.use(HttpPlugin, { baseURL: process.env.API_URL });

window.onload = () => {
  new Vue({
    render: h => h(App)
  }).$mount('#app');
};
