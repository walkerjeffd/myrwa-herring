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
  Highcharts.chart('mrh-pie-videos', {
    chart: {
      type: 'pie'
    },
    title: {
      text: 'How many videos have been counted overall?'
    },
    plotOptions: {
      pie: {
        shadow: false,
        center: ['50%', '50%'],
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y:,.0f}'
        }
      }
    },
    series: [{
      name: '# Videos',
      size: '60%',
      innerSize: '50%',
      data: [{
        name: 'Videos Counted',
        y: data.summary.n_watched,
        color: colors[0]
      }, {
        name: 'Videos Not Counted',
        y: data.summary.n_video - data.summary.n_watched,
        color: colors[1]
      }]
    }]
  });

  Highcharts.chart('mrh-bar-videos', {
    chart: {
      type: 'column'
    },
    title: {
      text: 'How many videos have been counted for each day?'
    },
    plotOptions: {
      column: {
        stacking: 'normal'
      }
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
      min: 0,
      title: {
        text: '# Videos'
      },
      stackLabels: {
        enabled: true,
        style: {
          fontWeight: 'bold',
          color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
        }
      }
    },
    series: [
      {
        name: 'Videos Counted',
        data: data.daily.map(function (d) {
          return [d.date.valueOf(), d.n_watched]
        }),
        color: colors[0]
      }, {
        name: 'Videos Not Counted',
        data: data.daily.map(function (d) {
          return [d.date.valueOf(), d.n_video - d.n_watched]
        }),
        color: colors[1]
      }
    ]
  });

  Highcharts.chart('mrh-bar-counts', {
    chart: {
      type: 'column'
    },
    title: {
      text: 'How many fish have been counted for each day?'
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
        text: '# Fish Counted'
      }
    },
    legend: {
      enabled: false
    },
    series: [{
      name: '# Counts',
      data: data.daily.map(function (d) {
        return [d.date.valueOf(), d.n_count > 0 ? d.sum_count / d.n_count : 0]
      }),
      color: colors[2]
    }]
  });
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

      draw(response.data);
    })
}