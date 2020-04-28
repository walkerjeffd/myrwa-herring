module.exports = {
  default: {
    window: {
      start_date: '2020-04-01',
      end_date: '2020-07-01',
      method: 'fixed'
    },
    times: {
      start_hour: 7,
      end_hour: 18
    },
    counts: {
      min_count_n: 0,
      max_count_n: 1000,
      min_count_mean: 0
    },
    sampler: {
      distribution: 'uniform'
    },
    status: {
      start_date: '2020-04-01',
      end_date: '2020-07-01'
    },
    allVideos: {
      start_date: '2020-04-01',
      end_date: '2020-07-01'
    },
    run: {
      start_date: '2020-04-01',
      end_date: '2020-07-01'
    }
  },
  UML: {
    window: {
      start_date: '2020-04-24',
      end_date: '2020-07-01',
      method: 'sliding',
      days: 20
    },
    counts: {
      min_count_n: 0,
      max_count_n: 0,
      min_count_mean: 0
    },
    status: {
      start_date: '2020-04-24',
      end_date: '2020-07-01'
    },
    run: {
      start_date: '2020-04-24',
      end_date: '2020-07-01'
    }
  },
  PLY: {
    window: {
      start_date: '2020-04-13',
      end_date: '2020-07-01',
      method: 'sliding',
      days: 20
    },
    sampler: {
      distribution: 'exponential',
      lambda: 0.0005
    },
    status: {
      start_date: '2020-04-13',
      end_date: '2020-07-01'
    },
    run: {
      start_date: '2020-04-13',
      end_date: '2020-07-01'
    }
  },
  NSRWA: {
  }
}
