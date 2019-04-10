import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '@/components/Home';
import Instructions from '@/components/Instructions';
import Data from '@/components/Data';
import VideoHome from '@/components/VideoHome';
import Confirm from '@/components/Confirm';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/instructions',
    component: Instructions
  },
  {
    path: '/data',
    component: Data
  },
  {
    path: '/video',
    component: VideoHome
  },
  {
    path: '/confirm',
    component: Confirm
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
