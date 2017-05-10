/* eslint-disable */
var Promise = require('bluebird'),
    path = require('path'),
    fs = require('fs'),
    ffmpeg = require('fluent-ffmpeg'),
    ffprobe = Promise.promisify(ffmpeg.ffprobe),
    s3 = require('s3'),
    moment = require('moment-timezone'),
    winston = require('winston'),
    download = require('download-file');

var config = require('../config');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: config.videoService.logLevel,
      timestamp: true
    })
  ]
});

var startTime = new Date();

logger.info('starting');

var s3Client = s3.createClient(config.s3.client);

var knex = require('knex')({
  client: 'pg',
  connection: config.db
});

var readdir = Promise.promisify(fs.readdir),
    rename = Promise.promisify(fs.rename),
    open = Promise.promisify(fs.open)
    unlink = Promise.promisify(fs.unlink);

// 1. get videos list from database
// 2. filter for missing videos.url_webm
// 3. for each video
//    a. download mp4 from s3 to save directory
//    b. convert to webm
//    c. upload webm to s3
//    d. update video.url_webm in db
//    e. delete webm from convert directory

// get videos list from database
function fetchVideosFromDb() {
  return knex('videos')
    .select()
    .whereNull('url_webm')
    .limit(config.videoService.maxConvert)
    .then(function (rows) {
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

  logger.debug('downloading file', {url, filepath: path.join(directory, filename)})

  return new Promise((resolve, reject) => {
    download(url, { directory, filename }, err => {
      if (err) return reject(err);

      return resolve(video);
    })
  })
}

function convertToWebM(video) {
  video.filename_webm = video.filename.replace('.mp4', '.webm');
  video.filepath_webm = path.join(config.videoService.dirs.convert, video.location_id, video.filename_webm);

  logger.debug('video file conversion starting', {
    id: video.id,
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
          id: video.id,
          mp4: path.join(video.location_id, video.filename),
          webm: path.join(video.location_id, video.filename_webm)
        });
        return reject(err);
      })
      .on('end', function() {
        logger.debug('video file conversion complete', {
          id: video.id,
          mp4: path.join(video.location_id, video.filename),
          webm: path.join(video.location_id, video.filename_webm)
        });
        return resolve(video);
      })
      .save(video.filepath_webm);
  });
}

function uploadWebMToS3(video) {
  logger.debug('uploading webm video to s3', {id: video.id, filename_webm: video.location_id + '/' + video.filename_webm});
  var bucket = config.s3.bucket,
      key = path.join(config.s3.path, video.location_id, video.filename_webm),
      filepath = video.filepath_webm;

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
    }, (err, data) => {
      if (data) {
        logger.warn('file already exists on s3', {id: video.id, key});
      }
    });

  return new Promise(function (resolve, reject) {
    s3Client.uploadFile(params)
      .on('error', (err) => {
        logger.error('failed to upload file to s3', {key: key});

        return reject(err);
      })
      .on('end', () => {
        logger.debug('successfully uploaded file to s3', {key: key});

        video.url_webm = s3.getPublicUrl(bucket, key);

        return resolve(video);
      });
  })
}

function updateDb(video) {
  logger.debug('updating database for video', {id: video.id, url_webm: video.url_webm});
  return knex('videos')
    .returning('*')
    .where('id', video.id)
    .update({
      url_webm: video.url_webm
    })
    .then(function (results) {
      if (results.length > 0) {
        logger.debug('video updated to database', {id: video.id, url_webm: results[0].url_webm});
      } else {
        logger.error('failed to update video in database', {id: video.id});
      }
      return video;
    });
}

function deleteConvertedFile(video) {
  logger.debug('deleting converted video files', {
    webm: video.filepath_webm
  });

  return unlink(video.filepath_webm)
    .then(() => video);
}

function moveFilesToSaveDir(video) {
  logger.debug('moving files to save dir', {id: video.id, filepath: video.filepath, filepath_webm: video.filepath_webm});

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

function convertVideo(video) {
  logger.info('converting video', {id: video.id, filename: video.location_id + '/' + video.filename});
  return downloadVideoFromS3(video)
    .then(convertToWebM)
    .then(uploadWebMToS3)
    .then(updateDb)
    .then(deleteConvertedFile)
    .then((video) => {
      logger.info('video conversion complete', {id: video.id, filename: video.location_id + '/' + video.filename})
      return video;
    });
}

function processChunk(videos) {
  return Promise.map(videos, convertVideo);
}

fetchVideosFromDb()
  .filter((video) => {
    return !video.url_webm;
  })
  .then((videos) => {
    if (videos.length === 0) {
      logger.info('no videos to convert');
      return videos;
    }

    videos.forEach((video) => {
      video.filepath = path.join(config.videoService.dirs.save, video.location_id, video.filename);
    });

    logger.info('converting %d video(s)', videos.length);

    var chunks = [],
        chunkSize = config.videoService.chunkSize;

    for (var i = 0, j = videos.length; i < j; i += chunkSize) {
      chunks.push(videos.slice(i, i + chunkSize));
    }

    return Promise.mapSeries(chunks, processChunk);
  })
  .then((chunks) => {
    logger.info('done, updated %d video(s)', chunks.reduce((p, v) => p + v.length, 0));
    process.exit(0);
  })
  .catch(function (err) {
    logger.error(err);
    process.exit(1);
  });