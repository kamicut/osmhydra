const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const session = require('express-session')
const boom = require('express-boom')
const hydra = require('./hydra')

const { openstreetmap, ensureAuth } = require('./auth')
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

/**
 * Auth routes
 */
app.get('/auth/openstreetmap', openstreetmap)
app.get('/auth/openstreetmap/callback', openstreetmap)

app.get('/auth/logout', (req, res) => {
  req.session.destroy(function (err) {
    if (err) console.error(err)
    res.redirect('/')
  })
})

/** API routes */
app.get('/api/clients', ensureAuth(), async (req, res) => {
  let clients = await hydra.getClients()
  return res.send({ clients })
})

app.post('/api/clients', ensureAuth(), async (req, res) => {
  let toCreate = Object.assign({}, req.body)
  toCreate['scope'] = 'openid offline'
  toCreate['response_types'] = ['code', 'id_token']
  toCreate['grant_types'] = ['refresh_token', 'authorization_code']
  let client = await hydra.createClient(toCreate)
  return res.send({ client })
})

app.delete('/api/clients/:id', ensureAuth(), (req, res) => {
  hydra.deleteClient(req.params.id).then(() => res.sendStatus(200))
})

module.exports = app