var Promise = require('bluebird');

var config = require('../config');

var knex = require('knex')({
  client: 'pg',
  connection: config.db
});

var videoStats = function () {
  return knex
    .select(
      knex.raw('count(*)::integer as count'),
      knex.raw('sum(duration) as duration')
    )
    .from('videos')
    .then(function (results) {
      return results[0];
    });
};

var countStats = function () {
  return knex
    .select(
      knex.raw('count(*)::integer as count'),
      knex.raw('sum(count)::real as sum')
    )
    .from('counts')
    .then(function (results) {
      return results[0];
    });
};

module.exports = {
  status: function () {
    // return Promise.all([videoStats(), countStats()])
    return knex.raw(`
with c as (
  select video_id, count(*) as n_counts, sum(count) as sum_counts
  from counts
  group by video_id
)
select
  count(v.*) as videos_n_total,
  sum((COALESCE(c.n_counts, 0) > 0)::integer) as videos_n_watched,
  sum((COALESCE(c.n_counts, 0))::integer) as counts_n,
  sum((COALESCE(c.sum_counts, 0))) as counts_sum
from videos v
left join c on v.id=c.video_id;
`)
      .then(function (results) {
        return results.rows[0];
      });
  },
  watch: function (params) {
    if (params.video_id) {
      return knex('videos')
        .select()
        .where('id', params.video_id);
    }

    var cte = knex('videos')
      .select();

    if (params.video_date) {
      cte = cte.where(knex.raw('date_trunc(\'day\', start_timestamp)::date'), params.video_date)
    }

    if (params.video_location) {
      cte = cte.andWhere('location_id', params.video_location)
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
  },
  saveCount: function(data) {
    return knex('counts')
      .returning('*')
      .insert({
        video_id: data.video_id,
        count: data.count,
        comment: data.comment
      });
  }
};