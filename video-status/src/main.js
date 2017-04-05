var $ = require('jquery'),
    Highcharts = require('highcharts'),
    d3 = require('d3');

require('highcharts/modules/exporting')(Highcharts);

var data = d3.timeDay
  .range(new Date(2016, 3, 4), new Date(2016, 3, 30), 1)
  .map(function (d) {
    var x = {
      date: d,
      n_count: Math.floor(Math.random() * 10),
      n_fish: Math.floor(Math.random() * Math.random() * 100 * 10)
    };

    x.mean_fish = x.n_count > 0 ? x.n_fish / x.n_count : 0;

    return x;
  });

Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

var colors = Highcharts.getOptions().colors;

window.onload = function () {
  Highcharts.chart('mrh-pct-watched', {
    chart: {
      type: 'pie'
    },
    title: {
      text: 'How many videos have been watched overall?'
    },
    plotOptions: {
      pie: {
        shadow: false,
        center: ['50%', '50%']
      }
    },
    series: [{
      name: '# Videos',
      size: '60%',
      innerSize: '50%',
      data: [{
        name: 'Watched',
        y: Math.floor(Math.random() * 100),
        color: colors[0]
      }, {
        name: 'Not Watched',
        y: Math.floor(Math.random() * 100),
        color: colors[1]
      }]
    }]
  });

  Highcharts.chart('mrh-fish-avg', {
    chart: {
      type: 'column'
    },
    title: {
      text: 'What is the average number of fish counted on each day?'
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        month: '%b %d',
        day: '%b %d'
      },
      title: {
        text: 'Date'
      }
    },
    yAxis: {
      title: {
        text: 'Average # Fish'
      }
    },
    legend: {
      enabled: false
    },
    series: [{
      name: 'Fish per day',
      data: data.map(function (d) {
        return [d.date.valueOf(), d.mean_fish]
      }),
      color: colors[3]
    }]
  });

  Highcharts.chart('mrh-counts', {
    chart: {
      type: 'column'
    },
    title: {
      text: 'How many videos have been watched each day?'
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        month: '%b %d',
        day: '%b %d'
      }
    },
    yAxis: {
      title: {
        text: '# Videos Counted'
      }
    },
    legend: {
      enabled: false
    },
    series: [{
      name: 'Counts per day',
      data: data.map(function (d) {
        return [d.date.valueOf(), d.n_count]
      }),
      color: colors[2]
    }]
  });

  // Highcharts.chart('mrh-fish', {
  //   chart: {
  //     type: 'column'
  //   },
  //   title: {
  //     text: 'Number of Fish Counted per Day'
  //   },
  //   xAxis: {
  //     type: 'datetime',
  //     dateTimeLabelFormats: {
  //       month: '%b %d',
  //       day: '%b %d'
  //     }
  //   },
  //   yAxis: {
  //     title: {
  //       text: '# Fish Counted'
  //     }
  //   },
  //   legend: {
  //     enabled: false
  //   },
  //   series: [{
  //     name: 'Fish per day',
  //     data: data.map(function (d) {
  //       return [d.date.valueOf(), d.n_fish]
  //     }),
  //     color: colors[4]
  //   }]
  // });
}