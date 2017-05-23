var Highcharts = require('highcharts'),
    d3 = require('d3-request'),
    $ = require('jquery');

require('highcharts/highcharts-more.js')(Highcharts);

require('./css/app.css')

var state = {
  step: undefined,
  data: [],
  charts: {}
}

var colors = Highcharts.getOptions().colors;

Highcharts.setOptions({
  lang: {
    thousandsSep: ','
  }
});

var totalData = [
  {
    year: 2012,
    total: 198933,
    error: 18062
  },
  {
    year: 2013,
    total: 193125,
    error: 24250
  },
  {
    year: 2014,
    total: 239057,
    error: 37288
  },
  {
    year: 2015,
    total: 477829,
    error: 40674
  },
  {
    year: 2016,
    total: 448060,
    error: 48113
  }
]

function initCharts() {
  state.charts.column = Highcharts.chart('chart-column', {
    chart: {
      zoomType: 'x',
      type: 'column'
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
    yAxis: {
      title: {
        text: '# Herring per Day',
      },
      labels: {
        format: '{value:,.0f}',
      }
    },
    plotOptions: {
      column: {
        pointPadding: 0,
        groupPadding: 0,
        stacking: 'normal'
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
    }
  });
  state.charts.line = Highcharts.chart('chart-line', {
    chart: {
      zoomType: 'x',
      type: 'column'
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
    yAxis: {
      title: {
        text: '# Herring per Day',
      },
      labels: {
        format: '{value:,.0f}',
      }
    },
    tooltip: {
      shared: true
    },
    plotOptions: {
      line: {
        marker: {
          enabled: false,
          symbol: 'circle'
        }
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
    }
  });
  state.charts.total = Highcharts.chart('chart-total', {
    chart: {
      type: 'column'
    },
    title: {
      text: ''
    },
    xAxis: {
      title: {
        text: 'Year'
      }
    },
    yAxis: {
      title: {
        text: 'Total # of Herring',
      },
      labels: {
        format: '{value:,.0f}',
      }
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true,
          y: -25,
          format: '{y:,.0f}'
        }
      }
    }
  });
}

var steps = {
  step1: {
    enter: function () {
      console.log('step1:enter');

      $('#chart-line').hide();
      $('#chart-total').hide();
      $('#chart-column').fadeIn();

      if (state.charts.column.series.length === 0) {
        state.data.byYear.forEach(function (d) {
          state.charts.column.addSeries({
            name: d.year,
            data: d.data.map(function (d) {
              return [d.date.valueOf(), d.fish];
            })
          }, false);
        });
        state.charts.column.redraw();
      }
    },
    exit: function (next) {
      console.log('step1:exit');
      $('#chart-column').hide();
      next();
    }
  },
  step2: {
    enter: function () {
      console.log('step3:enter');

      $('#chart-total').hide();
      $('#chart-line').fadeIn();

      if (state.charts.line.series.length === 0) {
        state.data.byYear.forEach(function (d) {
          state.charts.line.addSeries({
            name: d.year,
            type: 'line',
            data: d.data.map(function (d) {
              return [d.julianDate.valueOf(), d.fish];
            })
          }, false);
        });
      } else {
        state.data.byYear.forEach(function (d, i) {
          state.charts.line.series[i].setData(d.data.map(function (d) {
            return [d.julianDate.valueOf(), d.fish];
          }));
        });
      }
      state.charts.line.yAxis[0].setTitle({
        text: '# Herring per Day'
      });
      state.charts.line.redraw();
    },
    exit: function (next) {
      console.log('step3:exit');
      next();
    }
  },
  step3: {
    enter: function () {
      console.log('step3:enter');

      $('#chart-total').hide();
      $('#chart-line').fadeIn();

      if (state.charts.line.series.length === 0) {
        state.data.byYear.forEach(function (d) {
          state.charts.line.addSeries({
            name: d.year,
            type: 'line',
            data: d.data.map(function (d) {
              return [d.julianDate.valueOf(), d.fishSum];
            })
          }, false);
        });
      } else {
        state.data.byYear.forEach(function (d, i) {
          state.charts.line.series[i].setData(d.data.map(function (d) {
            return [d.julianDate.valueOf(), d.fishSum];
          }));
        });
      }
      state.charts.line.yAxis[0].setTitle({
        text: 'Cumulative # Herring per Year'
      });
    },
    exit: function (next) {
      console.log('step3:exit');
      next();
    }
  },
  step4: {
    enter: function () {
      console.log('step4:enter');

      $('#chart-line').hide();
      $('#chart-total').fadeIn();

      if (state.charts.total.series.length === 0) {
        state.charts.total.addSeries({
          name: 'Total',
          type: 'column',
          data: totalData.map(function (d) {
            return [d.year, d.total]
          })
        }, false);
        state.charts.total.addSeries({
          name: 'Error Range',
          type: 'errorbar',
          data: totalData.map(function (d) {
            return [d.year, d.total - d.error, d.total + d.error]
          }),
          whiskerLength: 15
        }, false)
      } else {
        state.charts.total.series[0].points.forEach(function (p) {
          p.update({
            dataLabels: {
              enabled: true,
              format: '{y:,.0f}'
            }
          }, false)
        });
      }

      state.charts.total.redraw();
    },
    exit: function (next) {
      console.log('step4:exit');
      next();
    }
  },
  step5: {
    enter: function () {
      console.log('step5:enter');

      $('#chart-line').hide();
      $('#chart-total').fadeIn();

      if (state.charts.total.series.length === 0) {
        state.charts.total.addSeries({
          name: 'Total',
          type: 'column',
          data: totalData.map(function (d) {
            return [d.year, d.total]
          })
        }, false);
        state.charts.total.addSeries({
          name: 'Error Range',
          type: 'errorbar',
          data: totalData.map(function (d) {
            return [d.year, d.total - d.error, d.total + d.error]
          }),
          whiskerLength: 15
        }, false)
        state.charts.total.redraw();
      }

      state.charts.total.series[0].points.forEach(function (p) {
        p.update({
          dataLabels: {
            enabled: false
          }
        }, false)
      });
      state.charts.total.series[0].points[0].update({
        dataLabels: {
          enabled: true,
          format: 'New Fish Ladder Installed<br/>Allows More Fish to Spawn',
          inside: true,
          align: 'center',
          verticalAlign: 'top',
          useHtml: true,
          y: -70
        }
      }, false);
      state.charts.total.series[0].points[3].update({
        dataLabels: {
          enabled: true,
          format: 'Fish Born in 2012<br/>Return as Adults to Spawn',
          inside: true,
          align: 'center',
          verticalAlign: 'top',
          useHtml: true,
          y: -70
        }
      }, false);


      state.charts.total.redraw();

    },
    exit: function (next) {
      console.log('step5:exit');
      next();
    }
  },
  step6: {
    enter: function () {
      console.log('step6:enter');
      $('#chart-line').hide();
      $('#chart-total').hide();
    },
    exit: function (next) {
      console.log('step6:exit');
      next();
    }
  }
}

function goToStep (step) {
  console.log('goToStep(%s)', step);
  if (step === 6) {
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

  d3.csv('https://s3.amazonaws.com/mysticriver.org/herring/data/vis-count.csv')
    .row(function (d) {
      return {
        year: +d.year,
        date: new Date(d.date),
        fish: +d.fish,
        fishSum: +d.fishSum
      }
    })
    .get(function (err, data) {
      if (err) {
        $('#server-error').show();
        $('#app').hide();
        return;
      }

      $('#app').fadeIn();

      data.forEach(function (d) {
        d.julianDate = new Date((new Date(d.date.getTime())).setYear(2012));
      });
      console.log(data[0]);

      state.data = {};
      state.data.all = data;

      var years = [2012, 2013, 2014, 2015, 2016];
      state.data.byYear = years.map(function (year) {
        return {
          year: year,
          data: data.filter(function (d) {
            return d.year === year;
          })
        };
      });

      initCharts();
      goToStep(1);
    });
}