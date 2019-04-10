import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuelidate from 'vuelidate';
import VTooltip from 'v-tooltip';
import SocialSharing from 'vue-social-sharing';
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/brands/facebook-square';
import 'vue-awesome/icons/brands/twitter-square';
import 'vue-awesome/icons/brands/google-plus-square';
import 'vue-awesome/icons/question-circle';

import HttpPlugin from './plugins/http';
import HighchartsPlugin from './plugins/highcharts';

import App from './App';
import router from './router';
import store from './store/';

require('./css/app.css');

Vue.use(VueRouter);
Vue.use(Vuelidate);
Vue.use(VTooltip);
Vue.use(SocialSharing);
Vue.use(HighchartsPlugin);
Vue.use(HttpPlugin, { baseURL: process.env.API_URL });

Vue.component('icon', Icon);

window.onload = () => {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app');
};
