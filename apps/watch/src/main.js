import Vue from 'vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'
import VeeValidate from 'vee-validate'
import SocialSharing from 'vue-social-sharing'
import Icon from 'vue-awesome'

require('./css/app.css')

Vue.use(VueResource)
Vue.use(VueRouter)
Vue.use(VeeValidate)
Vue.use(SocialSharing)

import App from './components/App.vue'
import Video from './components/Video.vue'
import Watch from './components/Watch.vue'
import Form from './components/Form.vue'
import Confirm from './components/Confirm.vue'
Vue.component('icon', Icon)

const routes = [
  {
    path: '/',
    component: Video,
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
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes: routes
})

window.onload = function () {
  new Vue({
    router: router,
    render: h => h(App)
  }).$mount('#app')
}


