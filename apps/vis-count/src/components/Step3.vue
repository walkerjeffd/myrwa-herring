<template>
  <div>
    <div id="chart-3"></div>
  </div>
</template>

<script>
var Highcharts = require('highcharts');

var colors = Highcharts.getOptions().colors;

export default {
  name: 'step-3',
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

      Highcharts.chart('chart-3', {
        chart: {
          zoomType: 'xy'
        },
        title: {
          align: 'left',
          text: 'Temperature vs Fish'
        },
        xAxis: [{
          type: 'datetime',
          dateTimeLabelFormats: {
            week: '%b %d'
          },
          title: {
            text: 'Date'
          }
        }],
        yAxis: [
          {
            title: {
              text: 'Fish',
            },
            labels: {
              format: '{value}',
            },
            tickAmount: 6
          }, {
            labels: {
              format: '{value} °F',
            },
            title: {
              text: 'Temperature',
            },
            opposite: true,
            // min: 45,
            // max: 80,
            tickAmount: 6
          }
        ],
        tooltip: {
          shared: true
        },
        plotOptions: {
          column: {
            groupPadding: 0,
            pointPadding: 0
          }
        },
        series: [
          {
            name: 'Fish',
            type: 'column',
            yAxis: 0,
            data: data.map(function (d) {
              return [d.date.valueOf(), d.fish];
            }),
            color: colors[1],
          }, 
          // {
          //   name: 'Water Temperature',
          //   type: 'line',
          //   yAxis: 1,
          //   data: data.map(function (d) {
          //     return [d.date.valueOf(), d.watertemp];
          //   }),
          //   color: colors[0],
          // }, 
          {
            name: 'Air Temperature',
            type: 'line',
            yAxis: 1,
            data: data.map(function (d) {
              return [d.date.valueOf(), d.airtemp];
            }),
            color: colors[3],
          }, 
          {
            name: '55 °F Threshold',
            type: 'line',
            yAxis: 1,
            data: [[data[0].date.valueOf(), 52], [data[data.length-1].date.valueOf(), 52]],
            color: 'orangered',
            marker: {
              enabled: false
            },
            enableMouseTracking: false
          }
        ]
      });
    }
  }
}
</script>

<style scoped>
</style>
