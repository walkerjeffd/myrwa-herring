import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import App from './App.vue'
import Step1 from './components/Step1.vue'
import Step2 from './components/Step2.vue'
import Step3 from './components/Step3.vue'

var Highcharts = require('highcharts');

Highcharts.setOptions({
  global: {
    useUTC: true
  }
});

const routes = [
  {
    path: '/',
    component: Step1
  },
  {
    path: '/step-2',
    component: Step2
  },
  {
    path: '/step-3',
    component: Step3
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes: routes
})

router.replace({ path: '', redirect: '/step-1' })

window.onload = function () {
  new Vue({
    el: '#app',
    router: router,
    render: h => h(App)
  })
}