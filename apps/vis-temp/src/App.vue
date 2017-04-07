<template>
  <div id="app">
    <div style="margin-bottom:40px">
      <router-link active-class="active" exact to="/" tag="div" class="btn">1</router-link>
      <router-link active-class="active" to="/step-2" tag="div" class="btn">2</router-link>
      <router-link active-class="active" to="/step-3" tag="div" class="btn">3</router-link>
    </div>

    <router-view :data="dataset.data"></router-view>
  </div>
</template>

<script>
var d3 = require('d3');

export default {
  name: 'app',
  data () {
    return {
      dataset: {
        url: 'https://s3.amazonaws.com/mysticriver.org/herring/data/myrwa-herring-dataset.csv'
      }
    }
  },
  mounted: function () {
    console.log('app:mounted');

    d3.csv(this.dataset.url)
      .row(function (d) {
        return {
          year: +d['Year'],
          date: new Date(d['Date']),
          fish: +d['# Fish'],
          rain: +d['Rainfall (in)'],
          flow: +d['Flow (cfs)'],
          airtemp: +d['Avg Air Temperature (degF)'],
          watertemp: +d['Avg Water Temperature (degF)'],
        }
      })
      .get((data) => {
        // console.log('app:data', data);
        this.$set(this.dataset, 'data', data);
      })
  }
}
</script>

<style scoped>
.btn {
  width: 20px;
  height: 20px;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  padding: 5px;
  margin: 2px;
  border: 2px solid #999;
  color: #999;
  font-family: sans-serif;
}

.btn:hover {
  background: #EEE;
  cursor: pointer;
}

.btn.active {
  border: 2px solid black;
  color: black;
  background-color: #EEE;
}
</style>
