// fetch volunteer videos and export to json

const jsonfile = require('jsonfile');

const config = require('../config');
const volunteer = require('./volunteer');

volunteer.getVideos(config.volunteer.path)
  .then((data) => {
    const videos = data.map((row) => { // eslint-disable-line
      return row.videos
        .filter(d => d.n_count === 0);
    });
    // return [].concat.apply([], videos);
    return videos;
  })
  .then((videos) => {
    jsonfile.writeFile('volunteer-queue-2018.json', videos, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log('Done');
      process.exit(0);
    });
  });
