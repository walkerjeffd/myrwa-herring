const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const config = require('../config');
const db = require('./db');

const debug = require('debug')('mrh-api');

debug.log = console.log.bind(console);

const app = express();

debug('booting');


// access logging
morgan.token('real-ip', req => req.headers['x-real-ip'] || req.connection.remoteAddress);
const logFormat = ':date[iso] :real-ip :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms';
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan(logFormat, { stream: accessLogStream }));


// body parser (json only)
app.use(bodyParser.json());


// allow CORS
const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};
app.use(allowCrossDomain);


// paths to app builds
app.use('/static/video-watch', express.static(config.api.static.videoWatch));
app.use('/static/video-status', express.static(config.api.static.videoStatus));
app.use('/static/vis-temp', express.static(config.api.static.visTemp));
app.use('/reports', express.static(config.api.static.reports));


// pages
app.use('/www/', express.static('./www/'));

// endpoints
app.get('/status/', (req, res, next) => {
  db.getStatus()
    .then(result => res.status(200).json({ status: 'ok', data: result }))
    .catch(next);
});

app.get('/video/', (req, res, next) => {
  db.getVideo(req.query)
    .then((result) => {
      debug('served video id=%d ip=%s', result.length > 0 ? result[0].id : 'unknown', req.headers['x-real-ip'] || req.connection.remoteAddress);
      return res.status(200).json({ status: 'ok', data: result });
    })
    .catch(next);
});

app.get('/videos/', (req, res, next) => {
  db.getVideos(req.query)
    .then(result => res.status(200).json({ status: 'ok', data: result }))
    .catch(next);
});

app.post('/count/', (req, res, next) => {
  debug('received count=%d video_id=%d ip=%s', req.body.count, req.body.video_id, req.headers['x-real-ip'] || req.connection.remoteAddress);
  db.saveCount(req.body)
    .then(result => res.status(201).json({ status: 'ok', data: result }))
    .catch(next);
});

// error handler
function errorHandler(err, req, res, next) {
  debug('error', err);
  return res.status(500).json({
    status: 'error',
    error: {
      data: err,
      message: err.toString(),
    },
  });
}
app.use(errorHandler);

// start server
app.listen(config.api.port, () => {
  debug('listening port=%d', config.api.port);
});
