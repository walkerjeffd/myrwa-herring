MyRWA River Herring Video Count Website
=======================================

Jeffrey D Walker, PhD
[Walker Environmental Research, LLC](http://walkerenvres.com)

## Configuration

Copy configuration template and set parameters. See README files in each component folder for details.

```bash
cp config/index.template.js config/index.js   # copy config template
nano config/index.js                          # edit config
```

## System Requirements

- [ffmpeg/ffprobe](https://ffmpeg.org/)
- [nvm/node](https://github.com/creationix/nvm)

## Components

```text
/api             # api server
/apps            # client-side applications
  /video-status  # video status app
  /video-watch   # video watch app
  /vis-temp      # data vis temperature app
/config          # common configuration
/db              # database
/nginx           # proxy server configuration
/pm2             # pm2 configuration
/r               # R scripts
/sandbox         # development and testing environment
/video-service   # video processing service
```
