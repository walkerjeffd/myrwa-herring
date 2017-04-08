var Promise = require('bluebird'),
    path = require('path'),
    fs = require('fs'),
    ffprobe = Promise.promisify(require('fluent-ffmpeg').ffprobe),
    s3 = require('s3'),
    moment = require('moment-timezone'),
    winston = require('winston');

var config = require('../config');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ]
});

if (!config.mail.disable) {
  console.log('adding mail transport');
  require('winston-mail').Mail;

  logger.add(winston.transports.Mail, {
    to: config.mail.notify,
    from: config.mail.server.username,
    host: config.mail.server.host,
    port: config.mail.server.port,
    username: config.mail.server.username,
    password: config.mail.server.password,
    ssl: true,
    level: 'error',
    subject: '[myrwa-api:video-service] Error Notification'
  });
}

var startTime = new Date();

logger.info('starting %s', startTime.toISOString());

var s3Client = s3.createClient(config.s3.client);

var knex = require('knex')({
  client: 'pg',
  connection: config.db
});

var readdir = Promise.promisify(fs.readdir),
    rename = Promise.promisify(fs.rename),
    open = Promise.promisify(fs.open);

const locationIds = config.videoService.locationIds;

Promise.mapSeries(locationIds, processLocationDir)
  .then((locations) => {
    var endTime = new Date();
    logger.info('done %s (duration = %d ms)', endTime.toISOString(), (endTime - startTime))
  })
  .catch(function (err) {
    logger.error(err.toString());
  })
  .finally(function () {
    setTimeout(function () {
      process.exit(0);
    }, 1000 * 10)
  });


// functions ------------------------------------------------------------------

function processLocationDir (locationId) {
  logger.info('processing location folder %s', locationId);

  var location = {
    id: locationId
  };

  return getLocationDb(location)
    .then(function (locationDb) {
      location.db = locationDb;
      location.dir = path.join(config.videoService.inDir, location.id);

      return readdir(location.dir)
        .then(function (files) {
          location.files = files.map(function (filename) {
            return path.join(location.dir, filename);
          });

          logger.info('location folder %s contains %d file(s)', locationId, files.length);

          return location;
        });
    })
    .then(function (location) {
      var videos = location.files.map(function (filepath) {
        return {
          location_id: location.db.id,
          filepath: filepath,
          filename: path.basename(filepath)
        };
      });
      return Promise.mapSeries(videos, getVideoMetadata);
    })
    .filter(function (videos) {
      return videos.ok;
    })
    .then(function (videos) {
      return Promise.mapSeries(videos, processVideo);
    })
    .then(function (videos) {
      location.videos = videos;
      return location;
    });
}

function getLocationDb (location) {
  logger.info('getting location from db', {id: location.id});

  return knex('locations')
    .select()
    .where('id', location.id)
    .then(function (results) {
      if (results.length < 1) {
        logger.error('failed to find location in db', {id: location.id});
        throw new Error('Location ' + location.id + ' not found in database');
      }

      return results[0];
    });
}

function getVideoMetadata (video) {
  logger.info('getting video metadata', {filename: video.location_id + '/' + video.filename});

  video.ok = false;

  return ffprobe(video.filepath)
    .then(function (metadata) {
      var format = metadata.format;
      var filename = path.basename(format.filename);
      var pattern = /^\d_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.mp4$/;

      if (!pattern.test(filename)) {
        logger.warn('invalid video filename, skipping', {filename: filename});
        return video;
      }

      var timestring = filename.substr(2, 19);
      var start = moment(timestring, 'YYYY-MM-DD_HH-mm-ss').tz("America/New_York");
      var end = moment(start).add(Math.round(format.duration), 's');

      video.filepath = format.filename;
      video.filename = filename;
      video.duration = format.duration;
      video.filesize = format.size;
      video.start_timestamp = start.toISOString();
      video.end_timestamp = end.toISOString();
      video.ok = true;

      return video;
    })
    .catch(function (err) {
      logger.warn('unable to read video file, skipping', {filename: video.location_id + '/' + video.filename})
      video.ok = false;
      return video;
    });
}

function uploadFileToS3 (video) {
  if (config.s3.disable) {
    logger.info('skipping s3');
    return Promise.resolve(video);
  }

  logger.info('uploading file to s3', {filename: video.location_id + '/' + video.filename});

  var filename = video.filename,
      bucket = config.s3.bucket,
      key = path.join(config.s3.path, video.location_id, filename);

  var params = {
    localFile: video.filepath,

    s3Params: {
      Bucket: bucket,
      Key: key,
      ACL: 'public-read'
    }
  };

  s3Client.s3.headObject({
      Bucket: bucket,
      Key: key
    }, function (err, data) {
      if (data) {
        logger.warn('file already exists on s3', {filename: video.location_id + '/' + video.filename});
      }
    });

  var uploader = s3Client.uploadFile(params);

  return new Promise(function (resolve, reject) {
    uploader.on('error', function(err) {
      logger.error('failed to upload file to s3', {filename: video.location_id + '/' + video.filename});
      reject(err);
    });
    uploader.on('end', function() {
      logger.info('successfully uploaded file to s3', {filename: video.location_id + '/' + video.filename});

      var url = s3.getPublicUrl(bucket, key);
      video.url = url;
      resolve(video);
    });
  })
}

function moveFileToSaveDir (video) {
  logger.info('moving file to %s', config.videoService.saveDir, {filename: video.location_id + '/' + video.filename});

  var inPath = video.filepath,
      savePath = path.join(config.videoService.saveDir, video.location_id, video.filename);

  return rename(inPath, savePath)
    .then(function () {
      video.filepath = savePath;
      return video;
    });
}

function saveVideoToDb (video) {
  logger.info('saving video to database', {filename: video.location_id + '/' + video.filename});

  var data = [
    video.url,
    video.filename,
    video.duration,
    video.filesize,
    video.start_timestamp,
    video.end_timestamp,
    video.location_id
  ];

  return knex('videos')
    .returning('*')
    .insert({
      url: video.url,
      filename: video.filename,
      duration: video.duration,
      filesize: video.filesize,
      start_timestamp: video.start_timestamp,
      end_timestamp: video.end_timestamp,
      location_id: video.location_id
    })
    .then(function (results) {
      if (results.length > 0) {
        logger.info('video saved to database', {filename: video.location_id + '/' + video.filename});
      } else {
        logger.error('failed to save video to database', {filename: video.location_id + '/' + video.filename});
      }
      return results[0];
    });
}

function processVideo (video) {
  logger.info('video processing starting', {filename: video.location_id + '/' + video.filename});

  return uploadFileToS3(video)
    .then(moveFileToSaveDir)
    .then(saveVideoToDb)
    .then(function (row) {
      logger.info('video processing complete', {filename: video.location_id + '/' + video.filename});

      video.db = row;

      return video;
    });
}

