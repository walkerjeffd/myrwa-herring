import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

import App from './App.vue'
import DonutChart from './DonutChart.vue'

Vue.component('donut-chart', DonutChart)

window.onload = function () {
  new Vue({
    render: h => h(App)
  }).$mount('#app')
}
