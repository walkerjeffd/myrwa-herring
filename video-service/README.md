Mystic Herring Migration - Video Processing Service
===================================================

## Configuration

See `/config/index.template.js`

```js
{
  videoService: {
    logLevel: 'debug',                    // log level (winston)
    logFile: '/path/to/logs/process.log', // log file
    dirs: {
      new: '/path/to/new',                // new videos
      skip: '/path/to/skip',              // skipped videos
      save: '/path/to/save',              // saved videos (cleared)
      convert: '/path/to/convert'         // converted videos (cleared)
    },
    locationIds: ['TEST', 'UML', 'WIN'],  // list of location IDs to process
    maxConvert: 100,                      // max number of files to convert at once
    chunkSize: 2                          // number of files to convert in parallel (<= # cores)
  },
  ...
}
```

## Video Processor

The `process.js` script checks for new video files, converts them to different formats, uploads the converted files to AWS S3, and saves the metadata to the database.

### Manual Run

```
npm start
```

## Automated Run

Find path to node (b/c nvm)

```bash
which node
# /home/myrwa/.nvm/versions/node/v7.7.4/bin/node
```

Add cron job to run at minute 5 of each hour

```bash
crontab -e
# 5 * * * * cd /home/myrwa/apps/myrwa-herring-web/video-service && /home/myrwa/.nvm/versions/node/v7.7.4/bin/node process.js > /dev/null 2>&1
```

## Batch Conversion

The `convert-mp4.js` and `convert-webm.js` scripts convert the raw video files to MP4 and WebM formats for playing on the website.

### Convert MP4

The converted MP4 format is similar to the raw video format, but changes the H.264 encoding from Main/L5.2 to High/L4.0.

This script expects a temporary column called `mp4_converted Boolean` in `videos` table. It checks for any records where `mp4_converted = false`, downloads the original mp4 file (i.e. the raw video file) to the `config.videoService.save` directory (skipping if it already exists), converts the encoding to High/L4.0, uploads the converted file to S3, updates the database (`mp4_converted = true`), and finally deletes the converted file from the local file system.

```bash
node convert-mp4.js >> convert-mp4.log 2>&1
```

### Convert WebM

WebM is used as a backup for older browsers that do not support H.264.

This script checks for any video records where `url_webm IS NULL`, then downloads the original mp4 file (i.e. the raw video file) to the `config.videoService.save` directory (skipping if it already exists), converts the encoding to WebM, uploads the converted file to S3, updates the database (sets `url_webm`), and finally deletes the converted file from the local file system.

```bash
node convert-webm.js >> convert-webm.log 2>&1
```
