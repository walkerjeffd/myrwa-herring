/* eslint-disable no-param-reassign */

const Promise = require('bluebird');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const s3 = require('s3');
const moment = require('moment-timezone');
const winston = require('winston');

const readdir = Promise.promisify(fs.readdir);
const rename = Promise.promisify(fs.rename);
const unlink = Promise.promisify(fs.unlink);
const ffprobe = Promise.promisify(ffmpeg.ffprobe);

const config = require('../config');

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: 'debug',
      timestamp: true
    }),
    new (winston.transports.File)({
      level: config.videoService.logLevel,
      filename: config.videoService.logFile,
      timestamp: true,
      json: false,
      humanReadableUnhandledException: true
    })
  ]
});

if (!config.mail.disable) {
  require('winston-mail').Mail; // eslint-disable-line

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

const startTime = new Date();

logger.info('starting');

const s3Client = s3.createClient(config.s3.client);

const knex = require('knex')({
  client: 'pg',
  connection: config.db
});

const locationIds = config.videoService.locationIds;

// functions ------------------------------------------------------------------

function saveRawVideo(video) {
  const fromPath = video.raw_path;
  const toPath = path.join(
    config.videoService.dirs.save, video.location_id, video.raw_filename
  );

  logger.debug('moving raw video to save directory', {
    from: fromPath,
    to: toPath
  });

  return rename(fromPath, toPath)
    .then(() => {
      video.filename = video.raw_filename;
      video.filepath = toPath;
      return video;
    });
}

function skipRawVideo(video) {
  const fromPath = video.raw_path;
  const toPath = path.join(
    config.videoService.dirs.skip, video.location_id, video.raw_filename
  );

  logger.debug('moving raw video to skip directory', {
    from: fromPath,
    to: toPath
  });

  return rename(fromPath, toPath)
    .then(() => {
      video.filename = video.raw_filename;
      video.filepath = toPath;
      return video;
    });
}

function dbVideoExists(video) {
  if (video.skip) {
    return Promise.resolve(video);
  }

  logger.debug('checking if video exists in database', { filename: `${video.location_id}/${video.raw_filename}` });
  return knex('videos')
    .select()
    .where('location_id', video.location_id)
    .andWhere('filename', video.raw_filename)
    .then((results) => {
      if (results.length >= 1) {
        logger.warn('video already exists in database, skipping', { filename: `${video.location_id}/${video.raw_filename}` });
        video.skip = true;
      }

      return video;
    });
}

function dbLocation(id) {
  logger.debug('getting location %s from db', id);

  return knex('locations')
    .select()
    .where('id', id)
    .then((results) => {
      if (results.length < 1) {
        logger.error('failed to find location in db', { id });
        throw new Error(`Location ${id} not found in database`);
      }

      return results[0];
    });
}

function getRawMetadata(video) {
  logger.debug('getting raw video metadata', { raw_path: video.raw_path });

  return ffprobe(video.raw_path)
    .then((metadata) => {
      const format = metadata.format;

      video.duration = format.duration;
      video.filesize = format.size;

      const filenamePattern = /^\d_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.mp4$/;
      if (!filenamePattern.test(video.raw_filename)) {
        logger.warn('invalid video filename, skipping', { raw_path: video.raw_path });
        video.skip = true;
        return video;
      }

      // filename specifies end time stamp + about 2-3 seconds
      // (short delay between saving file and actual end timestamp)
      const timestring = video.raw_filename.substr(2, 19);
      const end = moment
        .tz(timestring, 'YYYY-MM-DD_HH-mm-ss', 'America/New_York')
        .subtract(2, 's');
      const start = moment(end)
        .subtract(Math.round(video.duration), 's');

      video.start_timestamp = start.toISOString();
      video.end_timestamp = end.toISOString();

      // auto-flag if duration > 80 seconds
      video.flagged = video.duration > 80;

      return video;
    })
    .catch(() => {
      logger.warn('unable to read video file, skipping', {
        raw_path: video.raw_path
      });
      video.skip = true;
      return video;
    });
}

function convertToWebM(video) {
  const webmFilename = video.raw_filename.replace('.mp4', '.webm');
  const webmPath = path.join(
    config.videoService.dirs.convert, video.location_id, webmFilename
  );

  const debugInfo = {
    raw_path: video.raw_path,
    webm_path: webmPath
  };
  logger.debug('converting raw video to webm', debugInfo);

  return new Promise((resolve, reject) => {
    ffmpeg(video.raw_path)
      .videoCodec('libvpx')
      .videoBitrate('1000')
      .outputOptions('-crf 10')
      .audioCodec('libvorbis')
      .on('start', (command) => {
        logger.debug('spawned ffmpeg', { command });
      })
      .on('error', (err) => {
        logger.error('failed to convert raw video to webm', debugInfo);
        return reject(err);
      })
      .on('end', () => {
        logger.debug('raw video converted to webm', debugInfo);
        video.webm_filename = webmFilename;
        video.webm_path = webmPath;
        return resolve(video);
      })
      .save(webmPath);
  });
}

function convertToMp4(video) {
  const mp4Filename = video.raw_filename;
  const mp4Path = path.join(
    config.videoService.dirs.convert, video.location_id, mp4Filename
  );

  const debugInfo = {
    raw_path: video.raw_path,
    mp4_path: mp4Path
  };
  logger.debug('converting raw video to mp4', debugInfo);

  return new Promise((resolve, reject) => {
    ffmpeg(video.raw_path)
      .videoCodec('libx264')
      .outputOptions('-profile:v high')
      .outputOptions('-level:v 4.0')
      .audioCodec('copy')
      .on('start', (command) => {
        logger.debug('spawned ffmpeg', { command });
      })
      .on('error', (err) => {
        logger.error('failed to convert raw video to mp4', debugInfo);
        return reject(err);
      })
      .on('end', () => {
        logger.debug('raw video converted to mp4', debugInfo);
        video.mp4_filename = mp4Filename;
        video.mp4_path = mp4Path;
        return resolve(video);
      })
      .save(mp4Path);
  });
}

function uploadFileToS3(bucket, key, filepath) {
  logger.debug('uploading file to s3', { key, filepath });

  const params = {
    localFile: filepath,
    s3Params: {
      Bucket: bucket,
      Key: key,
      ACL: 'public-read'
    }
  };

  // s3Client.s3.headObject({
  //   Bucket: bucket,
  //   Key: key
  // }, (err, data) => {
  //   if (data) {
  //     logger.warn('file already exists on s3', { key });
  //   }
  // });

  return new Promise((resolve, reject) => {
    s3Client.uploadFile(params)
      .on('error', (err) => {
        logger.error('failed to upload file to s3', { key, error: err.toString() });

        return reject(err);
      })
      .on('end', () => {
        logger.debug('successfully uploaded file to s3', { key });

        const url = s3.getPublicUrl(bucket, key);

        return resolve(url);
      });
  });
}

function uploadToS3(video) {
  if (config.s3.disable) {
    logger.info('skipping s3');
    return Promise.resolve(video);
  }

  return Promise.all([
    uploadFileToS3(
      config.s3.bucket,
      path.join(config.s3.path, video.location_id, video.mp4_filename),
      video.mp4_path
    ),
    uploadFileToS3(
      config.s3.bucket,
      path.join(config.s3.path, video.location_id, video.webm_filename),
      video.webm_path
    )
  ])
  .then((urls) => {
    video.url = urls[0];
    video.url_webm = urls[1];
    return Promise.resolve(video);
  });
}

function saveVideoToDb(video) {
  const debugInfo = {
    filename: `${video.location_id}/${video.filename}`
  };
  logger.debug('saving video to database', debugInfo);

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
    .then((results) => {
      if (results.length > 0) {
        logger.debug('video saved to database', debugInfo);
      } else {
        logger.error('failed to save video to database', debugInfo);
      }
      video.db = results[0];
      return video;
    });
}

function deleteConvertedFiles(video) {
  logger.debug('deleting converted video files', {
    mp4_path: video.mp4_path,
    webm_path: video.webm_path
  });

  return unlink(video.mp4_path)
    .then(() => unlink(video.webm_path))
    .then(() => video);
}

function processRawVideo(video) {
  logger.debug('processing raw video', { raw_path: video.raw_path });

  if (video.skip) {
    return skipRawVideo(video);
  }

  return convertToMp4(video)
    .then(convertToWebM)
    .then(uploadToS3)
    .then(saveRawVideo)
    .then(saveVideoToDb)
    .then(deleteConvertedFiles)
    .then((row) => {
      logger.debug('video processing complete', { raw_path: video.raw_path });

      video.db = row;

      return video;
    });
}

function processLocation(id) {
  logger.debug('processing location %s', id);

  return dbLocation(id)
    .then((location) => {
      const dir = path.join(config.videoService.dirs.new, location.id);

      return readdir(dir)
        .then((files) => {
          location.files = files.map(filename => path.join(dir, filename));

          logger.info('processing %d file(s) for location %s', files.length, id);

          return location;
        });
    })
    .then((location) => {
      location.videos = location.files.map((filepath) => { // eslint-disable-line arrow-body-style
        return {
          location_id: location.id,
          skip: false,
          raw_path: filepath,
          raw_filename: path.basename(filepath)
        };
      });
      return location;
    })
    .then(location => Promise.mapSeries(location.videos, getRawMetadata).then(() => location))
    .then(location => Promise.mapSeries(location.videos, dbVideoExists).then(() => location))
    .then(location => Promise.mapSeries(location.videos, processRawVideo).then(() => location));
}

// run ------------------------------------------------------------------------

Promise.mapSeries(locationIds, processLocation)
  .then((locations) => {
    locations.forEach((location) => {
      logger.info('---------------------------------------------------------');
      logger.info('LOCATION: %s', location.id);
      logger.info('FILES:', location.files);
      location.videos.forEach((video, index) => {
        logger.info('VIDEO %d:', index, video);
      });
    });
    logger.info('---------------------------------------------------------');

    const uploadCount = locations.reduce((p, v) => {
      const uploadedVideos = v.videos.filter(video => !video.skip);
      return p + uploadedVideos.length;
    }, 0);

    const skipCount = locations.reduce((p, v) => {
      const skippedVideos = v.videos.filter(video => video.skip);
      return p + skippedVideos.length;
    }, 0);

    logger.info('processed %d file(s) (skipped %d)', uploadCount, skipCount);

    const endTime = new Date();
    logger.info('done (duration = %d sec)', (endTime - startTime) / 1000);
  })
  .catch((err) => {
    logger.error(err.toString());
  })
  .finally(() => {
    setTimeout(() => {
      process.exit(0);
    }, 1000 * 10);
  });
