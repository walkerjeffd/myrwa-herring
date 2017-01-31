module.exports = {
  in_dir: '',        // path to find new videos
  save_dir: '',      // path to save videos after processing
  locationIds: [''], // location ids (corresponding to folder names)
  db: {
    // https://github.com/brianc/node-postgres
    user: '',
    password: '',
    database: '',
    host: 'localhost',
    port: 5432
  },
  s3: {
    bucket: '',     // bucket name
    path: 'videos/' // root folder in bucket
    client: {
      // https://github.com/andrewrk/node-s3-client
      maxAsyncS3: 20,     // this is the default
      s3RetryCount: 3,    // this is the default
      s3RetryDelay: 1000, // this is the default
      multipartUploadThreshold: 20971520, // this is the default (20 MB)
      multipartUploadSize: 15728640, // this is the default (15 MB)
      s3Options: {
        accessKeyId: "",
        secretAccessKey: "",
        region: ""
      }
    }
  }
}