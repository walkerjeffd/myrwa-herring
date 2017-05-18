/* eslint-disable no-console, no-shadow, no-param-reassign */

const GoogleSpreadsheet = require('google-spreadsheet');
const d3 = require('d3');
const Promise = require('bluebird');
// const _ = require('lodash');

const config = require('../config');

const knex = require('knex')({
  client: 'pg',
  connection: config.db
});

// spreadsheet key is the long id in the sheets URL

function fetchVideos(row) {
  const counts = knex('counts')
    .where('flagged', false)
    .select(
      'video_id',
      knex.raw('count(*)::integer as n_count'),
      knex.raw('avg(count)::real as mean_count')
    )
    .where('flagged', false)
    .groupBy('video_id')
    .as('c');
  const videos = knex('videos')
    .where('flagged', false)
    .andWhere('location_id', 'UML')
    .andWhere('start_timestamp', '>=', row.start)
    .andWhere('start_timestamp', '<=', row.end)
    .orderBy('start_timestamp');

  return videos
    .leftJoin(counts, 'videos.id', 'c.video_id')
    .select(
      'videos.id',
      knex.raw('COALESCE(c.n_count, 0)::integer as n_count'),
      knex.raw('COALESCE(c.mean_count, 0)::real as mean_count')
    )
    .then((results) => {
      row.videos = results;
      return row;
    });
}

function getData(docId) {
  const doc = new GoogleSpreadsheet(docId);

  return new Promise((resolve, reject) => {
    doc.getInfo((err, info) => {
      if (err) console.log(err);
      console.log(`Loaded doc: ${info.title} by ${info.author.email}`);
      const sheet = info.worksheets[0];

      sheet.getRows({
        offset: 1,
        limit: 1000,
        orderby: 'col2'
      }, (err, rows) => {
        if (err) return reject(err);
        console.log(`Read ${rows.length} rows`);
        return resolve(rows);
      });
    });
  });
}

function parseRows(rows) {
  const dateParse = d3.timeParse('%m/%d/%Y');
  const timestampParse = d3.timeParse('%m/%d/%Y %I:%M:%S %p');

  return rows.map((d) => {
    return {
      date: dateParse(d.date),
      start: timestampParse(`${d.date} ${d.timestarted}`),
      end: timestampParse(`${d.date} ${d.timeend}`),
      count: +d.howmanyfishdidyoucountgoinguptheladder
    };
  });
}

getData('1bAJhTbyJHHf8zjQwMSWQ0ETAO5AzgeSVOOZBf9ce3uE')
  .then(parseRows)
  .then(data => Promise.mapSeries(data, fetchVideos))
  .then((data) => {
    data.forEach((row) => {
      console.log(`${row.start} - ${row.end}`);
      row.videos.forEach((video) => {
        console.log(`${video.id} count = ${video.n_count}`);
      });
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

