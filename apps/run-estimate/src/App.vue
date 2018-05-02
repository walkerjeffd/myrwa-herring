<template>
  <div id="app">
    <p v-if="total" style="font-size:20px">
      Total Estimated Number of Fish in 2017: <strong>{{ total.y }} +/- {{ total.range }}</strong>
    </p>
    <div id="chart"></div>
  </div>
</template>

<script>
import axios from 'axios';
import highcharts from 'highcharts';
import jStat from 'jStat';

export default {
  data() {
    return {
      total: null
    };
  },
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

        const totalData = data.reduce((p, v) => {
          p.y += v.y;           // eslint-disable-line
          p.var_y += v.var_y;   // eslint-disable-line
          p.df_num += v.df_num; // eslint-disable-line
          p.df_den += v.df_den; // eslint-disable-line
          return p;
        }, { y: 0, var_y: 0, df_num: 0, df_den: 0 });

        totalData.df = Math.round((totalData.df_num * totalData.df_num) / totalData.df_den);
        totalData.tStar = jStat.studentt.inv(0.975, totalData.df);
        totalData.y = totalData.y;
        totalData.ciRange = totalData.tStar * Math.sqrt(totalData.var_y);
        console.log(totalData);
        console.log([totalData.y - totalData.ciRange, totalData.y + totalData.ciRange]);
        this.total = {
          y: Math.round(totalData.y).toLocaleString(),
          range: Math.round(totalData.ciRange).toLocaleString()
        };

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
