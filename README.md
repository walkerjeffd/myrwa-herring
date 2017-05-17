MyRWA River Herring Video Count Website
=======================================

Jeffrey D Walker, PhD
[Walker Environmental Research, LLC](http://walkerenvres.com)

## Configuration

Copy server configuration template and set parameters. See README files in each component folder for details.

```bash
cp config/index.template.js config/index.js   # copy config template
nano config/index.js                          # edit config
```

Copy client configuration template and set API url.

```bash
cp apps/config/index.template.js apps/config/index.js  # copy config template
nano apps/config/index.js
```


## System Requirements

- [ffmpeg/ffprobe](https://ffmpeg.org/)
- [nvm/node](https://github.com/creationix/nvm)

## Components

```text
/api             # api server
/apps            # client-side applications
  /status        # video count status app
  /watch         # video count watch app
  /vis-temp      # data vis temperature app
/config          # common configuration
/db              # database
/nginx           # proxy server configuration
/pm2             # pm2 configuration
/r               # R scripts
/video-service   # video processing service
```
