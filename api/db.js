const config = require('../config');


const knex = require('knex')({
  client: 'pg',
  connection: config.db,
});

function getStatus() {
  const sql = `
    WITH c AS (
      SELECT
        (created_at AT TIME ZONE 'America/New_York')::date as date,
        count(*) as n_count,
        sum(count) as sum_count
      FROM counts
      WHERE NOT flagged
      GROUP BY (created_at AT TIME ZONE 'America/New_York')::date
    ),
    d AS (
      SELECT generate_series('2017-04-10'::date, current_date at time zone 'America/New_York', '1 day')::date as date
    )
    SELECT
      d.date::text as date,
      COALESCE(c.n_count, 0)::integer as n_count,
      COALESCE(c.sum_count, 0)::integer as sum_count
    FROM d
    LEFT JOIN c
    ON d.date=c.date
    ORDER BY d.date;
  `;

  return knex
    .raw(sql)
    .then(result => result.rows);
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
    .andWhere(knex.raw('date_part(\'hour\', start_timestamp at time zone \'America/New_York\')'), '>=', 6)
    .andWhere(knex.raw('date_part(\'hour\', start_timestamp at time zone \'America/New_York\')'), '<=', 19);

  if (params.date) {
    videos = videos.andWhere(knex.raw('(start_timestamp at time zone \'America/New_York\')::date::text'), params.date);
  } else {
    // only on or after April 24
    videos = videos.andWhere(knex.raw('(start_timestamp at time zone \'America/New_York\')::date'), '>=', knex.raw('\'2017-04-24\'::date'));
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
    .where(knex.raw('COALESCE(n_count, 0)'), '<=', 2)
    .where(function () {
      this.where(knex.raw('COALESCE(mean_count, 0)'), '>', 0);
      if (!params.first || params.first === 'false') {
        this.orWhere(knex.raw('COALESCE(n_count, 0)'), '=', 0);
      }
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
