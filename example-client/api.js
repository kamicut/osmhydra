const oauth2 = require('simple-oauth2')
const fs = require('fs')

/**
 * Generate a random string
 * @param {Number} length 
 */
var generateState = function(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * Take in the client id and secret and get a token
 * 
 */
module.exports = (req, res) => {
  const {clientId, clientSecret} = req.body
  const creds = { id: clientId, secret: clientSecret }

  // We'll write these to disk for now
  // These should not be exposed to the public
  fs.writeFileSync('.creds', JSON.stringify(creds))

  // Store the state param in the session, we need it to
  // make sure the callback is still valid
  let state = generateState(24)
  req.session.login_csrf = state

  // Create an authorization code url request
  const authorizationUri = oauth2.create({
    client: creds,
    auth: {
      tokenHost: 'http://127.0.0.1:4444',
      tokenPath: '/oauth2/token',
      authorizePath: '/oauth2/auth'
    }
  }).authorizationCode.authorizeURL({
    redirect_uri: 'http://127.0.0.1:3000/callback',
    scope: 'openid offline',
    state
  })

  res.redirect(authorizationUri)
}