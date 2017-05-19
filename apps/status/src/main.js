var $ = require('jquery'),
    Odometer = require('odometer'),
    Highcharts = require('highcharts'),
    d3 = require('d3-time-format');

require('highcharts/highcharts-more.js')(Highcharts);

var config = require('../../config');

require('./css/app.css')

var colors = Highcharts.getOptions().colors;

window.onload = function () {
  var odActivityTotal = new Odometer({
    el: document.getElementById('odometer-activity-total'),
    value: 0
  });
  var odFishTotal = new Odometer({
    el: document.getElementById('odometer-fish-total'),
    value: 0
  });
  var odVideoCounted = new Odometer({
    el: document.getElementById('odometer-video-counted'),
    value: 0
  });
  var odVideoRemaining = new Odometer({
    el: document.getElementById('odometer-video-remaining'),
    value: 0
  });

  var dateFormat = d3.timeFormat('%b %d');
  var timestampFormat = d3.timeFormat('%b %d %I:%M %p')

  $.get(config.api.url + '/status/', function (response) {
    var data = response.data;

    data.fish.forEach(function (d) {
      d.date = new Date(d.date);
      d.count = Math.round(d.count);
    });
    data.video.forEach(function (d) {
      d.date = new Date(d.date);
      d.n_remaining = d.n_total - d.n_counted;
    });
    data.activity.forEach(function (d) {
      d.count_timestamp = new Date(d.count_timestamp);
      d.video_start = new Date(d.video_start);
      d.video_end = new Date(d.video_end);
      d.duration = Math.round(d.duration);
    });

    var totals = {
      fish: data.fish.reduce(function (p, v) {
          return p + v.count;
        }, 0),
      video: {
        counted: data.video.reduce(function (p, v) {
            return p + v.n_counted;
          }, 0),
        remaining: data.video.reduce(function (p, v) {
            return p + v.n_remaining;
          }, 0)
      }
    }

    odActivityTotal.update(data.activity.length);
    odFishTotal.update(Math.round(totals.fish));
    odVideoCounted.update(totals.video.counted);
    odVideoRemaining.update(totals.video.remaining);

    var today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    var tomorrow = new Date(today.getTime() + 86400 * 1000);

    Highcharts.chart('chart-activity', {
      chart: {
        type: 'bubble',
        height: 150,
        marginLeft: 60,
        zoomType: 'x'
      },
      title: {
        text: ''
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          month: '%b %d',
          day: '%b %d'
        },
        title: {
          text: 'Time'
        },
        min: today.valueOf(),
        max: tomorrow.valueOf()
      },
      yAxis: {
        visible: false
      },
      plotOptions: {
        bubble: {
          marker: {
            fillOpacity: 0.1
          },
          minSize: 2,
          maxSize: 50
        }
      },
      legend: {
        enabled: false
      },
      tooltip: {
        useHTML: true,
        headerFormat: '<table>',
        pointFormat: '<tr><th style="text-align:right"># Fish Counted:</th><td style="padding-left:10px">{point.z}</td></tr>' +
          '<tr><th style="text-align:right">Counted At:</th><td style="padding-left:10px">{point.count_timestamp}</td></tr>' +
          '<tr><th style="text-align:right">Video Recorded At:</th><td style="padding-left:10px">{point.video_timestamp}</td></tr>'+
          '<tr><th style="text-align:right">Video Duration:</th><td style="padding-left:10px">{point.duration} sec</td></tr>',
        footerFormat: '</table>',
        followPointer: true
      },
      series: [
        {
          name: 'Video Count',
          data: data.activity.map(function (d) {
            return {
              x: d.count_timestamp.valueOf() - 4 * 3600 * 1000,
              y: 0,
              z: d.count,
              // date: dateFormat(d.count_date),
              duration: d.duration,
              video_timestamp: timestampFormat(d.video_start),
              count_timestamp: timestampFormat(d.count_timestamp)
            }
          })
        }
      ]
    })

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
          text: '# Fish Counted (so far)'
        }
      },
      series: [
        {
          name: '# Fish',
          data: data.fish.map(function (d) {
            return [d.date.valueOf(), d.count]
          }),
          color: colors[2]
        }
      ]
    });

    Highcharts.chart('chart-video', {
      chart: {
        type: 'column',
        height: 300
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
      },
      tooltip: {
        shared: true
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
        }
      },
      series: [
        {
          name: '# Counted',
          data: data.video.map(function (d) {
            return {x: d.date.valueOf(), y: d.n_counted}
          }),
          color: colors[3]
        },
        {
          name: '# Remaining',
          data: data.video.map(function (d) {
            return {x: d.date.valueOf(), y: d.n_remaining}
          }),
          color: colors[4]
        }
      ]
    });
  })
}
