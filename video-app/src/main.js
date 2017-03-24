import Vue from 'vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'

// require('./squarespace.css')
require('./app.css')

Vue.use(VueResource)
Vue.use(VueRouter)

import App from './components/App.vue'
import Home from './components/Home.vue'
import Instructions from './components/Instructions.vue'
import Video from './components/Video.vue'
import Watch from './components/Watch.vue'
import Form from './components/Form.vue'
import Confirm from './components/Confirm.vue'
import Status from './components/Status.vue'

const routes = [
  {
    path: '',
    component: Home
  },
  {
    path: '/instructions',
    component: Instructions
  },
  {
    path: '/video',
    component: Video,
    children: [
      {
        path: '',
        component: Watch
      },
      {
        path: 'form',
        component: Form
      },
      {
        path: 'confirm',
        component: Confirm
      }
    ]
  },
  {
    path: '/status',
    component: Status
  }
]

const router = new VueRouter({
  routes
})

window.onload = function () {
  new Vue({
    router: router,
    render: h => h(App)
  }).$mount('#app')
}


