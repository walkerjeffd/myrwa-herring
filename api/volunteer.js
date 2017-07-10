/* eslint-disable no-console, no-shadow, no-param-reassign, arrow-body-style */

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
      if (err) return reject(err);
      // console.log(`Loaded doc: ${info.title} by ${info.author.email}`);
      const sheet = info.worksheets[1];

      sheet.getRows({
        offset: 1,
        limit: 1000,
        orderby: 'col1'
      }, (err, rows) => {
        if (err) return reject(err);
        // console.log(`Read ${rows.length} rows`);
        return resolve(rows);
      });
    });
  });
}

function parseRows(rows) {
  const dateParse = d3.timeParse('%m/%d/%Y');
  const timestampParse = d3.timeParse('%m/%d/%Y %I:%M:%S %p %Z');

  return rows.map((d) => {
    return {
      date: dateParse(d.date),
      start: timestampParse(`${d.date} ${d.starttime} -04`),
      end: timestampParse(`${d.date} ${d.endtime} -04`),
      count: +d.count
    };
  });
}

function filterRows(rows) {
  const filteredRows = rows.filter((d) => {
    return d.count > 0;
  });
  // console.log(`Filtered rows: ${filteredRows.length}`);
  return filteredRows;
}

function getVideos(docId) {
  return getData(docId)
    .then(parseRows)
    .then(filterRows)
    .then(data => Promise.mapSeries(data, fetchVideos));
}

module.exports = {
  getVideos,
  getData,
  parseRows
};
