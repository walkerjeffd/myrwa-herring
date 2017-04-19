var Highcharts = require('highcharts'),
    d3 = require('d3-request'),
    $ = require('jquery');

require('./css/app.css')

var state = {
  step: undefined,
  data: []
}

var colors = Highcharts.getOptions().colors;

var steps = {
  step1: {
    enter: function () {
      console.log('step1:enter');

      $('.charts-a').show();
      $('.charts-c').hide();

      state.chart = Highcharts.chart('chart-a', {
        chart: {
          zoomType: 'xy',
          //width: 800,
          margin: [50, 80, 50, 80]
        },
        title: {
          align: 'left',
          text: ''
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            day: '%b %d',
            week: '%b %d',
          },
          title: {
            text: 'Date'
          },
          startOnTick: true
        },
        yAxis: [
          {
            title: {
              text: '# Herring per Day',
            },
            labels: {
              format: '{value:,.0f}',
            },
            tickAmount: 6
          }, {
            title: {
              text: 'Water Temperature',
            },
            labels: {
              format: '{value} °F',
            },
            opposite: true,
            tickAmount: 6,
            visible: false
          }
        ],
        tooltip: {
          shared: true
        },
        plotOptions: {
          column: {
            groupPadding: 0,
            pointPadding: 0
          },
          series: {
            dataLabels: {
              shape: 'callout',
              backgroundColor: 'rgba(0, 0, 0, 0.67)',
              style: {
                color: '#FFFFFF',
                textShadow: 'none'
              }
            }
          }
        },
        legend: {
          enabled: false
        },
        series: [
          {
            name: '# Herring',
            type: 'column',
            yAxis: 0,
            data: state.data[2016].map(function (d) {
              return [d.date.valueOf(), d.fish];
            }),
            color: colors[1],
            states: {
              hover: {
                color: '#AAA'
              }
            }
          },
          {
            name: 'Water Temperature',
            type: 'line',
            yAxis: 1,
            data: state.data[2016].map(function (d) {
              // return [d.date.valueOf(), d.watertemp];
              return [d.date.valueOf(), 0];
            }),
            visible: false,
            color: colors[0],
          },
          {
            name: '55 °F Threshold',
            type: 'line',
            yAxis: 1,
            data: [
              [state.data[2016][0].date.valueOf(), 55],
              {
                x: state.data[2016][state.data[2016].length-5].date.valueOf(),
                y: 55,
                dataLabels: {
                  enabled: true,
                  format: '55 °F',
                  align: 'center',
                  verticalAlign: 'top',
                  y: 10
                }
              },
              [state.data[2016][state.data[2016].length-1].date.valueOf(), 55]
            ],
            dashStyle: 'Dash',
            color: 'orangered',
            marker: {
              enabled: false
            },
            enableMouseTracking: false,
            visible: false
          }
        ]
      });
    },
    exit: function (next) {
      console.log('step1:exit');
      next();
    }
  },
  step2: {
    enter: function () {
      console.log('step3:enter');
      $('.charts-a').show();
      $('.charts-c').hide();
      state.chart.series[0].points[20].update({
        dataLabels: {
          enabled: true,
          format: 'Some Arrive',
          align: 'center',
          verticalAlign: 'middle',
          x: 0,
          y: 50
        }
      }, false);
      state.chart.series[0].points[37].update({
        dataLabels: {
          enabled: true,
          format: 'Most Arrive',
          align: 'center',
          verticalAlign: 'middle',
          x: 0,
          y: 200
        }
      }, false);
      state.chart.redraw();
    },
    exit: function (next) {
      console.log('step3:exit');
      state.chart.series[0].points[20].update({
        dataLabels: {
          enabled: false
        }
      }, false);
      state.chart.series[0].points[37].update({
        dataLabels: {
          enabled: false
        }
      }, false);
      state.chart.redraw();
      next();
    }
  },
  step3: {
    enter: function () {
      console.log('step3:enter');
      $('.charts-a').show();
      $('.charts-c').hide();
      state.chart.yAxis[1].update({visible: true}, false)
      state.chart.series[1].update({visible: true}, false)
      state.chart.redraw();
      state.chart.series[1].setData(state.data[2016].map(function (d) {
        return [d.date.valueOf(), d.watertemp];
      }), true);
    },
    exit: function (next) {
      console.log('step3:exit');
      state.chart.series[1].update({visible: false}, false)
      state.chart.yAxis[1].update({visible: false}, false)
      state.chart.redraw();
      next();
    }
  },
  step4: {
    enter: function () {
      console.log('step4:enter');
      $('.charts-a').show();
      $('.charts-c').hide();
      state.chart.yAxis[1].update({visible: true}, false)
      state.chart.series[1].setData(state.data[2016].map(function (d) {
        return [d.date.valueOf(), d.watertemp];
      }), false);
      state.chart.series[1].update({visible: true}, false)
      state.chart.series[2].update({visible: true}, false)

      state.chart.xAxis[0].addPlotBand({
        from: new Date('2016-04-21'),
        to: new Date('2016-05-03'),
        color: '#FCFFC5',
        id: 'plot-band-1'
      }, false);
      state.chart.xAxis[0].addPlotBand({
        from: new Date('2016-05-08'),
        to: new Date('2016-06-28'),
        color: '#FCFFC5',
        id: 'plot-band-2'
      }, false);
      state.chart.redraw();
    },
    exit: function (next) {
      console.log('step4:exit');
      state.chart.yAxis[1].update({visible: false}, false)
      state.chart.series[1].update({visible: false}, false)
      state.chart.series[2].update({visible: false}, false)
      state.chart.xAxis[0].removePlotBand('plot-band-1', false);
      state.chart.xAxis[0].removePlotBand('plot-band-2', false);
      state.chart.redraw();
      next();
    }
  },
  step5: {
    enter: function () {
      console.log('step5:enter');

      $('.btn-year').removeClass('active');
      $('#btn-year-2012').addClass('active');

      $('.charts-a').hide();
      $('.charts-c').show();

      state.chartC = Highcharts.chart('chart-c', {
        chart: {
          zoomType: 'xy',
          //width: 800,
          margin: [50, 80, 80, 80]
        },
        title: {
          align: 'center',
          text: 'Year: ' + 2012
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            day: '%b %d',
            week: '%b %d',
          },
          title: {
            text: 'Date'
          },
          startOnTick: true
        },
        yAxis: [
          {
            title: {
              text: '# Herring per Day',
            },
            labels: {
              format: '{value:,.0f}',
            },
            tickAmount: 6,
            min: 0,
            max: 50000
          }, {
            title: {
              text: 'Temperature',
            },
            labels: {
              format: '{value} °F',
            },
            opposite: true,
            tickAmount: 6,
            min: 30,
            max: 80
          }
        ],
        tooltip: {
          shared: true
        },
        plotOptions: {
          column: {
            groupPadding: 0,
            pointPadding: 0
          },
          series: {
            dataLabels: {
              shape: 'callout',
              backgroundColor: 'rgba(0, 0, 0, 0.67)',
              style: {
                color: '#FFFFFF',
                textShadow: 'none'
              }
            }
          }
        },
        series: [
          {
            name: '# Herring',
            type: 'column',
            yAxis: 0,
            data: state.data[2012].map(function (d) {
              return [d.date.valueOf(), d.fish];
            }),
            color: colors[1],
            states: {
              hover: {
                color: '#AAA'
              }
            }
          },
          {
            name: 'Water Temperature',
            type: 'line',
            yAxis: 1,
            data: state.data[2012].map(function (d) {
              return [d.date.valueOf(), d.watertemp];
            }),
            color: colors[0]
          },
          {
            name: 'Air Temperature',
            type: 'line',
            yAxis: 1,
            data: state.data[2012].map(function (d) {
              return [d.date.valueOf(), d.airtemp];
            }),
            color: colors[3]
          }
        ]
      })

      $('.btn-year').click(function (evt) {
        var year = +$(evt.target).text();

        $('.btn-year').removeClass('active');
        $('#btn-year-' + year).addClass('active');

        state.chartC.series[0].setData(state.data[year].map(function (d) {
          return [d.date.valueOf(), d.fish];
        }), false);

        state.chartC.series[1].setData(state.data[year].map(function (d) {
          return [d.date.valueOf(), d.watertemp];
        }), false);

        state.chartC.series[2].setData(state.data[year].map(function (d) {
          return [d.date.valueOf(), d.airtemp];
        }), false);

        state.chartC.update({title: {text: 'Year: ' + year}}, false)

        state.chartC.redraw(false);
      })
    },
    exit: function (next) {
      console.log('step5:exit');
      state.chartC.destroy();
      $('.charts-c').hide();

      next();
    }
  }
}

function goToStep (step) {
  console.log('goToStep(%s)', step);
  if (step === 5) {
    $('#btn-next').addClass('disabled');
  } else {
    $('#btn-next').removeClass('disabled');
  }

  $('.btn-step').removeClass('active');
  $('#btn-step' + step).addClass('active');
  $('.annotation').hide();
  $('#annotation-step' + step).show();
  if (!isFinite(state.step)) {
    state.step = step;
    steps['step' + step].enter();
  } else {
    steps['step' + state.step].exit(function () {
      state.step = step;
      steps['step' + step].enter();
    });
  }
}

window.onload = function () {
  $('.btn-step').click(function (evt) {
    var step = +$(evt.target).text();
    goToStep(step);
  });

  $('#btn-next').click(function (evt) {
    if (state.step < 5) {
      goToStep(state.step + 1);
    }
  });

  d3.csv('https://s3.amazonaws.com/mysticriver.org/herring/data/myrwa-herring-dataset.csv')
    .row(function (d) {
      return {
        year: +d['Year'],
        date: new Date(d['Date']),
        fish: +d['# Fish'],
        rain: +d['Rainfall (in)'],
        flow: +d['Flow (cfs)'],
        airtemp: +d['Avg Air Temperature (degF)'],
        watertemp: +d['Avg Water Temperature (degF)'],
      }
    })
    .get(function (err, data) {
      if (err) {
        $('#server-error').show();
        $('#app').hide();
        return;
      }

      $('#app').fadeIn();

      state.data = {};

      [2012, 2013, 2014, 2015, 2016].forEach(function (year) {
        state.data[year] = data.filter(function (d) {
          return d.year === year;
        });
      });

      goToStep(1);
    });
}