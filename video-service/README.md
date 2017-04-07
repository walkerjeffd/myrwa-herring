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

Set up cron job

```
<TODO>
```
