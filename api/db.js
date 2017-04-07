var Promise = require('bluebird');

var config = require('../config');

var knex = require('knex')({
  client: 'pg',
  connection: config.db
});

var getStatus = function () {
  var sql = `
    with c as (
      select video_id, count(*) as n_counts, sum(count) as sum_counts
      from counts
      where not flagged
      group by video_id
    )
    select
      count(v.*)::integer as videos_n_total,
      sum((COALESCE(c.n_counts, 0) > 0)::integer)::integer as videos_n_watched,
      sum((COALESCE(c.n_counts, 0)))::integer as counts_n,
      sum((COALESCE(c.sum_counts, 0)))::integer as counts_sum
    from videos v
    left join c on v.id=c.video_id
    where not v.flagged;
  `;

  return knex.raw(sql)
    .then(function (results) {
      return results.rows[0];
    });
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
  saveCount: saveCount
};
