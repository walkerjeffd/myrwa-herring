var $ = require('jquery'),
    Odometer = require('odometer'),
    Highcharts = require('highcharts');

var config = require('../../config');

require('./css/app.css')

var colors = Highcharts.getOptions().colors;

window.onload = function () {
  var odFishToday = new Odometer({
    el: document.getElementById('odometer-fish-today'),
    value: 0
  });
  var odFishTotal = new Odometer({
    el: document.getElementById('odometer-fish-total'),
    value: 0
  });
  var odVideoToday = new Odometer({
    el: document.getElementById('odometer-video-today'),
    value: 0
  });
  var odVideoTotal = new Odometer({
    el: document.getElementById('odometer-video-total'),
    value: 0
  });

  $.get(config.api.url + '/status/', function (response) {
    var data = response.data;

    data.forEach(function (d) {
      d.date = new Date(d.date);
    });

    var total = data.reduce(function (p, v) {
      p.n_count += v.n_count;
      p.sum_count += v.sum_count;
      return p;
    }, { n_count: 0, sum_count: 0 });

    var today = data[data.length - 1];

    odFishToday.update(today.sum_count);
    odFishTotal.update(total.sum_count);
    odVideoToday.update(today.n_count);
    odVideoTotal.update(total.n_count);

    Highcharts.chart('chart-fish', {
      chart: {
        type: 'column',
        height: 275
      },
      title: {
        text: ''
      },
      plotOptions: {
        column: {
          groupPadding: 0.05,
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
          text: '# Fish Counted'
        }
      },
      series: [
        {
          name: '# Fish',
          data: data.map(function (d) {
            return [d.date.valueOf(), d.sum_count]
          }),
          color: colors[0]
        }
      ]
    });

    Highcharts.chart('chart-counts', {
      chart: {
        type: 'column',
        height: 275
      },
      title: {
        text: ''
      },
      plotOptions: {
        column: {
          groupPadding: 0.05,
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
          text: '# Videos Counted'
        }
      },
      series: [
        {
          name: '# Videos',
          data: data.map(function (d) {
            return [d.date.valueOf(), d.n_count]
          }),
          color: colors[3]
        }
      ]
    });
  })
}
