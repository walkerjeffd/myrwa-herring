<template>
  <div>
    <div id="chart-2"></div>
  </div>
</template>

<script>
var Highcharts = require('highcharts');

var colors = Highcharts.getOptions().colors;

export default {
  name: 'step-2',
  props: ['data'],
  data () {
    return {
    }
  },
  watch: {
    data: function () {
      this.draw();
    }
  },
  mounted: function () {
    this.draw();
  },
  methods: {
    draw: function () {
      if (!this.data) return;

      var data = this.data
        .filter(function (d) {
          return d.year === 2016;
        });

      Highcharts.chart('chart-2', {
        chart: {
          type: 'line'
        },
        title: {
          align: 'left',
          text: 'Water and Air Temperature'
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            week: '%b %d'
          },
          title: {
            text: 'Date'
          }
        },
        yAxis: {
          title: {
            text: 'Temperature (deg F)'
          }
        },
        plotOptions: {
        },
        tooltip: {
          shared: true
        },
        series: [{
          name: 'Water Temperature',
          data: data.map(function (d) {
            return [d.date.valueOf(), d.watertemp];
          }),
          color: colors[0]
        }, {
          name: 'Air Temperature',
          data: data.map(function (d) {
            return [d.date.valueOf(), d.airtemp];
          }),
          color: colors[3]
        }]
      });
    }
  }
}
</script>

<style scoped>
</style>
