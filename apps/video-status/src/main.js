var $ = require('jquery'),
    Odometer = require('odometer'),
    Highcharts = require('highcharts');

var config = require('../../config');

require('./css/app.css')

var colors = Highcharts.getOptions().colors;

window.onload = function () {
  var od_n_video = new Odometer({
    el: document.getElementById('mrh-odometer-n-video'),
    value: 0
  });
  var od_n_count = new Odometer({
    el: document.getElementById('mrh-odometer-n-count'),
    value: 0
  });
  var od_sum_count = new Odometer({
    el: document.getElementById('mrh-odometer-sum-count'),
    value: 0
  });

  $.get(config.api.url + '/status/', function (response) {
    var data = response.data;

    data.daily.forEach(function (d) {
      d.date = new Date(d.date);
    });

    od_n_video.update(+data.summary.n_video);
    od_n_count.update(+data.summary.n_count);
    od_sum_count.update(+data.summary.sum_count);

    Highcharts.chart('chart-videos', {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Number of Videos per Day'
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

    Highcharts.chart('chart-fish', {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Number of River Herring Counted per Day'
      },
      plotOptions: {
        column: {
          stacking: 'normal'
        }
      },
      legend: {
        enabled: false
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
          text: '# Fish'
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
          name: 'Herring Counted',
          data: data.daily.map(function (d) {
            return [d.date.valueOf(), d.sum_count]
          }),
          color: colors[3]
        }
      ]
    });
  })
}
