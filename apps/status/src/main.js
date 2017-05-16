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

    data.byVideoDate.forEach(function (d) {
      d.date = new Date(d.date);
    });
    data.byCountDate.forEach(function (d) {
      d.date = new Date(d.date);
    });

    od_n_video.update(+data.summary.n_video);
    od_n_count.update(+data.summary.n_count);
    od_sum_count.update(+data.summary.sum_count);

    Highcharts.chart('chart-counts', {
      chart: {
        type: 'column'
      },
      title: {
        text: 'How many videos have been counted?',
        align: 'left'
      },
      subtitle: {
        text: 'Each bar indicates how many videos were counted on a given day. The date corresponds to when the videos were counted, not when they were recorded. So if you count another video right now, then it will show up in the total for today!',
        align: 'left'
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
          text: 'Date Videos were Counted'
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
          name: 'Videos Counted',
          data: data.byCountDate.map(function (d) {
            return [d.date.valueOf(), d.n_count]
          }),
          color: colors[2]
        }
      ]
    });

    Highcharts.chart('chart-fish', {
      chart: {
        type: 'column'
      },
      title: {
        text: 'How many river herring have been counted?',
        align: 'left'
      },
      subtitle: {
        text: 'Each bar represents the number of river herring counted so far on a given day. The date corresponds to when the fish were actually swimming, not when they were counted. So if you count another video right now, it will likely be added to the tally on a previous day (unless you happen to get a video recorded today!).',
        align: 'left'
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
          text: 'Date Videos were Recorded'
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: '# Herring Counted'
        }
      },
      series: [
        {
          name: 'Herring Counted',
          data: data.byVideoDate.map(function (d) {
            return [d.date.valueOf(), d.sum_count]
          }),
          color: colors[3]
        }
      ]
    });

    Highcharts.chart('chart-videos', {
      chart: {
        type: 'column'
      },
      title: {
        text: 'How many videos have been recorded?',
        align: 'left'
      },
      subtitle: {
        text: 'The total height of each bar represents how many videos were recorded on each day. More videos on a given day may mean there were more fish, but usually it means the camera needed to be adjusted.',
        align: 'left'
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
          text: 'Date Videos were Recorded'
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: '# Videos'
        }
      },
      series: [
        {
          name: 'Videos Counted',
          data: data.byVideoDate.map(function (d) {
            return [d.date.valueOf(), d.n_watched]
          }),
          color: colors[0]
        }, {
          name: 'Videos Not Counted',
          data: data.byVideoDate.map(function (d) {
            return [d.date.valueOf(), d.n_video - d.n_watched]
          }),
          color: colors[1]
        }
      ]
    });
  })
}
