var Promise = require('bluebird'),
    path = require('path'),
    fs = require('fs'),
    ffmpeg = require('fluent-ffmpeg'),
    ffprobe = Promise.promisify(ffmpeg.ffprobe),
    s3 = require('s3'),
    moment = require('moment-timezone'),
    winston = require('winston');

var config = require('../config');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: config.videoService.logLevel,
      timestamp: true
    })
  ]
});

if (!config.mail.disable) {
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

logger.info('starting');

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
    var uploadCount = locations.reduce(function (p, v) {
      var uploadedVideos = v.videos.filter(function (video) {
        return !video.skip;
      });
      return p + uploadedVideos.length;
    }, 0);

    var skipCount = locations.reduce(function (p, v) {
      var skippedVideos = v.videos.filter(function (video) {
        return video.skip;
      });
      return p + skippedVideos.length;
    }, 0);

    logger.info('processed %d file(s) (skipped %d)', uploadCount, skipCount);

    var endTime = new Date();
    logger.info('done (duration = %d sec)', (endTime - startTime) / 1000)
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
function checkVideoExistsInDb (video) {
  return knex('videos')
    .select()
    .where('location_id', video.location_id)
    .andWhere('filename', video.filename)
    .then(function (results) {
      if (results.length >= 1) {
        logger.warn('video already exists in database, skipping', {filename: video.location_id + '/' + video.filename})
        video.skip = true;
      }

      return video;
    });
}

function processLocationDir (locationId) {
  logger.debug('processing location folder %s', locationId);

  var location = {
    id: locationId
  };

  return getLocationDb(location)
    .then(function (locationDb) {
      location.db = locationDb;
      location.dir = path.join(config.videoService.dirs.new, location.id);

      return readdir(location.dir)
        .then(function (files) {
          location.files = files.map(function (filename) {
            return path.join(location.dir, filename);
          });

          logger.info('processing %d file(s) for location %s', files.length, locationId);

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
    .then(function (videos) {
      return Promise.mapSeries(videos, checkVideoExistsInDb);
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
  logger.debug('getting location from db', {id: location.id});

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
  logger.debug('getting video metadata', {filename: video.location_id + '/' + video.filename});

  video.skip = true;

  return ffprobe(video.filepath)
    .then(function (metadata) {
      var format = metadata.format;
      var filename = path.basename(format.filename);
      var pattern = /^\d_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.mp4$/;

      if (!pattern.test(filename)) {
        logger.warn('invalid video filename, skipping', {filename: filename});
        return video;
      }

      // filename specifies end time stamp + about 2-3 seconds (short delay between saving file and actual end timestamp)
      var timestring = filename.substr(2, 19);
      var end = moment(timestring, 'YYYY-MM-DD_HH-mm-ss').tz("America/New_York").subtract(2, 's');
      var start = moment(end).subtract(Math.round(format.duration), 's');

      video.filepath = format.filename;
      video.filename = filename;
      video.duration = format.duration;
      video.filesize = format.size;

      video.start_timestamp = start.toISOString();
      video.end_timestamp = end.toISOString();

      // auto-flag if duration > 80 seconds
      video.flagged = video.duration > 80;

      video.skip = false;

      return video;
    })
    .catch(function (err) {
      logger.warn('unable to read video file, skipping', {filename: video.location_id + '/' + video.filename})
      video.skip = true;
      return video;
    });
}

function uploadFileToS3 (bucket, key, filepath) {
  logger.debug('uploading file to s3', {key: key, filepath: filepath});

  var params = {
    localFile: filepath,

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
        logger.warn('file already exists on s3', {key: key});
      }
    });

  return new Promise(function (resolve, reject) {
    s3Client.uploadFile(params)
      .on('error', function(err) {
        logger.error('failed to upload file to s3', {key: key});

        return reject(err);
      })
      .on('end', function() {
        logger.debug('successfully uploaded file to s3', {key: key});

        var url = s3.getPublicUrl(bucket, key);

        return resolve(url);
      });
  })
}

function uploadVideoToS3 (video) {
  if (config.s3.disable) {
    logger.info('skipping s3');
    return Promise.resolve(video);
  }

  return Promise.all([
      uploadFileToS3(config.s3.bucket, path.join(config.s3.path, video.location_id, video.filename), video.filepath),
      uploadFileToS3(config.s3.bucket, path.join(config.s3.path, video.location_id, video.filename_webm), video.filepath_webm)
    ])
    .then(function (urls) {
      video.url = urls[0];
      video.url_webm = urls[1];
      return Promise.resolve(video);
    });
}

function moveFilesToSaveDir (video) {
  logger.debug('moving files to %s', config.videoService.dirs.save, {
    filename_mp4: video.location_id + '/' + video.filename,
    filename_webm: video.location_id + '/' + video.filename_webm
  });

  var savePathMp4 = path.join(config.videoService.dirs.save, video.location_id, video.filename),
      savePathWebM = path.join(config.videoService.dirs.save, video.location_id, video.filename_webm);

  return rename(video.filepath, savePathMp4)
    .then(function () {
      video.filepath = savePathMp4;
      return video;
    })
    .then(function () {
      return rename(video.filepath_webm, savePathWebM)
    })
    .then(function () {
      video.filepath_webm = savePathWebM;
      return video;
    });
}

function moveFileToSkipDir (video) {
  logger.debug('moving file to %s', config.videoService.dirs.skip, {filename: video.location_id + '/' + video.filename});

  var inPath = video.filepath,
      skipPath = path.join(config.videoService.dirs.skip, video.location_id, video.filename);

  return rename(inPath, skipPath)
    .then(function () {
      return video;
    });
}

function saveVideoToDb (video) {
  logger.debug('saving video to database', {filename: video.location_id + '/' + video.filename});

  var data = [
    video.url,
    video.url_webm,
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
      url_webm: video.url_webm,
      filename: video.filename,
      duration: video.duration,
      filesize: video.filesize,
      start_timestamp: video.start_timestamp,
      end_timestamp: video.end_timestamp,
      location_id: video.location_id
    })
    .then(function (results) {
      if (results.length > 0) {
        logger.debug('video saved to database', {filename: video.location_id + '/' + video.filename});
      } else {
        logger.error('failed to save video to database', {filename: video.location_id + '/' + video.filename});
      }
      return results[0];
    });
}

function convertFileToWebM (video) {
  video.filename_webm = video.filename.replace('.mp4', '.webm');
  video.filepath_webm = path.join(config.videoService.dirs.convert, video.location_id, video.filename_webm);

  logger.debug('video file conversion starting', {
    mp4: path.join(video.location_id, video.filename),
    webm: path.join(video.location_id, video.filename_webm)
  });


  return new Promise(function (resolve, reject) {
    ffmpeg(video.filepath)
      .videoCodec('libvpx')
      .videoBitrate('1000')
      .outputOptions('-crf 10')
      .audioCodec('libvorbis')
      .on('start', function(command) {
        logger.debug('spawned ffmpeg', { command: command });
      })
      .on('error', function(err) {
        logger.error('failed to convert file', {
          mp4: path.join(video.location_id, video.filename),
          webm: path.join(video.location_id, video.filename_webm)
        });
        return reject(err);
      })
      .on('end', function() {
        logger.debug('video file conversion complete', {
          mp4: path.join(video.location_id, video.filename),
          webm: path.join(video.location_id, video.filename_webm)
        });
        return resolve(video);
      })
      .save(video.filepath_webm);
  });
}

function processVideo (video) {
  logger.debug('video processing started', {filename: video.location_id + '/' + video.filename});

  if (video.skip) {
    return moveFileToSkipDir(video);
  } else {
    return convertFileToWebM(video)
      .then(uploadVideoToS3)
      .then(moveFilesToSaveDir)
      .then(saveVideoToDb)
      .then(function (row) {
        logger.debug('video processing complete', {filename: video.location_id + '/' + video.filename});

        video.db = row;

        return video;
      });
  }
}

