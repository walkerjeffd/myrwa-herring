const config = require('../config');

const knex = require('knex')({
  client: 'pg',
  connection: config.db,
});

function getStatus() {
  const sql = `
  WITH c AS (
    SELECT
      video_id,
      count(*) as n_count,
      avg(count) as mean_count
    FROM counts
    WHERE NOT flagged
    GROUP BY video_id
  ),
  vc AS (
    SELECT
      v.id,
      v.start_timestamp::date as date,
      COALESCE(c.n_count, 0)::integer as n_count,
      COALESCE(c.mean_count, 0)::integer as mean_count
    FROM videos v
    LEFT JOIN c
    ON v.id = c.video_id
    WHERE v.location_id = 'UML'
      AND NOT v.flagged
    ORDER BY v.start_timestamp
  ),
  vcd AS (
    SELECT
      vc.date,
      count(vc.id) as n_video,
      sum((n_count > 0)::integer)::integer as n_watched,
      sum(n_count) as n_count,
      sum(mean_count) as sum_count
    FROM vc
    GROUP BY vc.date
    ORDER BY vc.date
  ),
  d AS (
    SELECT generate_series('2017-04-07'::date, current_date, '1 day')::date as date
  )
  SELECT
    d.date::text as date,
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
    .then((results) => {
      const rows = results.rows;

      return {
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
          sum_count: 0,
        }),
      };
    });
}

function getVideos(params) {
  let qry = knex('videos')
    .select();

  if (params.location) {
    qry = qry.where('location_id', params.location);
  }

  return qry.orderBy('location_id').orderBy('start_timestamp');
}

function getVideo(params) {
  if (params.id) {
    return knex('videos')
      .select()
      .where('id', params.id);
  }

  const counts = knex('counts')
    .select('video_id', knex.raw('count(*)::integer as n_count'), knex.raw('avg(count)::real as mean_count'))
    .where('flagged', false)
    .groupBy('video_id')
    .as('c');

  // select subset of videos
  let videos = knex('videos')
    .where('flagged', false)
    // only daylight hours
    .andWhere(knex.raw('date_part(\'hour\', start_timestamp)'), '>=', 6)
    .andWhere(knex.raw('date_part(\'hour\', start_timestamp)'), '<=', 21);

  if (params.date) {
    videos = videos.andWhere(knex.raw('start_timestamp::date::text'), params.date);
  } else {
    // only on or after April 24
    videos = videos.andWhere('start_timestamp', '>=', '2017-04-24 00:00:00+00');
  }

  if (params.location) {
    videos = videos.andWhere('location_id', params.location);
  } else {
    videos = videos.andWhere('location_id', 'UML');
  }

  // join videos and counts
  const cte = videos
    .leftJoin(counts, 'videos.id', 'c.video_id')
    .select()
    .where(function () {
      this.where(knex.raw('COALESCE(n_count, 0)'), '=', 0)
        .orWhere(knex.raw('COALESCE(mean_count, 0)'), '>', 0);
    });

  return knex
    .raw(
      'with v as (?) ?',
      [cte, knex.raw('select * from v offset floor( random() * (select count(*) from v) ) limit 1')]
    )
    .then(results => results.rows);
}

function saveCount(data) {
  return knex('counts')
    .returning('*')
    .insert({
      video_id: data.video_id,
      count: data.count,
      comment: data.comment,
      session: data.session,
      flagged: data.count >= config.api.maxCount,
    });
}

module.exports = {
  getStatus,
  getVideo,
  getVideos,
  saveCount,
};
