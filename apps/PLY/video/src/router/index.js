import Vue from 'vue';
import VueRouter from 'vue-router';

import VideoHome from '@/components/VideoHome';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: VideoHome
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
