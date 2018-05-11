<template>
  <div style="margin-left:-17px">
    <div class="row sqs-row">
      <div class="col sqs-col-12 span-12">

        <div class="sqs-block html-block sqs-block-html count-title-block" data-block-type="2">
          <div class="sqs-block-content">
            <h1>Data for the 2018 Mystic River Herring Run</h1>
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
          <div class="col sqs-col-2 span-2">
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
          <div class="col sqs-col-7 span-7">
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
            <p class="small-text">Each bar shows the total estimated number of fish migrating each day. These estimates are calculated from the individual video counts using a statistical model. The error bars show the uncertainty in these estimates based on a 95% confidence interval.</p>
          </div>
        </div>
        <div class="row sqs-row">
          <div class="col sqs-col-2 span-2">
            <div class="sqs-block html-block sqs-block-html" data-block-type="2">
              <div class="sqs-block-content">
                <div class="odometer-wrapper" style="padding-top:70px">
                  <div class="text-align-center odometer-value">
                    <span id="odometer-run-total" class="odometer">0</span>
                  </div>
                  <div class="text-align-center odometer-value-small">
                    +/- <span id="odometer-run-range" class="odometer">0</span>
                  </div>
                  <p class="text-align-center odometer-label">Total Estimated Fish</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col sqs-col-7 span-7">
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
            <p class="small-text">Each bar shows how many fish were migrating each day based on the current video counts. These totals will increase as more videos are watched. Once all of the videos have been watched, we will know exactly how many fish were migrating each day.</p>
          </div>
        </div>
        <div class="row sqs-row">
          <div class="col sqs-col-2 span-2">
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
          <div class="col sqs-col-7 span-7">
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
            <h1 class="count-title">Number of Videos Counted</h1>
            <p class="small-text">Each bar shows how many videos were recorded each day, plus how many of those have been counted and how many remain to be counted. The number of recorded videos depends on how active the fish were on that day, but also whether the camera was properly configured to only record when it detected fish and not other things floating by.</p>
          </div>
        </div>
        <div class="row sqs-row">
          <div class="col sqs-col-2 span-2">
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
          <div class="col sqs-col-7 span-7">
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
import Odometer from 'odometer';
import jStat from 'jStat';

window.d3Time = d3Time;

export default {
  mounted() {
    const colors = this.$highcharts.getOptions().colors;
    const utcFormat = d3TimeFormat.utcFormat('%b %d %I:%M %p EDT');
    const edtFormat = x => utcFormat(d3Time.timeHour.offset(x, -4));

    const odActivityTotal = new Odometer({
      el: document.getElementById('odometer-activity-total'),
      value: 0
    });
    const odFishTotal = new Odometer({
      el: document.getElementById('odometer-fish-total'),
      value: 0
    });
    const odRunTotal = new Odometer({
      el: document.getElementById('odometer-run-total'),
      value: 0
    });
    const odRunRange = new Odometer({
      el: document.getElementById('odometer-run-range'),
      value: 0
    });
    const odVideoCounted = new Odometer({
      el: document.getElementById('odometer-video-counted'),
      value: 0
    });
    const odVideoRemaining = new Odometer({
      el: document.getElementById('odometer-video-remaining'),
      value: 0
    });

    let today = d3Time.timeDay.floor(new Date());
    if (today.getUTCHours() < 4) {
      today = new Date(today.getTime() - (86400 * 1000));
    }
    const tomorrow = new Date(today.getTime() + (86400 * 1000));

    this.$http.get('/run-estimate/?start=2018-04-25&end=2018-07-01')
      .then((response) => {
        const data = response.data.data;

        const chartData = data.map((d) => {
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
        const total = {
          y: Math.round(totalData.y),
          range: Math.round(totalData.ciRange)
        };
        odRunTotal.update(total.y);
        odRunRange.update(total.range);

        this.$highcharts.chart('chart-run', {
          title: {
            align: 'left',
            text: 'Estimated Daily Fish Passage'
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
            min: (new Date('2018-04-25 00:00')).valueOf(),
            max: today.valueOf()
          },
          yAxis: {
            title: {
              text: 'Estimated # Fish per Day'
            }
          },
          plotOptions: {
            column: {
              groupPadding: 0.05,
              pointPadding: 0
            }
          },
          legend: {
            enabled: false
          },
          series: [
            {
              name: 'Estimated # Fish',
              data: chartData.map(d => ({ x: d.x, y: d.y })),
              type: 'column',
              tooltip: {
                valueDecimals: 0
              }
            },
            {
              name: 'Uncertainty Range',
              data: chartData.map(d => ({ x: d.x, low: d.low, high: d.high })),
              type: 'errorbar',
              tooltip: {
                valueDecimals: 0
              }
            }
          ],
          tooltip: {
            shared: true
          }
        });
      });

    this.$http.get('/status/')
      .then((response) => {
        const data = response.data.data;

        const fishData = data.fish.map(d => [
          d3Time.timeHour.offset(new Date(d.date), 4).valueOf(),
          Math.round(d.count)
        ]);
        const videoData = data.video.map(d => ({
          date: d3Time.timeHour.offset(new Date(d.date), 4),
          n_remaining: d.n_total - d.n_counted,
          n_counted: d.n_counted
        }));
        const activityData = data.activity.map(d => ({
          x: (new Date(d.count_timestamp)).valueOf(),
          y: 0,
          z: d.count,
          duration: Math.round(d.duration),
          video_timestamp: edtFormat(new Date(d.video_start)),
          count_timestamp: edtFormat(new Date(d.count_timestamp))
        }));

        const totals = {
          fish: fishData.reduce((p, v) => (p + v[1]), 0),
          video: {
            counted: videoData.reduce((p, v) => (p + v.n_counted), 0),
            remaining: videoData.reduce((p, v) => (p + v.n_remaining), 0)
          }
        };

        this.$highcharts.chart('chart-fish', {
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
              data: fishData,
              color: colors[2]
            }
          ]
        });

        this.$highcharts.chart('chart-activity', {
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
              '<tr><th style="text-align:right">Video Recorded At:</th><td style="padding-left:10px">{point.video_timestamp}</td></tr>' +
              '<tr><th style="text-align:right">Video Duration:</th><td style="padding-left:10px">{point.duration} sec</td></tr>',
            footerFormat: '</table>',
            followPointer: false,
            hideDelay: 250
          },
          series: [
            {
              name: 'Video Count',
              data: activityData
            }
          ]
        });

        this.$highcharts.chart('chart-video', {
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
              data: videoData.map(d => ({ x: d.date.valueOf(), y: d.n_counted })),
              color: colors[3]
            },
            {
              name: '# Remaining',
              data: videoData.map(d => ({ x: d.date.valueOf(), y: d.n_remaining })),
              color: colors[4]
            }
          ]
        });

        odActivityTotal.update(data.activity.length);
        odFishTotal.update(Math.round(totals.fish));
        odVideoCounted.update(totals.video.counted);
        odVideoRemaining.update(totals.video.remaining);
      });
  }
};
</script>

<style scoped>
h1.count-title {
  font-size: 24px;
}
p.small-text {
  font-size: 0.7em;
  line-height: 1.3;
  font-family: sans-serif;
  color: #888;
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
