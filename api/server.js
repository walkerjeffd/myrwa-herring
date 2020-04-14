const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const config = require('../config');
const db = require('./db');
// const volunteer = require('./volunteer');
const utils = require('./utils');

const app = express();

console.log('booting');


// access logging
morgan.token('real-ip', req => req.headers['x-real-ip'] || req.connection.remoteAddress);
const logFormat = ':date[iso] :real-ip :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms';
const accessLogStream = fs.createWriteStream(config.api.logFile, { flags: 'a' });
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


// set up priority queue
const volunteerQueue = [];
// let volunteerQueue = [];
// function refreshVolunteerQueue() {
//   console.log('updating volunteerQueue');
//   volunteer.getVideos(config.volunteer.path)
//     .then((data) => {
//       const videos = data.map((row) => { // eslint-disable-line
//         return row.videos
//           .filter(d => d.n_count === 0)
//           .map(d => d.id);
//       });
//       volunteerQueue = [].concat.apply([], videos); // eslint-disable-line
//       console.log(`updated volunteerQueue (n = ${volunteerQueue.length})`);
//     });
// }
// refreshVolunteerQueue();
// setInterval(refreshVolunteerQueue, config.volunteer.interval * 1000);

// paths to app builds
app.use('/reports', express.static(config.api.static.reports));
app.use('/datasets', express.static(config.api.static.datasets));


// pages
app.use('/www/', express.static('./www/'));

// endpoints
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', data: [] });
});

app.get('/status/', (req, res, next) => {
  const query = {
    location_id: 'UML'
  };

  if ('location_id' in req.query) {
    query.location_id = req.query.location_id;
  }

  const siteConfig = config.api.sites[query.location_id].status;

  query.start_date = req.query.start_date || siteConfig.dates[0];
  query.end_date = utils.minDateOrToday(req.query.end_date, siteConfig.dates[1]);
  query.start_hour = req.query.start_hour || siteConfig.hours[0];
  query.end_hour = req.query.end_hour || siteConfig.hours[1];

  db.getStatus(query)
    .then(result => res.status(200).json({ status: 'ok', data: result }))
    .catch(next);
});

app.get('/video/', (req, res, next) => {
  const query = {
    first: false,
    location_id: 'UML'
  };

  if ('location_id' in req.query) {
    query.location_id = req.query.location_id;
  }
  const siteConfig = config.api.sites[query.location_id].videos;

  if ('first' in req.query && siteConfig.allowFirst) {
    query.first = req.query.first === 'true';
  }

  query.start_hour = siteConfig.hours[0];
  query.end_hour = siteConfig.hours[1];

  if (!query.first && query.location_id === 'UML' && volunteerQueue.length > 0) {
    const index = Math.floor(Math.random() * volunteerQueue.length);
    return db.getVideoById(volunteerQueue.splice(index, 1)[0])
      .then((result) => {
        console.log('served volunteer video id=%d location=%s ip=%s', result.length > 0 ? result[0].id : 'unknown', query.location_id, req.headers['x-real-ip'] || req.connection.remoteAddress);
        return res.status(200).json({ status: 'ok', data: result });
      })
      .catch(next);
  }

  let func;
  switch (siteConfig.method.type) {
    case 'uniform':
      func = db.getRandomVideoUniform;
      break;
    case 'exponential':
      func = db.getRandomVideoExponential;
      query.lambda = siteConfig.method.lambda;
      break;
    default:
      console.error(`Invalid video selection method (${siteConfig.method.type}), must be one of {uniform,exponential}.`);
      return res.status(500).json({ status: 'error', error: 'Invalid server configuration' });
  }

  switch (siteConfig.window.type) {
    case 'fixed':
      query.start_date = siteConfig.window.dates[0];
      query.end_date = siteConfig.window.dates[1];
      break;
    // eslint-disable-next-line no-case-declarations
    case 'sliding':
      const windowDates = utils.getSlidingWindowDates(
        siteConfig.window.dates,
        siteConfig.window.days
      );
      query.start_date = windowDates[0];
      query.end_date = windowDates[1];
      break;
    default:
      console.error(`Invalid video window (${siteConfig.window.type}), must be one of {fixed,sliding}.`);
      return res.status(500).json({ status: 'error', error: 'Invalid server configuration' });
  }

  return func(query)
    .then((result) => {
      console.log('served random video id=%d location=%s first=%s ip=%s', result.length > 0 ? result[0].id : 'unknown', query.location_id, query.first, req.headers['x-real-ip'] || req.connection.remoteAddress);
      return res.status(200).json({ status: 'ok', data: result });
    })
    .catch(next);
});

app.get('/videos/', (req, res, next) => {
  const query = {
    location_id: req.query.location_id || 'UML'
  };

  const siteConfig = config.api.sites[query.location_id].allVideos;

  query.start_date = req.query.start_date || siteConfig.dates[0];
  query.end_date = req.query.end_date || siteConfig.dates[1];
  query.start_hour = req.query.start_hour || 0;
  query.end_hour = req.query.end_hour || 23;

  db.getVideos(query)
    .then(result => res.status(200).json({ status: 'ok', data: result }))
    .catch(next);
});

app.post('/count/', (req, res, next) => {
  console.log('received count=%d video_id=%d ip=%s', req.body.count, req.body.video_id, req.headers['x-real-ip'] || req.connection.remoteAddress);
  db.saveCount(req.body)
    .then(result => res.status(201).json({ status: 'ok', data: result }))
    .catch(next);
});

app.get('/users/', (req, res, next) => {
  const query = {
    location_id: 'UML'
  };

  if ('location_id' in req.query) {
    query.location_id = req.query.location_id;
  }

  if ('username' in req.query) {
    query.username = req.query.username;
  }

  const siteConfig = config.api.sites[query.location_id].status;

  query.start_date = req.query.start_date || siteConfig.dates[0];
  query.end_date = req.query.end_date || siteConfig.dates[1];

  return db.getUsers(query)
    .then(result => res.status(200).json({ status: 'ok', data: result }))
    .catch(next);
});

app.get('/users/:uid', (req, res, next) => {
  const query = {
    location_id: 'UML',
    uid: req.params.uid
  };

  if ('location_id' in req.query) {
    query.location_id = req.query.location_id;
  }

  const siteConfig = config.api.sites[query.location_id].status;

  query.start_date = req.query.start_date || siteConfig.dates[0];
  query.end_date = req.query.end_date || siteConfig.dates[1];

  db.getUserByUid(query)
    .then(result => res.status(200).json({ status: 'ok', data: result }))
    .catch(next);
});

app.delete('/users/:uid', (req, res, next) => {
  db.deleteUser({ uid: req.params.uid })
    .then(() => res.status(202).json({ status: 'ok' }))
    .catch(next);
});

app.put('/users/:uid', (req, res, next) => {
  db.updateUser({ uid: req.params.uid, username: req.body.username })
    .then(result => res.status(200).json({ status: 'ok', data: result }))
    .catch(next);
});

app.get('/username-available/', (req, res, next) => {
  if (!req.query.username) {
    return res.status(400).json({ status: 'error', error: { message: 'Missing username query parameter' } });
  }
  return db.checkUsernameAvailability(req.query.username)
    .then(result => res.status(200).json({ status: 'ok', data: { available: result } }))
    .catch(next);
});

app.post('/users/', (req, res, next) => {
  console.log('received new user', req.body.uid, req.body.username, req.headers['x-real-ip'] || req.connection.remoteAddress);
  db.createUser(req.body)
    .then(result => res.status(201).json({ status: 'ok', data: result }))
    .catch(next);
});

app.get('/sensor/', (req, res, next) => {
  const query = {
    location_id: 'UML'
  };

  if ('location_id' in req.query) {
    query.location_id = req.query.location_id;
  }

  const siteConfig = config.api.sites[query.location_id].status;

  query.start_date = req.query.start_date || siteConfig.dates[0];
  query.end_date = utils.minDateOrToday(req.query.end_date, siteConfig.dates[1]);

  return db.getSensorData(query)
    .then(result => res.status(200).json({ status: 'ok', data: result }))
    .catch(next);
});

app.get('/sensor-hourly/', (req, res, next) => {
  const query = {
    location_id: 'UML'
  };

  if ('location_id' in req.query) {
    query.location_id = req.query.location_id;
  }

  const siteConfig = config.api.sites[query.location_id].status;

  query.start_date = req.query.start_date || siteConfig.dates[0];
  query.end_date = utils.minDateOrToday(req.query.end_date, siteConfig.dates[1]);

  return db.getSensorHourlyData(query)
    .then(result => res.status(200).json({ status: 'ok', data: result }))
    .catch(next);
});

app.post('/sensor/', (req, res, next) => {
  console.log('received sensor data');
  if (!req.body) {
    return res.status(400).json({ status: 'error', error: { message: 'No data found in request' } });
  } else if (!req.body.secret || req.body.secret !== config.api.sensor.secret) {
    return res.status(401).json({ status: 'error', error: { message: 'Unauthorized request, secret is missing or incorrect' } });
  }
  const data = {
    location_id: 'UML',
    timestamp: req.body.timestamp,
    temperature_degc: req.body.data.Temperature_degC,
    specificconductance_us_cm: req.body.data.SpecificConductance_uS_cm,
    depth_m: req.body.data.Depth_m,
    battery_v: req.body.data.Battery_V,
    turbidity_ntu: req.body.data.Turbidity_NTU,
    nh3_ammonia_mg_l: req.body.data.NH3_Ammonia_mg_L,
    chlorophyll_ug_l: req.body.data.Chlorophyll_ug_L,
    chlorophyll_rfu: req.body.data.Chlorophyll_RFU,
    odo_pcsat: req.body.data.ODO_pcSat,
    odo_mg_l: req.body.data.ODO_mg_L,
    bga_pc_ug_l: req.body.data.BGA_PC_ug_L
  };
  return db.saveSensor(data)
    .then(result => res.status(200).json({ status: 'ok', data: result }))
    .catch(next);
});

app.get('/run-estimate/', (req, res, next) => {
  const query = {
    location_id: 'UML'
  };

  if ('location_id' in req.query) {
    query.location_id = req.query.location_id;
  }

  const siteConfig = config.api.sites[query.location_id].run;

  query.start_date = req.query.start_date || siteConfig.dates[0];
  query.end_date = utils.minDateOrToday(req.query.end_date, siteConfig.dates[1]);
  return db.getDailyRunEstimate(query)
    .then(result => res.status(200).json({ status: 'ok', data: result }))
    .catch(next);
});

// error handler
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err.toString());
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
  console.log('listening port=%d', config.api.port);
});
