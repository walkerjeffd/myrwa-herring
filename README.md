MyRWA River Herring Video Count Website
=======================================

Jeffrey D Walker, PhD
[Walker Environmental Research, LLC](http://walkerenvres.com)



# Components



## Database

Create:

```
createdb herring
```

Set up:

```
psql -d herring -f db/schema.sql
```

Populate:

```
psql -d herring -f db/fixtures/locations.sql
```



## API

Enter:

```
cd api
```

Configure:

```
# cp config/index.template.js config/index.js # copy config template
nano config/index.js                          # edit config
```

Run:

```
node server.js                                # run api server
```

Endpoints:

```
GET  /static/video-app -> ../video-app/dist # client application delivery
GET  /stats/           -> db stats
GET  /watch/           -> video
POST /count/           -> submit fish count
```



## Video Processing Service

Enter:

```
cd video-service
```

Configure:

```
cp config/index.template.js config/index.js  # copy config template
nano config/index.js                         # edit config
```

Run:

```
node ./video-service/process.js
```



## Video Application

Enter:

```
cd video-app
```

Configure:

```
cp src/config/index.template.js src/config/index.js  # copy config template
nano src/config/index.js                             # edit config
```

Edit CSS:

```
nano src/app.css
```

Development:

```
npm run dev
```

Production Build:

```
browserify src/main.js > dist/build.js
```



# System Requirements

- ffmpeg/ffprobe
- node