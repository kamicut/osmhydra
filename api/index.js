const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const session = require('express-session')
const boom = require('express-boom')

const { openstreetmap } = require('./lib/osm')
const { getLogin } = require('./providers/login')
const { getConsent, postConsent} = require('./providers/consent')
const { getClients, createClient, deleteClient } = require('./manage/client')
const { login, loginAccept, logout } = require('./manage/login')
const { serverRuntimeConfig } = require('../next.config')
const { attachUser, protected } = require('./manage/authz')

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

/**
 * Auth routes
 */
app.use(attachUser())
app.get('/manage/login', login)
app.get('/manage/login/accept', loginAccept)
app.get('/manage/logout', logout)

app.get('/auth/openstreetmap', openstreetmap)
app.get('/auth/openstreetmap/callback', openstreetmap)


/** 
 * OAuth Client routes
 */
app.get('/manage/clients', protected(), getClients)
app.post('/manage/clients', protected(), createClient)
app.delete('/manage/clients/:id', protected(), deleteClient)

/** Nextjs Renders */
function init(nextApp) {
  const handle = nextApp.getRequestHandler()

  app.get('/', (req, res) => {
    return nextApp.render(req, res, '/', { user: req.session.user })
  })

  app.get('/clients', protected(), (req, res) => {
    return nextApp.render(req, res, '/clients', { user: req.session.user })
  })

  app.get('/login', getLogin(nextApp))
  app.get('/consent', getConsent(nextApp))
  app.post('/consent',
    bodyParser.urlencoded({ extended: false }),
    postConsent(nextApp))

  app.get('*', (req, res) => {
    return handle(req, res)
  })

  /**
   * Error handler
   */
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    console.error('error', err)
    res.send(err)
  })

  return app
}

module.exports = init