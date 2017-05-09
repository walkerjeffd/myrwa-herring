MyRWA River Herring Video Count Website
=======================================

Jeffrey D Walker, PhD
[Walker Environmental Research, LLC](http://walkerenvres.com)

## Configuration

Copy config template to active file and enter parameters. See README files in each component folder for details.

```
# cp config/index.template.js config/index.js # copy config template
nano config/index.js                          # edit config
```

## System Requirements

- [ffmpeg/ffprobe](https://ffmpeg.org/)
- [nvm/node](https://github.com/creationix/nvm)

## Components

```
/api             # api server
/apps            # client-side applications
  /video-status  # video status app
  /video-watch   # video watch app
  /vis-temp      # data vis temperature app
/config          # common configuration
/db              # database
/nginx           # proxy server configuration
/video-service   # video processing service
```

## Log Files

```
~/.pm2/logs/mrh-api-out.log   -> ~/data/herring/logs/api-out.log    | API stdout logs
~/.pm2/logs/mrh-api-error.log -> ~/data/herring/logs/api-err.log    | API stderror logs
api/access.log                -> ~/data/herring/logs/api-access.log | API HTTP logs
video-service/process.log     -> ~/data/herring/logs/process.log    | Video processing service logs
```