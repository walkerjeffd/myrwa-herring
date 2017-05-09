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

## Run Process (Manual)

```
npm start
```

## Scheduled Runs

Find path to node (b/c nvm)

```bash
which node
# /home/myrwa/.nvm/versions/node/v7.7.4/bin/node
```

Add crontab line to run at minute 5 of each hour

```bash
crontab -e

# 5 * * * * cd /home/myrwa/apps/myrwa-herring-web/video-service && /home/myrwa/.nvm/versions/node/v7.7.4/bin/node process.js > /dev/null 2>&1
```