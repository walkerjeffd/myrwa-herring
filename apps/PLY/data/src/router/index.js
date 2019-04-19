import Vue from 'vue';
import VueRouter from 'vue-router';

import Data from '@/components/Data';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: Data
  }
];

const router = new VueRouter({
  mode: 'hash',
  routes
});

router.afterEach(() => {
  window.scrollTo(0, 0);
});

export default router;
