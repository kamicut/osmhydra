const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const session = require('express-session')
const boom = require('express-boom')

const { openstreetmap } = require('./auth')
const { serverRuntimeConfig } = require('../next.config')

const app = express()

app.use(bodyParser.json())
app.use(compression())
app.use(boom())

const SESSION_SECRET = serverRuntimeConfig.SESSION_SECRET || 'super-secret-sessions'

let sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  expires: new Date(Date.now() + (30 * 86400 * 1000))
}

app.use(session(sessionConfig))

app.get('/auth/openstreetmap', openstreetmap)
app.get('/auth/openstreetmap/callback', openstreetmap)
app.get('/auth/logout', (req, res) => {
  req.session.destroy(function (err) {
    if (err) console.error(err)
    res.redirect('/')
  })
})

module.exports = app