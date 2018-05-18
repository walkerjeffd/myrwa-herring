module.exports = {
  api: {
    port: 8000,       // API listening port
    maxCount: 300,    // counts exceeding this are auto-flagged
    static: {
      videoWatch: '../apps/watch/dist',
      videoStatus: '../apps/status/dist',
      visTemp: '../apps/vis-temp/dist',
      reports: '../r/pdf'
    },
    sprint: {
      from: 'YYYY-MM-DD',
      to: 'YYYY-MM-DD'
    },
    sensor: {
      secret: 'secret password'
    },
    logFile: '/path/to/api-access.log',
    videos: {              // video selection criteria
      lambda: 0.0005,      // exponential distribution parameter
      year: 2018,          // year
      start: '2018-04-27', // first date
      location: 'UML',     // location
      hours: [7, 19]       // range of hours (end hour not inclusive)
    }
  },
  db: {
    host: '',
    port: 5432,
    database: '',
    user: '',
    password: ''
  },
  videoService: {
    logLevel: 'debug', // minimum logging level
    logFile: '/path/to/process.log', // log file
    dirs: {
      new: '',         // directory containing new videos
      save: '',        // directory to save videos after processing
      skip: '',        // directory to save skipped videos
      convert: ''      // directory to save converted videos
    },
    locationIds: ['TEST', 'UML', 'WIN'], // location IDs to process
    maxConvert: 100,   // maximum number of files to convert
    chunkSize: 3       // number of files to convert simultaneously (limit to # cpu cores)
  },
  s3: {
    disable: false, // disable S3 uploading
    bucket: '',     // S3 bucket name
    path: '',       // S3 videos path
    client: {
      maxAsyncS3: 20,                     // default
      s3RetryCount: 3,                    // default
      s3RetryDelay: 1000,                 // default
      multipartUploadThreshold: 20971520, // default (20 MB)
      multipartUploadSize: 15728640,      // default (15 MB)
      s3Options: {
        accessKeyId: '',     // S3 Access Key ID
        secretAccessKey: '', // S3 Secret Access Key
        region: ''           // default
      }
    }
  },
  volunteer: {
    docId: '',      // google sheet ID for volunteer counts
    interval: 3600  // update interval (seconds, default = 1 hr)
  },
  mail: {
    disable: false, // disable email notifications
    notify: '',     // email address for notifications
    server: {
      // smtp server settings
      username: '',
      password: '',
      host: ''
    }
  }
}
