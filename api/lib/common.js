/**
 * Common middleware
 */

/**
 * Test for a session
 */
function ensureLogin () {
  return function (req, res, next) {
    if (req.session && !req.session.user) {
      req.session.returnTo = req.raw ? (req.raw.originalURL || req.raw.url) : '/'
      return res.redirect('/')
    }
    next()
  }
}

/**
 * Test for a session
 */
function ensureAuth () {
  return function (req, res, next) {
    if (req.session && !req.session.user) {
      return res.boom.unauthorized
    }
    next()
  }
}

module.exports = {
  ensureLogin,
  ensureAuth
}