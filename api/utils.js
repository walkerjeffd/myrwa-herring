const moment = require('moment-timezone');

function getSlidingWindowDates(dates, days) {
  const fixedStart = moment.tz(dates[0], 'US/Eastern');
  const fixedEnd = moment.tz(dates[1], 'US/Eastern');

  let endDate = moment().tz('US/Eastern').startOf('date');
  if (fixedEnd < endDate) {
    endDate = fixedEnd;
  }
  let startDate = endDate.clone().subtract(days - 1, 'days');
  if (fixedStart > startDate) {
    startDate = fixedStart;
  }

  return [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')];
}

function minDateOrToday(d1, d2) {
  // returns minimum of d1 or d2 dates
  // replaces d1 with today if undefined
  let d1Date = moment().tz('US/Eastern').startOf('day');
  if (d1) {
    d1Date = moment.tz(d1, 'US/Eastern');
  }

  const d2Date = moment.tz(d2, 'US/Eastern');

  if (d1Date < d2Date) {
    return d1Date.format('YYYY-MM-DD');
  }
  return d2Date.format('YYYY-MM-DD');
}

module.exports = {
  getSlidingWindowDates,
  minDateOrToday
};
