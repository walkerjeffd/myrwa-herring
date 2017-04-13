var Promise = require('bluebird'),
    d3 = require('d3');

var config = require('../config');

var knex = require('knex')({
  client: 'pg',
  connection: config.db
});

var getStatus = function () {
  var sql = `
  WITH c AS (
    SELECT video_id, count(*) as n_count, sum(count) as sum_count
    FROM counts
    WHERE NOT flagged
    GROUP BY video_id
  ),
  vc AS (
    SELECT
      v.id,
      v.start_timestamp,
      date_trunc('day', v.start_timestamp AT TIME ZONE 'America/New_York')::date as date,
      COALESCE(c.n_count, 0)::integer as n_count,
      COALESCE(c.sum_count, 0)::integer as sum_count
    FROM videos v
    LEFT JOIN c
    ON v.id = c.video_id
    WHERE v.location_id = 'UML' AND NOT v.flagged
    ORDER BY v.start_timestamp
  ),
  vcd AS (
    SELECT
      vc.date,
      count(vc.id) as n_video,
      sum((n_count > 0)::integer)::integer as n_watched,
      sum(n_count) as n_count,
      sum(sum_count) as sum_count
    FROM vc
    GROUP BY vc.date
    ORDER BY vc.date
  ),
  d AS (
    SELECT generate_series('2017-04-01'::date, current_date, '1 day')::date as date
  )
  SELECT
    d.date,
    COALESCE(n_video, 0)::integer as n_video,
    COALESCE(n_watched, 0)::integer as n_watched,
    COALESCE(n_count, 0)::integer as n_count,
    COALESCE(sum_count, 0)::integer as sum_count
  FROM d
  LEFT JOIN vcd
  ON d.date = vcd.date
  ORDER BY d.date;
  `;

  return knex
    .raw(sql)
    .then(function (results) {
      var rows = results.rows;

      rows.forEach(function (d) {
        d.mean_count = d.n_count > 0 ? d.sum_count / d.n_count : 0;
      });

      return data = {
        daily: rows,
        summary: rows.reduce((p, v) => {
            p.n_video += v.n_video;
            p.n_watched += v.n_watched;
            p.n_count += v.n_count;
            p.sum_count += v.sum_count;
            return p;
          }, {
            n_video: 0,
            n_watched: 0,
            n_count: 0,
            sum_count: 0
        })
      }
    });
}

var getVideos = function (params) {
  var qry = knex('videos')
    .select();

  if (params.location) {
    qry = qry.where('location_id', params.location)
  }

  return qry.orderBy('location_id').orderBy('start_timestamp');
}

var getVideo = function (params) {
  if (params.id) {
    return knex('videos')
      .select()
      .where('id', params.id);
  }

  var cte = knex('videos')
    .select()
    .where('flagged', false);

  if (params.date) {
    cte = cte.andWhere(knex.raw('date_trunc(\'day\', start_timestamp)::date'), params.date)
  }

  if (params.location) {
    cte = cte.andWhere('location_id', params.location)
  }

  return knex
    .raw(
      'with v as (?) ?',
      [
        cte,
        knex.raw('select * from v offset floor( random() * (select count(*) from v) ) limit 1')
      ]
    )
    .then(function (results) {
      return results.rows;
    });
}

var saveCount = function(data) {
  return knex('counts')
    .returning('*')
    .insert({
      video_id: data.video_id,
      count: data.count,
      comment: data.comment,
      session: data.session
    });
}

module.exports = {
  getStatus: getStatus,
  getVideo: getVideo,
  getVideos: getVideos,
  saveCount: saveCount
};
