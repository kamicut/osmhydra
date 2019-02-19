require('dotenv').config()

const path = require('path')
const Dotenv = require('dotenv-webpack')

module.exports = {
  serverRuntimeConfig: {
    OSM_CONSUMER_KEY: process.env.OSM_CONSUMER_KEY,
    OSM_CONSUMER_SECRET: process.env.OSM_CONSUMER_SECRET,
    HYDRA_ADMIN_URL: process.env.HYDRA_ADMIN_URL || 'http://localhost:4445'
  },
  publicRuntimeConfig: {
    APP_URL: process.env.APP_URL || 'http://localhost:8989'
  },
  webpack: (config) => {
    config.plugins = config.plugins || []

    config.plugins = [
      ...config.plugins,

      // Read the .env file
      new Dotenv({
        path: path.join(__dirname, '.env'),
        systemvars: true
      })
    ]

    return config
  }
}