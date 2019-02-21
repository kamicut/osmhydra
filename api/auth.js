

const passport = require('passport-light')
const hydra = require('./hydra')
const url = require('url')
const OSMStrategy = require('passport-openstreetmap').Strategy

const { serverRuntimeConfig, publicRuntimeConfig } = require('../next.config')

// ensure a user is logged in (middleware)
function ensureLogin () {
  return function (req, res, next) {
    if (req.session && !req.session.user) {
      req.session.returnTo = req.raw ? (req.raw.originalURL || req.raw.url) : '/'
      return res.redirect('/')
    }
    next()
  }
}

function ensureAuth () {
  return function (req, res, next) {
    if (req.session && !req.session.user) {
      return res.boom.unauthorized
    }
    next()
  }
}

// get an authentication token pair from openstreetmap
function openstreetmap (req, res) {
  const query = url.parse(req.url, true).query
  const challenge = query.login_challenge

  const strategy = new OSMStrategy({
    requestTokenURL: 'https://www.openstreetmap.org/oauth/request_token',
    accessTokenURL: 'https://www.openstreetmap.org/oauth/access_token',
    userAuthorizationURL: 'https://www.openstreetmap.org/oauth/authorize',
    consumerKey: serverRuntimeConfig.OSM_CONSUMER_KEY,
    consumerSecret: serverRuntimeConfig.OSM_CONSUMER_SECRET,
    callbackURL: `${publicRuntimeConfig.APP_URL}/auth/openstreetmap/callback?login_challenge=${encodeURIComponent(challenge)}`
  }, async (token, tokenSecret, profile, done) => {
    done(null, profile)
  })

  passport.authenticate(strategy, {
    req: req,
    redirect: function (url, status) { res.redirect(url) },
    success: function (user) {
      req.session.user = user

      console.log('challenge from callback', challenge)
      
      if (challenge) {
        hydra.acceptLoginRequest(challenge, {
          subject: user.displayName,
          remember: true,
          remember_for: 9999
        }).then(response => {
          if (response.redirect_to) {
            return res.redirect(response.redirect_to)
          } else {
            return res.redirect('/')
          }
        }).catch(e => {
          console.error(e)
          return res.redirect('/')
        })
      } else {
        return res.redirect('/')
      }

    },
    pass: function () { res.sendStatus(401) },
    fail: function (challenge, status) { res.status(status).send(challenge) },
    error: function (err) { res.status(500).send(err) }
  })
}

module.exports = {
  openstreetmap,
  ensureLogin,
  ensureAuth
}