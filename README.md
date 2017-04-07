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

## Components

```
/api           # api server
/config        # common configuration
/db            # database
/nginx         # proxy server configuration
/video-service # video processing service
/video-status  # video count status app
/video-watch   # video count watch app
/vis-temp      # data visualization temperature app
```

## System Requirements

- [ffmpeg/ffprobe](https://ffmpeg.org/)
- [nvm/node](https://github.com/creationix/nvm)
