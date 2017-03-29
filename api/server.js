var express = require('express'),
    bodyParser = require('body-parser');

var app = express();

var config = require('../config');

var db = require('./db');

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
};

app.use(bodyParser.json());
app.use(allowCrossDomain);

app.use('/static/video-app', express.static(config.api.static.videoApp));

app.get('/status/', function (req, res) {
  console.log('GET /status/');
  db.status()
    .then(function (result) {
      return res.status(200).json({status: 'ok', data: result});
    })
    .catch(function (err) {
      console.error(err);
      return res.status(500).json({status: 'error', error: err.toString()})
    })
});

app.get('/watch/', function (req, res) {
  console.log('GET /watch/', req.query);
  db.watch(req.query)
    .then(function (result) {
      return res.status(200).json({status: 'ok', data: result});
    })
    .catch(function (err) {
      return res.status(500).json({status: 'error', error: err.toString()})
    })
});

app.post('/count/', function (req, res) {
  console.log('POST /count/');

  db.saveCount(req.body)
    .then(function (result) {
      return res.status(200).json({status: 'ok', data: result});
    })
    .catch(function (err) {
      return res.status(500).json({status: 'error', error: err})
    })
});

app.listen(config.api.port, function () {
  console.log('started on port %d', config.api.port);
});
