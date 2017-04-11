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
      text: 'How many videos have been watched this year?'
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
        y: data.summary.n_watched,
        color: colors[0]
      }, {
        name: 'Not Watched',
        y: data.summary.n_video - data.summary.n_watched,
        color: colors[1]
      }]
    }]
  });

  Highcharts.chart('mrh-fish-avg', {
    chart: {
      type: 'column'
    },
    title: {
      text: 'What is the average number of fish counted on each day?',
      subtitle: 'CHANGE: average fish passage rate (#/min)'
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
        text: 'Average # Fish per Video'
      }
    },
    legend: {
      enabled: false
    },
    series: [{
      name: 'Fish per day',
      data: data.daily.map(function (d) {
        return [d.date.valueOf(), d.mean_count]
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
        text: '# Videos Watched'
      }
    },
    legend: {
      enabled: false
    },
    series: [{
      name: 'Counts per day',
      data: data.daily.map(function (d) {
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

window.onload = function () {
  d3.json(config.api.url + '/status/')
    .get(function (err, response) {
      if (err) {
        alert('Error occurred getting current status from the server, try refreshing.\n\nIf the problem continues, please contact Jeff Walker at jeff@walkerenvres.com.');
        return;
      }

      response.data.daily.forEach(function (d) {
        d.date = new Date(d.date);
      });
console.log(response.data);
      draw(response.data);
    })
}