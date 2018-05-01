import Vue from 'vue';
import Router from 'vue-router';
import firebase from 'firebase';

import Home from '@/components/Home';
import Account from '@/components/Account';
import Login from '@/components/Login';
import SignUp from '@/components/SignUp';
import PasswordReset from '@/components/PasswordReset';
import VideoComponent from '@/components/VideoComponent';
import VideoWatch from '@/components/VideoWatch';
import VideoForm from '@/components/VideoForm';
import Confirm from '@/components/Confirm';
import Leaderboard from '@/components/Leaderboard';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/sign-up',
      name: 'signUp',
      component: SignUp
    },
    {
      path: '/password-reset',
      name: 'passwordReset',
      component: PasswordReset
    },
    {
      path: '/account',
      name: 'account',
      component: Account,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/video',
      name: 'video',
      component: VideoComponent,
      children: [
        {
          path: '',
          name: 'videoWatch',
          component: VideoWatch
        },
        {
          path: '/form',
          name: 'videoForm',
          component: VideoForm
        }
      ]
    },
    {
      path: '/confirm',
      name: 'confirm',
      component: Confirm
    },
    {
      path: '/Leaderboard',
      name: 'leaderboard',
      component: Leaderboard
    }
  ],
  mode: 'hash'
});

router.beforeEach((to, from, next) => {
  const currentUser = firebase.auth().currentUser;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !currentUser) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;
