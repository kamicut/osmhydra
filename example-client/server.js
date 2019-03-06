const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const boom = require('express-boom')
const jwt = require('jsonwebtoken')
const oauth2 = require('simple-oauth2')
const session = require('express-session')
const fetch = require('node-fetch')

const app = express()
app.use(bodyParser.json())
app.use(compression())
app.use(boom())
app.set('view engine', 'ejs');
app.use(session({ 
  name: 'osm-hydra-example', 
  resave: true,
  secret: 'super-secret',
  saveUninitialized: true 
}))

/**
 * Take in the client id and secret and start the flow
 */
function authorizationFlow (req, res)  {
  const {clientId, clientSecret} = req.body
  const state = Math.random().toString(36).substring(2, 15)
  req.session.login_csrf = state

  // We store the oauth object in app locals
  // In a real app these should be part of your app config
  let oauth = oauth2.create({
    client: {
      id: clientId,
      secret: clientSecret
    },
    auth: {
      tokenHost: 'http://localhost:4444',
      tokenPath: '/oauth2/token',
      authorizePath: '/oauth2/auth'
    }
  })

  req.app.locals.oauth = oauth

  // Create an authorization code url request
  const authorizationUri = oauth.authorizationCode.authorizeURL({
    redirect_uri: 'http://127.0.0.1:9090/callback',
    scope: 'openid offline',
    state
  })

  res.redirect(authorizationUri)
}

/**
 * Get code to perform authorization exchange
 */
async function callback (req, res) {
  const { code, state } = req.query

  // Token exchange with CSRF handling
  if (state !== req.session.login_csrf) {
    req.session.destroy(function (err) {
      if (err) console.error(err)
      return res.status(500).json('State does not match')
    })
  } else {
    // Flush csrf
    req.session.login_csrf = null

    // Create options for token exchange
    const options = {
      code,
      redirect_uri: 'http://127.0.0.1:9090/callback'
    }

    try {
      // Get tokens
      const oauth = req.app.locals.oauth
      const result = await oauth.authorizationCode.getToken(options)

      // Get the user
      const { sub, preferred_username, picture } = jwt.decode(result.id_token)
      req.session.user = {
        uid: sub,
        username: preferred_username,
        picture
      }

      // Save the auth token in memory, ideally it should be
      // in a database
      if (!req.app.locals.tokens) req.app.locals.tokens = {}
      req.app.locals.tokens[sub] = result.access_token
      console.log(req.app.locals.tokens)

      res.redirect('/user')
    } catch (error) {
      console.error(error)
      return res.status(500).json('Authentication failed')
    }
  }
}

/**
 * Render the user page
 */
async function user (req, res) {
  const { uid, username, picture } = req.session.user
  const token = req.app.locals.tokens[uid]

  let { places } = await fetch(
    'http://localhost:8989/api/places', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .catch(err => {
      res.status(500).send('Could not fetch user data')
    })

  console.log(places)

  return res.render('user', {
    uid, username, picture, places
  })
}

/** 
 * Routes
 */
app.get('/', (req, res) => res.render('index'))
app.post('/auth', bodyParser.urlencoded({ extended: false }), authorizationFlow)
app.get('/callback', callback)
app.get('/user', user)

/**
 * Error handler
 */
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  console.error('error', err)
  res.send(err)
})

const PORT = process.env.PORT || 9090
app.listen(PORT, () => {
  console.log(`Starting server on port ${PORT}`)
})