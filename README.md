Herring Video Count API
=======================================

Jeffrey D Walker, PhD
[Walker Environmental Research, LLC](http://walkerenvres.com)

## Configuration

Copy server configuration template and set parameters. See README files in each component folder for details.

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
/config          # common configuration
/db              # database
/nginx           # proxy server configuration
/pm2             # pm2 configuration
/r               # R scripts
/video-service   # video processing service
```
