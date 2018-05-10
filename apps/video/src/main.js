import Vue from 'vue';
import VueRouter from 'vue-router';
import VeeValidate from 'vee-validate';
import SocialSharing from 'vue-social-sharing';
import Icon from 'vue-awesome';

import HttpPlugin from './plugins/http';
import AuthPlugin from './plugins/auth';
import App from './App';
import router from './router';
import store from './store/';
import config from '../../config';

require('./css/app.css');

Vue.use(VueRouter);
Vue.use(VeeValidate);
Vue.use(SocialSharing);
Vue.use(HttpPlugin, { baseURL: config.api.url });
Vue.use(AuthPlugin, { config: config.firebase, store });

Vue.component('icon', Icon);

// window.onload = () => {
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
// };
