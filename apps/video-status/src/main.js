var Highcharts = require('highcharts'),
    d3 = require('d3-request');

var config = require('../../../config');

require('highcharts/modules/exporting')(Highcharts);

Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

var colors = Highcharts.getOptions().colors;

var draw = function (data) {
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
        y: data.videos.summary.n_watched,
        color: colors[0]
      }, {
        name: 'Not Watched',
        y: data.videos.summary.n - data.videos.summary.n_watched,
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
      data: data.counts.daily.map(function (d) {
        return [d.date.valueOf(), d.mean]
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
      data: data.counts.daily.map(function (d) {
        return [d.date.valueOf(), d.n]
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

window.onload = function () {
  d3.json(config.api.url + '/status/')
    .get(function (err, response) {
      if (err) {
        alert('Error occurred getting current status from the server, try refreshing.\n\nIf the problem continues, please contact Jeff Walker at jeff@walkerenvres.com.');
        return;
      }

      response.data.counts.daily.forEach(function (d) {
        d.date = new Date(d.date);
      });

      draw(response.data);
    })
}