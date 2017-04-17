var $ = require('jquery');
var Odometer = require('odometer');

var config = require('../../config');
console.log(config);

require('./app.css')

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

  $.get(config.api.url + 'status/', function (response) {
    od_n_video.update(+response.data.summary.n_video);
    od_n_count.update(+response.data.summary.n_count);
    od_sum_count.update(+response.data.summary.sum_count);
  })
}
