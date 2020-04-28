const moment = require('moment-timezone')

const siteConfig = require('../config/sites')

function getSiteParams (locationId) {
  const params = siteConfig[locationId] || {}
  return Object.assign(siteConfig.default, params)
}

function getWindowDates (params) {
  // const params = {
  //   start_date: '2020-04-24',
  //   end_date: '2020-07-01',
  //   method: 'fixed',
  //   // method: 'sliding',
  //   // days: 20
  // }
  let windowDates
  if (params.method === 'fixed') {
    windowDates = {
      start_date: params.start_date,
      end_date: params.end_date
    }
  } else if (params.method === 'sliding') {
    windowDates = getWindowDatesSliding([params.start_date, params.end_date], params.days || 20)
  } else {
    throw new Error(`Invalid date window method (${params.method}), must be "fixed" or "sliding".`)
  }
  return windowDates
}

function getWindowDatesSliding (range, days) {
  const fixedStart = moment.tz(range[0], 'US/Eastern')
  const fixedEnd = moment.tz(range[1], 'US/Eastern')

  let endDate = moment().tz('US/Eastern').startOf('date')
  if (fixedEnd < endDate) {
    endDate = fixedEnd
  }
  let startDate = endDate.clone().subtract(days - 1, 'days')
  if (fixedStart > startDate) {
    startDate = fixedStart
  }

  return {
    start_date: startDate.format('YYYY-MM-DD'),
    end_date: endDate.format('YYYY-MM-DD')
  }
}

function minDateOrToday (d1, d2) {
  // returns minimum of d1 or d2 dates
  // replaces d1 with today if undefined
  let d1Date = moment().tz('US/Eastern').startOf('day')
  if (d1) {
    d1Date = moment.tz(d1, 'US/Eastern')
  }

  const d2Date = moment.tz(d2, 'US/Eastern')

  if (d1Date < d2Date) {
    return d1Date.format('YYYY-MM-DD')
  }
  return d2Date.format('YYYY-MM-DD')
}

function limitDateToToday (d) {
  // returns today if d is in the future
  // replaces d1 with today if undefined
  const today = moment().tz('US/Eastern').startOf('day')
  const dDate = moment.tz(d, 'US/Eastern').startOf('day')
  if (today < dDate) {
    return today.format('YYYY-MM-DD')
  }
  return dDate.format('YYYY-MM-DD')
}

module.exports = {
  getSiteParams,
  getWindowDates,
  minDateOrToday,
  limitDateToToday
}
