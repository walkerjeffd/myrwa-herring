// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import axios from 'axios';
import Icon from 'vue-awesome';

import store from './store/';
import App from './App';
import Auth from './plugins/auth';
import router from './router';
import config from '../../config';

Vue.config.productionTip = false;

axios.defaults.baseURL = config.api.url;

require('./css/app.css');

Vue.use(Auth);
Vue.component('icon', Icon);

window.onload = () => {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>'
  });
};
