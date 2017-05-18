var Promise = require('bluebird'),
    path = require('path'),
    fs = require('fs'),
    ffmpeg = require('fluent-ffmpeg');




ffmpeg('/Users/jeff/Projects/myrwa/herring/video-conversion/1_2017-04-21_12-30-54.mp4')
  .videoCodec('libvpx')
  .videoBitrate('1000')
  .outputOptions('-crf 10')
  .audioCodec('libvorbis')
  .on('start', function(commandLine) {
    console.log('Spawned Ffmpeg with command: ' + commandLine);
  })
  .on('error', function(err) {
    console.log('An error occurred: ' + err.message);
    process.exit(1);
  })
  .on('end', function() {
    console.log('Processing finished !');
    process.exit(0);
  })
  .save('/Users/jeff/Projects/myrwa/herring/video-conversion/1_2017-04-21_12-30-54-node.webm');