var pg = require('pg'),
    Promise = require('bluebird');

var config = require('./config');
var pool = new pg.Pool(config.db);

var videoStats = function () {
  return new Promise(function (resolve, reject) {
    pool.connect(function (err, client, done) {
      if (err) {
        return reject(err);
      }

      var sql = 'SELECT count(*)::integer, sum(duration) as duration FROM videos;';

      client.query(sql, function (err, result) {
        done();

        if (err) {
          return reject(err);
        }

        return resolve(result.rows[0]);
      });
    });
  });
};

var countStats = function () {
  return new Promise(function (resolve, reject) {
    pool.connect(function (err, client, done) {
      if (err) {
        return reject(err);
      }

      var sql = 'SELECT count(*)::integer, sum(count) as sum FROM counts;';

      client.query(sql, function (err, result) {
        done();

        if (err) {
          return reject(err);
        }

        return resolve(result.rows[0]);
      });
    });
  });
};

module.exports = {
  status: function () {
    return Promise.all([videoStats(), countStats()])
      .then(function (results) {
        return {videos: results[0], counts: results[1]};
      })
      .catch(function (err) {
        return reject(err);
      });
  },
  watch: function () {
    return new Promise(function (resolve, reject) {
      pool.connect(function (err, client, done) {
        if (err) {
          return reject(err);
        }

        var sql = 'select * from videos offset random() * (select count(*) from videos) limit 1;';

        client.query(sql, function (err, result) {
          done();

          if (err) {
            return reject(err);
          }

          if (result.rows.length === 0) {
            return reject(new Error('No videos are available'));
          }

          return resolve(result.rows[0]);
        });
      });
    });
  },
  saveCount: function(data) {
    return new Promise(function (resolve, reject) {
      pool.connect(function (err, client, done) {
        if (err) {
          return reject(err);
        }

        var sql = 'insert into counts (video_id, count, comment) values ($1, $2, $3) returning *';

        client.query(sql, [data.video_id, data.count, data.comment], function (err, result) {
          done();

          if (err) {
            return reject(err);
          }

          if (result.rows.length === 0) {
            return reject(new Error('Failed to save count on server'));
          }

          return resolve(result.rows[0]);
        });
      });
    });
  }
};