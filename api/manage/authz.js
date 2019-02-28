const jwt = require('jsonwebtoken')
const db = require('../db')
const hydra = require('../lib/hydra')

/**
 * Returns true if a jwt is still valid
 * 
 * @param {jwt} decoded the decoded jwt token
 */
function assertAlive (decoded) {
  const now = Date.now().valueOf() / 1000
  if (typeof decoded.exp !== 'undefined' && decoded.exp < now) {
    return false
  }
  if (typeof decoded.nbf !== 'undefined' && decoded.nbf > now) {
    return false
  }
  return true
}

/**
 * Attaches the user from the jwt to the session
 */
function attachUser () {
  return function (req, res, next) {
    if (req.session) {
      if (req.session.idToken) {
        // We have an id_token, let's check if it's still valid
        const decoded = jwt.decode(req.session.idToken)
        if (assertAlive(decoded)) {
          req.session.user_id = decoded.sub
          req.session.user = decoded.preferred_username
          req.session.user_picture = decoded.picture
          return next()
        } else {
          // no longer alive, let's flush the session
          req.session.destroy(function (err) {
            if (err) next(err)
            return next()
          })
        }
      }
    }
    next()
  }
}

/**
 * Protected routes first check the session for the user,
 * Get the associated accessToken from the database, and check for 
 * the accessToken validity with hydra
 */
function protected() {
  return async function (req, res, next) {
    if (!req.session || !req.session.user) {
      return res.status(401).send('Access denied')
    }

    // We have a user
    else {
      try {

        let conn = await db()
        let [userTokens] = await conn('users').where('id', req.session.user_id)
        let result = await hydra.introspect(JSON.parse(userTokens.manageToken).access_token)
        if (result && result.active) {
          return next()
        }
        else {
          // Delete this accessToken ? 
          return res.status(401).send('Access denied')
        }
      } catch (err) {
        next(err)
      }
    }
  }
}

module.exports = {
  attachUser,
  protected
}