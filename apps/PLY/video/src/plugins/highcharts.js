import highcharts from 'highcharts';

require('highcharts/highcharts-more.js')(highcharts);

highcharts.setOptions({
  global: {
    useUTC: true,
    timezoneOffset: 240
  },
  lang: {
    thousandsSep: ','
  }
});

export default {
  install: (Vue) => {
    Vue.prototype.$highcharts = highcharts; // eslint-disable-line no-param-reassign
  }
};
