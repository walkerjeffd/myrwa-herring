MyRWA River Herring Video Count Website
=======================================

Jeffrey D Walker, PhD
[Walker Environmental Research, LLC](http://walkerenvres.com)

## Database

Create database

```
createdb herring
```

Set up schema

```
psql -d herring -f db/schema.sql
```

Insert locations data

```
psql -d herring -f db/fixtures/locations.sql
```

## API



## Video Processing Service

Set up new configuration file (see template for instructions):

```
cp ./video-service/config/index.template.js ./video-service/config/index.js
nano ./video-service/config/index.js
```

Run the video processing service

```
node ./video-service/process.js
```

## System Requirements

- ffmpeg/ffprobe
- node