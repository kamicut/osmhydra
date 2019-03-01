const router = require('express-promise-router')()
const bodyParser = require('body-parser')

const { getLogin } = require('./login')
const { getConsent, postConsent} = require('./consent')
const { openstreetmap } = require('../lib/osm')

/**
 * The oauthRouter handles the oauth flow and displaying login and 
 * consent dialogs
 * 
 * @param {Object} nextApp the NextJS Server
 */
function oauthRouter (nextApp) {
  /**
   * Redirecting to openstreetmp
   */
  router.get('/openstreetmap', openstreetmap)
  router.get('/openstreetmap/callback', openstreetmap)

  /**
   * Consent & Login dialogs
   */
  router.get('/login', getLogin(nextApp))
  router.get('/consent', getConsent(nextApp))
  router.post('/consent',
    bodyParser.urlencoded({ extended: false }),
    postConsent(nextApp))

  return router
}

module.exports = oauthRouter
