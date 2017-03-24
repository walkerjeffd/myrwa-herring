import Vue from 'vue'
import App from './App.vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'

require('./app.css')

Vue.use(VueResource)
Vue.use(VueRouter)

import Home from './Home.vue'
import Instructions from './Instructions.vue'
import Video from './Video.vue'

const routes = [
  { path: '', component: Home },
  { path: '/instructions', component: Instructions },
  { path: '/video', component: Video }
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


