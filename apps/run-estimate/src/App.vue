<template>
  <div id="app">
    <div id="chart"></div>
  </div>
</template>

<script>
import axios from 'axios';
import highcharts from 'highcharts';
import jStat from 'jStat';

export default {
  name: 'App',
  mounted() {
    axios.get('/run-estimate/?start=2017-04-13&end=2017-06-27')
      .then((response) => {
        const data = response.data.data;

        const chartData = data.map((d) => {
          let tStar = jStat.studentt.inv(0.975, d.df);
          if (isNaN(tStar)) {
            tStar = 0;
          }
          return {
            x: (new Date(d.date)).valueOf(),
            y: Math.round(d.y),
            low: Math.max(Math.round(d.y) - (tStar * Math.sqrt(d.var_y)), 0),
            high: Math.round(d.y) + (tStar * Math.sqrt(d.var_y))
          };
        });

        highcharts.chart('chart', {
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
              text: 'Estimated # Fish per Day'
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
          series: [
            {
              name: 'Estimated # Fish',
              data: chartData.map(d => ({ x: d.x, y: d.y })),
              type: 'column',
              tooltip: {
                valueDecimals: 0
              }
            },
            {
              name: 'Uncertainty Range',
              data: chartData.map(d => ({ x: d.x, low: d.low, high: d.high })),
              type: 'errorbar',
              tooltip: {
                valueDecimals: 0
              }
            }
          ],
          tooltip: {
            shared: true
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
</script>

<style>
#chart {
  width: 600px;
  height: 400px;
}
</style>
