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
import AuthPlugin from './plugins/auth';
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
Vue.use(AuthPlugin, {
  config: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSENGER_SENDER_ID
  },
  store
});

Vue.component('icon', Icon);

// store.commit('setLocationId', 'UML');

window.onload = () => {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app');
};
