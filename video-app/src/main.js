import Vue from 'vue'
import App from './App.vue'
import vueResource from 'vue-resource'

require('./app.css')

Vue.use(vueResource)

new Vue({
  el: '#app',
  render: h => h(App)
})


