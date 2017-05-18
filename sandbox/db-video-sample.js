var Promise = require('bluebird'),
    _ = require('lodash');

var config = require('../config');

var knex = require('knex')({
  client: 'pg',
  connection: config.db
});

var params = {
  // location: 'UML'
  // date: '2017-04-20'
};

// count stats per video
var counts = knex('counts')
  .select('video_id', knex.raw('count(*)::integer as n_count'), knex.raw('avg(count)::real as mean_count'))
  .where('flagged', false)
  .groupBy('video_id')
  .as('c');

// select subset of videos
var videos = knex('videos')
  .where('flagged', false)
  .andWhere(knex.raw('date_part(\'hour\', start_timestamp)'), '>=', 6)
  .andWhere(knex.raw('date_part(\'hour\', start_timestamp)'), '<=', 19);

if (params.date) {
  videos = videos.andWhere(knex.raw('start_timestamp::date::text'), params.date);
} else {
  videos = videos.andWhere('start_timestamp', '>=', '2017-04-15 00:00:00+00');
}

if (params.location) {
  videos = videos.andWhere('location_id', params.location)
} else {
  videos = videos.andWhere('location_id', 'UML')
}


// join videos and counts
var cte = videos
  .leftJoin(counts, 'videos.id', 'c.video_id')
  .select()
  .where(function() {
    this.where(knex.raw('COALESCE(n_count, 0)'), '=', 0)
      .orWhere(knex.raw('COALESCE(mean_count, 0)'), '>', 0)
  })

console.log(cte.toSQL().sql)
cte
  .then(function (results) {
    console.log(results.length);
    process.exit(0);
  })
  .catch(function (err) {
    console.error(err);
    process.exit(1);
  });


// knex
//   .raw(
//     'with v as (?) ?',
//     [
//       cte,
//       knex.raw('select * from v offset floor( random() * (select count(*) from v) ) limit 1')
//     ]
//   )
//   .then(function (results) {
//     console.log(results.rows[0]);
//     process.exit(0);
//   })
//   .catch(function (err) {
//     console.error(err);
//     process.exit(1);
//   });
