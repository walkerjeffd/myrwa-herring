import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '@/components/Home';
import Instructions from '@/components/Instructions';
import Data from '@/components/Data';
import Leaderboard from '@/components/Leaderboard';

import VideoHome from '@/components/VideoHome';
import Watch from '@/components/Watch';
import Form from '@/components/Form';
import Confirm from '@/components/Confirm';

import Login from '@/components/Login';
import Logout from '@/components/Logout';
import Signup from '@/components/Signup';
import Account from '@/components/Account';
import PasswordReset from '@/components/PasswordReset';


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
    path: '/leaderboard',
    component: Leaderboard
  },
  {
    path: '/video',
    component: VideoHome,
    children: [
      {
        path: '',
        component: Watch
      },
      {
        path: '/form',
        component: Form
      }
    ]
  },
  {
    path: '/confirm',
    component: Confirm
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/logout',
    component: Logout
  },
  {
    path: '/signup',
    component: Signup
  },
  {
    path: '/account',
    component: Account
  },
  {
    path: '/password-reset',
    component: PasswordReset
  }
];

const router = new VueRouter({
  mode: 'hash',
  routes
});

export default router;
