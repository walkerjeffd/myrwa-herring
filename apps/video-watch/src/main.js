import Vue from 'vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'
import VeeValidate from 'vee-validate'

if (process.env.NODE_ENV === 'development') {
  console.log('development')
  require('./squarespace.css')
}

require('./app.css')

Vue.use(VueResource)
Vue.use(VueRouter)
Vue.use(VeeValidate)

import App from './components/App.vue'
import Watch from './components/Watch.vue'
import Form from './components/Form.vue'
import Confirm from './components/Confirm.vue'

const routes = [
  {
    path: '',
    component: Watch
  },
  {
    path: '/form',
    component: Form
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


