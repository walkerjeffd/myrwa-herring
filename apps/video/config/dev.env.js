'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_URL: '"http://localhost:8000"',
  FIREBASE_API_KEY: '"AIzaSyDPhhN87c59c40naos-ADtTuL8zKOIexj8"',
  FIREBASE_AUTH_DOMAIN: '"myrwa-herring-dev.firebaseapp.com"',
  FIREBASE_DATABASE_URL: '"https://myrwa-herring-dev.firebaseio.com"',
  FIREBASE_PROJECT_ID: '"myrwa-herring-dev"',
  FIREBASE_STORAGE_BUCKET: '"myrwa-herring-dev.appspot.com"',
  FIREBASE_MESSENGER_SENDER_ID: '"608911794338"'
})
