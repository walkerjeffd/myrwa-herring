<template>
  <div style="margin-left:-17px">
    <div class="row sqs-row">
      <div class="col sqs-col-12 span-12">

        <div class="sqs-block html-block sqs-block-html count-title-block" data-block-type="2">
          <div class="sqs-block-content">
            <h1>Data for the 2020 Town Brook Herring Run</h1>
          </div>
        </div>

        <!-- ACTIVITY TRACKER -->
        <div class="sqs-block html-block sqs-block-html count-title-block" data-block-type="2">
          <div class="sqs-block-content">
            <h1 class="count-title">Today's Activity</h1>
            <p class="small-text">Each bubble represents one video count from today. The bubble is placed at the time when the video was counted (<i>not</i> when the video was recorded). The size of the bubble indicates how many fish were counted in that video. Hover your mouse over the bubbles to see more information, or click and drag to zoom in.</p>
          </div>
        </div>
        <div class="row sqs-row">
          <div class="col sqs-col-3 span-3">
            <div class="sqs-block html-block sqs-block-html" data-block-type="2">
              <div class="sqs-block-content">
                <div class="odometer-wrapper" style="padding-top:30px">
                  <div class="text-align-center odometer-value">
                    <span id="odometer-activity-total" class="odometer">0</span>
                  </div>
                  <p class="text-align-center odometer-label">Videos Counted Today</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col sqs-col-9 span-9">
            <div class="sqs-block image-block sqs-block-image" data-block-type="5">
              <div class="sqs-block-content">
                <div id="chart-activity"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ESTIMATED RUN -->
        <div class="sqs-block html-block sqs-block-html count-title-block" data-block-type="2">
          <div class="sqs-block-content">
            <h1 class="count-title">Total Estimated Fish Run</h1>
            <p class="small-text">Each bar shows our current estimate of the total number of fish migrating each day. These totals are updated in real-time using a statistical model that estimates how many fish migrate <em>over the entire day</em> based the individual counts of videos recorded on that day. The error bars represent our uncertainty in the daily total (95% confidence interval).</p>
          </div>
        </div>
        <div class="row sqs-row">
          <div class="col sqs-col-3 span-3">
            <div class="sqs-block html-block sqs-block-html" data-block-type="2">
              <div class="sqs-block-content">
                <div class="odometer-wrapper" style="padding-top:70px">
                  <div class="text-align-center odometer-value">
                    <span id="odometer-run-total" class="odometer">0</span>
                  </div>
                  <div class="text-align-center odometer-value-small">
                    +/- <span id="odometer-run-range" class="odometer">0</span>
                  </div>
                  <p class="text-align-center odometer-label">Total Estimated Fish Run</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col sqs-col-9 span-9">
            <div class="sqs-block image-block sqs-block-image" data-block-type="5">
              <div class="sqs-block-content">
                <div id="chart-run"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- FISH STATUS -->
        <div class="sqs-block html-block sqs-block-html count-title-block" data-block-type="2">
          <div class="sqs-block-content">
            <h1 class="count-title">Number of Fish Counted</h1>
            <p class="small-text">Each bar shows the total number of fish that have been counted for each day (so far). These totals will increase as more videos are watched. Note that these totals tend to be much less than those in the chart above, which uses these counts to estimate the total number of fish passing over the entire day, not just during the videos that have been counted so far.</p>
          </div>
        </div>
        <div class="row sqs-row">
          <div class="col sqs-col-3 span-3">
            <div class="sqs-block html-block sqs-block-html" data-block-type="2">
              <div class="sqs-block-content">
                <div class="odometer-wrapper" style="padding-top:70px">
                  <div class="text-align-center odometer-value">
                    <span id="odometer-fish-total" class="odometer">0</span>
                  </div>
                  <p class="text-align-center odometer-label">Total Fish Counted</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col sqs-col-9 span-9">
            <div class="sqs-block image-block sqs-block-image" data-block-type="5">
              <div class="sqs-block-content">
                <div id="chart-fish"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- VIDEO STATUS -->
        <div class="sqs-block html-block sqs-block-html count-title-block" data-block-type="2">
          <div class="sqs-block-content">
            <h1 class="count-title">Number of Videos</h1>
            <p class="small-text">Each bar shows how many videos were recorded each day, plus how many of those have been counted and how many remain to be counted. The number of recorded videos depends on how active the fish were on that day, but also whether the camera was properly configured to only record when it detected fish and not other things floating by.</p>
          </div>
        </div>
        <div class="row sqs-row">
          <div class="col sqs-col-3 span-3">
            <div class="sqs-block html-block sqs-block-html" data-block-type="2">
              <div class="sqs-block-content">
                <div class="odometer-wrapper" style="padding-top:30px">
                  <div class="text-align-center odometer-value">
                    <span id="odometer-video-counted" class="odometer">0</span>
                  </div>
                  <p class="text-align-center odometer-label">Total Videos<br /> Counted</p>
                </div>
                <div class="odometer-wrapper" style="padding-top:10px">
                  <div class="text-align-center odometer-value">
                    <span id="odometer-video-remaining" class="odometer">0</span>
                  </div>
                  <p class="text-align-center odometer-label">Total Videos Remaining</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col sqs-col-9 span-9">
            <div class="sqs-block image-block sqs-block-image" data-block-type="5">
              <div class="sqs-block-content">
                <div id="chart-video"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import * as d3Time from 'd3-time';
import * as d3TimeFormat from 'd3-time-format';
import moment from 'moment';
import Odometer from 'odometer';
import jStat from 'jStat';

window.moment = moment;

export default {
  data() {
    return {
      locationId: 'PLY',
      data: {
        activity: {
          total: 0,
          values: []
        },
        run: {
          total: {
            y: 0,
            range: 0
          },
          values: []
        },
        fish: {
          total: 0,
          values: []
        },
        video: {
          total: {
            counted: 0,
            remaining: 0
          },
          values: []
        }
      },
      charts: {
        activity: null,
        run: null,
        fish: null,
        video: null
      },
      odometers: {
        activity: null,
        run: {
          total: null,
          range: null
        },
        fish: null,
        video: {
          counted: null,
          remaining: null
        }
      }
    };
  },
  mounted() {
    let today = d3Time.timeDay.floor(new Date());
    if (today.getUTCHours() < 4) {
      today = new Date(today.getTime() - (86400 * 1000));
    }
    const tomorrow = new Date(today.getTime() + (86400 * 1000));

    this.odometers.activity = new Odometer({
      el: document.getElementById('odometer-activity-total'),
      value: 0
    });
    this.odometers.run.total = new Odometer({
      el: document.getElementById('odometer-run-total'),
      value: 0
    });
    this.odometers.run.range = new Odometer({
      el: document.getElementById('odometer-run-range'),
      value: 0
    });
    this.odometers.fish = new Odometer({
      el: document.getElementById('odometer-fish-total'),
      value: 0
    });
    this.odometers.video.counted = new Odometer({
      el: document.getElementById('odometer-video-counted'),
      value: 0
    });
    this.odometers.video.remaining = new Odometer({
      el: document.getElementById('odometer-video-remaining'),
      value: 0
    });

    this.charts.activity = this.$highcharts.chart('chart-activity', {
      chart: {
        type: 'bubble',
        height: 150,
        marginLeft: 75,
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
          '<tr><th style="text-align:right">Video Recorded At:</th><td style="padding-left:10px">{point.video_timestamp}</td></tr>' +
          '<tr><th style="text-align:right">Video Duration:</th><td style="padding-left:10px">{point.duration} sec</td></tr>',
        footerFormat: '</table>',
        followPointer: false,
        hideDelay: 250
      },
      series: []
    });
    this.charts.run = this.$highcharts.chart('chart-run', {
      chart: {
        type: 'column',
        height: 275,
        marginLeft: 75
      },
      title: {
        text: ''
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          month: '%b %d',
          week: '%b %d',
          day: '%b %d'
        },
        title: {
          text: 'Date'
        }
        // min: this.dateRange[0].valueOf(),
        // max: this.dateRange[1].valueOf()
      },
      yAxis: {
        title: {
          text: 'Estimated # Fish per Day'
        }
      },
      plotOptions: {
        column: {
          groupPadding: 0,
          pointPadding: 0
        }
      },
      legend: {
        enabled: false
      },
      series: [],
      tooltip: {
        shared: true
      }
    });
    this.charts.fish = this.$highcharts.chart('chart-fish', {
      chart: {
        type: 'column',
        height: 275,
        marginLeft: 75
      },
      title: {
        text: ''
      },
      plotOptions: {
        column: {
          groupPadding: 0,
          pointPadding: 0,
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
          week: '%b %d',
          day: '%b %d'
        },
        title: {
          text: 'Date'
        }
        // min: this.dateRange[0].valueOf(),
        // max: this.dateRange[1].valueOf()
      },
      yAxis: {
        min: 0,
        title: {
          text: '# Fish Counted per Day'
        }
      },
      series: []
    });
    this.charts.video = this.$highcharts.chart('chart-video', {
      chart: {
        type: 'column',
        height: 275,
        marginLeft: 75
      },
      title: {
        text: ''
      },
      plotOptions: {
        column: {
          groupPadding: 0,
          pointPadding: 0,
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
          week: '%b %d',
          day: '%b %d'
        },
        title: {
          text: 'Date'
        }
        // min: this.dateRange[0].valueOf(),
        // max: this.dateRange[1].valueOf()
      },
      yAxis: {
        min: 0,
        title: {
          text: '# Videos Recorded per Day'
        }
      },
      series: []
    });

    this.fetchStatusData()
      .then(this.updateStatus);
    this.fetchRunData()
      .then(this.updateRun);
  },
  methods: {
    fetchStatusData() {
      const utcFormat = d3TimeFormat.utcFormat('%b %d %I:%M %p EDT');
      const edtFormat = x => utcFormat(d3Time.timeHour.offset(x, -4));

      return this.$http.get('/status/', { params: { location_id: this.locationId } })
        .then((response) => {
          const data = response.data.data;

          const dataActivity = data.activity.map(d => ({
            x: (new Date(d.count_timestamp)).valueOf(),
            y: 0,
            z: d.count,
            duration: Math.round(d.duration),
            video_timestamp: edtFormat(new Date(d.video_start)),
            count_timestamp: edtFormat(new Date(d.count_timestamp))
          }));
          const dataFish = data.fish.map(d => [
            d3Time.timeHour.offset(new Date(d.date), 4).valueOf(),
            Math.round(d.count)
          ]);
          const dataVideo = data.video.map(d => ({
            date: d3Time.timeHour.offset(new Date(d.date), 4),
            n_remaining: d.n_total - d.n_counted,
            n_counted: d.n_counted
          }));

          this.data.activity.total = dataActivity.length;
          this.data.activity.values = dataActivity;
          this.data.fish.total = dataFish.reduce((p, v) => (p + v[1]), 0);
          this.data.fish.values = dataFish;
          this.data.video.total.counted = dataVideo.reduce((p, v) => (p + v.n_counted), 0);
          this.data.video.total.remaining = dataVideo.reduce((p, v) => (p + v.n_remaining), 0);
          this.data.video.values = dataVideo;
        });
    },
    fetchRunData() {
      return this.$http.get('/run-estimate/', { params: { location_id: this.locationId } })
        .then((response) => {
          const data = response.data.data;

          this.data.run.values = data.map((d) => {
            let tStar = jStat.studentt.inv(0.975, d.df);
            if (isNaN(tStar)) {
              tStar = 0;
            }
            return {
              x: (d3Time.timeHour.offset(new Date(d.date), 4)).valueOf(),
              y: Math.round(d.y),
              low: Math.max(Math.round(d.y) - (tStar * Math.sqrt(d.var_y)), 0),
              high: Math.round(d.y) + (tStar * Math.sqrt(d.var_y))
            };
          });

          const totalData = data.reduce((p, v) => {
            p.y += v.y;           // eslint-disable-line
            p.var_y += v.var_y;   // eslint-disable-line
            p.df_num += v.df_num; // eslint-disable-line
            p.df_den += v.df_den; // eslint-disable-line
            return p;
          }, { y: 0, var_y: 0, df_num: 0, df_den: 0 });

          totalData.df = Math.round((totalData.df_num * totalData.df_num) / totalData.df_den);
          totalData.tStar = jStat.studentt.inv(0.975, totalData.df);
          totalData.y = totalData.y;
          totalData.ciRange = totalData.tStar * Math.sqrt(totalData.var_y);

          this.data.run.total = {
            y: Math.round(totalData.y),
            range: Math.round(totalData.ciRange)
          };
        });
    },
    updateStatus() {
      const colors = this.$highcharts.getOptions().colors;

      // activity
      this.odometers.activity.update(this.data.activity.total);
      this.charts.activity.addSeries({
        name: 'Video Count',
        data: this.data.activity.values
      });

      // fish counts
      this.odometers.fish.update(Math.round(this.data.fish.total));
      this.charts.fish.addSeries({
        name: '# Fish',
        data: this.data.fish.values
        // color: colors[2]
      });

      // video counts
      this.odometers.video.counted.update(this.data.video.total.counted);
      this.odometers.video.remaining.update(this.data.video.total.remaining);
      this.charts.video.addSeries({
        name: '# Counted',
        data: this.data.video.values.map(d => ({ x: d.date.valueOf(), y: d.n_counted })),
        color: colors[3]
      }, false);
      this.charts.video.addSeries({
        name: '# Not Counted',
        data: this.data.video.values.map(d => ({ x: d.date.valueOf(), y: d.n_remaining }))
      });
    },
    updateRun() {
      this.odometers.run.total.update(this.data.run.total.y);
      this.odometers.run.range.update(this.data.run.total.range);
      this.charts.run.addSeries({
        name: 'Estimated # Fish',
        data: this.data.run.values.map(d => ({ x: d.x, y: d.y })),
        type: 'column',
        tooltip: {
          valueDecimals: 0
        }
      }, false);
      this.charts.run.addSeries({
        name: 'Uncertainty Range',
        data: this.data.run.values.map(d => ({ x: d.x, low: d.low, high: d.high })),
        type: 'errorbar',
        tooltip: {
          valueDecimals: 0
        }
      }, true);
    }
  }
};
</script>

<style scoped>
h1.count-title {
  font-size: 24px;
}
.small-text {
  font-size: 0.7em;
  line-height: 1.3;
  font-family: sans-serif;
  color: #888;
}
.select-label {
  text-align: right;
}
p.odometer-label {
  margin-top: 5px;
  font-size: 16px;
  line-height: 1.2;
}
.odometer-value {
  font-size: 32px;
}
.odometer-value-small {
  font-size: 16px;
}
.count-title-block {
  padding-bottom: 0;
}
.count-title {
  border-bottom: 1px solid #EEE;
}

</style>
