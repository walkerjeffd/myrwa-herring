/* eslint-disable no-param-reassign */

const Promise = require('bluebird');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const s3 = require('s3');
const winston = require('winston');
const download = require('download-file');

// const ffprobe = Promise.promisify(ffmpeg.ffprobe);
// const readdir = Promise.promisify(fs.readdir);
// const rename = Promise.promisify(fs.rename);
const unlink = Promise.promisify(fs.unlink);

const config = require('../config');

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: config.videoService.logLevel,
      timestamp: true
    })
  ]
});

logger.info('starting');

const s3Client = s3.createClient(config.s3.client);

const knex = require('knex')({
  client: 'pg',
  connection: config.db
});

// 1. get videos list from database
// 2. filter for id < 21182, mp4_converted
// 3. for each video
//    a. download mp4 from s3 (if not already downloaded)
//    b. convert to mp4/L4
//    c. upload converted mp4/L4 to s3
//    d. delete mp4/L4 converted file
//    e. update database

// functions ------------------------------------------------------------------

function dbVideos() {
  return knex('videos')
    .select()
    .where('start_timestamp', '>=', '2017-04-24 00:00:00+00')
    .where('mp4_converted', '=', false)
    .limit(config.videoService.maxConvert)
    .then((rows) => {
      logger.info('fetched %d video(s) from database', rows.length);
      return rows;
    });
}

function downloadVideoFromS3(video) {
  const url = video.url;
  const directory = path.dirname(video.filepath);
  const filename = video.filename;

  if (fs.existsSync(video.filepath)) {
    logger.info('file already downloaded', { filepath: video.filepath });
    return Promise.resolve(video);
  }

  logger.debug('downloading file', { url, filepath: video.filepath });

  return new Promise((resolve, reject) => {
    download(url, { directory, filename }, (err) => {
      if (err) return reject(err);

      return resolve(video);
    });
  });
}

function convertToMp4(video) {
  const mp4Filename = video.filename;
  const mp4Path = path.join(
    config.videoService.dirs.convert, video.location_id, mp4Filename
  );

  const debugInfo = {
    filepath: video.filepath,
    mp4_path: mp4Path
  };
  logger.debug('converting raw video to mp4', debugInfo);

  return new Promise((resolve, reject) => {
    ffmpeg(video.filepath)
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

function uploadToS3(video) {
  logger.debug('uploading file to s3', { mp4_path: video.mp4_path });

  const bucket = config.s3.bucket;
  const key = path.join(config.s3.path, video.location_id, video.mp4_filename);

  const params = {
    localFile: video.mp4_path,
    s3Params: {
      Bucket: bucket,
      Key: key,
      ACL: 'public-read'
    }
  };

  return new Promise((resolve, reject) => {
    s3Client.uploadFile(params)
      .on('error', (err) => {
        logger.error('failed to upload file to s3', { key, error: err.toString() });

        return reject(err);
      })
      .on('end', () => {
        logger.debug('successfully uploaded file to s3', { key });

        return resolve(video);
      });
  });
}

function deleteConvertedFile(video) {
  logger.debug('deleting converted video files', {
    mp4_path: video.mp4_path
  });

  return unlink(video.mp4_path)
    .then(() => video);
}

function updateDb(video) {
  logger.debug('updating database for video', { id: video.id });
  return knex('videos')
    .returning('*')
    .where('id', video.id)
    .update({
      mp4_converted: true
    })
    .then((results) => {
      if (results.length > 0) {
        logger.debug('video updated to database', { id: video.id });
      } else {
        logger.error('failed to update video in database', { id: video.id });
      }
      return video;
    });
}

function convertVideo(video) {
  logger.info('converting video to mp4/L4', { filepath: video.filepath });
  return downloadVideoFromS3(video)
    .then(convertToMp4)
    .then(uploadToS3)
    .then(updateDb)
    .then(deleteConvertedFile)
    .then(() => {
      logger.info('video conversion complete', { filename: `${video.location_id}/${video.filename}` });
      return video;
    });
}

function processChunk(videos) {
  return Promise.map(videos, convertVideo);
}

// run ------------------------------------------------------------------------

dbVideos()
  .then((videos) => {
    if (videos.length === 0) {
      logger.info('no videos to convert');
      return videos;
    }

    videos.forEach((video) => {
      video.filepath = path.join(config.videoService.dirs.save, video.location_id, video.filename);
    });

    logger.info('converting %d video(s)', videos.length);

    const chunks = [];
    const chunkSize = config.videoService.chunkSize;

    for (let i = 0, j = videos.length; i < j; i += chunkSize) {
      chunks.push(videos.slice(i, i + chunkSize));
    }

    return Promise.mapSeries(chunks, processChunk);
  })
  .then((chunks) => {
    logger.info('done, updated %d video(s)', chunks.reduce((p, v) => p + v.length, 0));
    process.exit(0);
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
