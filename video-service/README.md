Mystic Herring Migration - Video Processing Service
===================================================

## Configuration

See `/config/index.template.js`

```js
{
  videoService: {
    inDir: 'path/to/video inbox',       // discover new videos
    saveDir: 'path/to/video storage',   // move video files here after processing
    locationIds: ['TEST', 'UML', 'WIN'] // list of location IDs to process
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

```
which node
```

Add crontab line to run at minute 5 of each hour

```
crontab -e
5 * * * * cd /home/myrwa/apps/myrwa-herring-web/video-service && /home/myrwa/.nvm/versions/node/v7.7.4/bin/node process.js >> process.log 2>&1
```