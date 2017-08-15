var $ = require('jquery'),
    ProgressBar = require('progressbar.js');

var config = require('../../config');

require('./css/app.css');

window.onload = function () {
  $.get(config.api.url + '/sprint/', function (response) {
    var count = +response.data.count;
    var progressCircle = new ProgressBar.Circle('#sprint-progressbar-circle', {
      strokeWidth: 12,
      color: '#36BCB1',
      trailColor: '#E7E7E7',
      duration: 1000,
      easing: 'easeInOut',
      text: {
        // Initial value for text.
        // Default: null
        // value: 'Goal: 1,000<br>Test',

        // Class name for text element.
        // Default: 'progressbar-text'
        // className: 'progressbar__label',

        // Inline CSS styles for the text element.
        // If you want to modify all CSS your self, set null to disable
        // all default styles.
        // If the style option contains values, container is automatically
        // set to position: relative. You can disable behavior this with
        // autoStyleContainer: false
        // If you specify anything in this object, none of the default styles
        // apply
        // Default: object speficied below
        style: null
        // style: {
        //     // Text color.
        //     // Default: same as stroke color (options.color)
        //     color: '#000',
        //     position: 'absolute',
        //     left: '50%',
        //     top: '50%',
        //     padding: 0,
        //     margin: 0,
        //     // You can specify styles which will be browser prefixed
        //     transform: {
        //         prefix: true,
        //         value: 'translate(-50%, -50%)'
        //     }
        // }
      }
    });

    var progressLine = new ProgressBar.Line('#sprint-progressbar-line', {
      strokeWidth: 12,
      color: '#36BCB1',
      trailColor: '#E7E7E7',
      duration: 1000,
      easing: 'easeInOut',
      text: {
        // Initial value for text.
        // Default: null
        // value: 'Goal: 1,000<br>Test',

        // Class name for text element.
        // Default: 'progressbar-text'
        className: 'progressbar-text-line',

        // Inline CSS styles for the text element.
        // If you want to modify all CSS your self, set null to disable
        // all default styles.
        // If the style option contains values, container is automatically
        // set to position: relative. You can disable behavior this with
        // autoStyleContainer: false
        // If you specify anything in this object, none of the default styles
        // apply
        // Default: object speficied below
        style: null
        // style: {
        //     // Text color.
        //     // Default: same as stroke color (options.color)
        //     color: '#000',
        //     position: 'absolute',
        //     left: '50%',
        //     top: '50%',
        //     padding: 0,
        //     margin: 0,
        //     // You can specify styles which will be browser prefixed
        //     transform: {
        //         prefix: true,
        //         value: 'translate(-50%, -50%)'
        //     }
        // }
      }
    });

    console.log(count);
// count = 1000
    const percentComplete = count > 1000 ? 1 : count / 1000;
    const remainingCount = count > 1000 ? 0 : 1000 - count;

    progressCircle.setText('<span class="percentage">' + Math.round(percentComplete * 100) + '%</span><br>' + ' Complete');

    progressCircle.animate(percentComplete);

    progressLine.setText('<span class="percentage">' + Math.round(percentComplete * 100) + '%</span>' + ' Complete');

    progressLine.animate(percentComplete);

    if (remainingCount == 0) {
      $('.sprint-remaining').text('We made it to our goal! Thank you!');
    } else {
      $('.sprint-remaining').text(remainingCount + ' Videos Remaining');
    }
  })
}
