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
head db/permissions.sql
# manually create myrwa_www role
psql -d herring -f db/permissions.sql
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
# sudo ufw allow <port>                       # open port
node server.js                                # run api server
```

Service:

```
pm2 start server.js --name herring-api
```

Endpoints:

```
GET  /static/video-app -> ../video-app/dist # client application delivery
GET  /status/          -> db status
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