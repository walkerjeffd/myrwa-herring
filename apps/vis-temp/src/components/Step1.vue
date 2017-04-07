<template>
  <div>
    <div id="chart-1"></div>
  </div>
</template>

<script>
var Highcharts = require('highcharts');

var colors = Highcharts.getOptions().colors;

export default {
  name: 'step-1',
  props: ['data'],
  data () {
    return {
    }
  },
  watch: {
    data: function () {
      console.log('step-1:watch data');
      this.draw();
    }
  },
  mounted: function () {
    console.log('step-1:mounted');
    this.draw();
  },
  methods: {
    draw: function () {
      if (!this.data) return;

      var data = this.data
        .filter(function (d) {
          return d.year === 2016;
        })
        .map(function (d) {
          return [d.date.valueOf(), d.fish];
        });

      Highcharts.chart('chart-1', {
        chart: {
          type: 'column'
        },
        title: {
          align: 'left',
          text: 'Estimated Daily Fish Passage'
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            day: '%b %d',
            week: '%b %d',
          },
          title: {
            text: 'Date'
          }
        },
        yAxis: {
          title: {
            text: '# Fish per Day'
          }
        },
        plotOptions: {
          column: {
            groupPadding: 0,
            pointPadding: 0
          }
        },
        legend: {
          enabled: false
        },
        series: [{
          name: 'Fish per day',
          data: data,
          color: colors[1]
        }]
      });
    }
  }
}
</script>

<style scoped>
</style>
