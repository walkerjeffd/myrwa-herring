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

## API

See `./api/README.md` for instructions.

## Video Processing Service

The video processing service (`./video-service`) processes new videos as they are uploaded via FTP.

Install [ffmpeg/ffprobe](https://ffmpeg.org/) for video conversions.

See `./video-service/README.md` for instructions.

## R Report

See `./r/README.md` for instructions.

```
cd r/
Rscript video-report.R # -> r/pdf/video-<YEAR>-<LOCATION_ID>.pdf
```

