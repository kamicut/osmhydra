const jwt = require('jsonwebtoken')
const oauth2 = require('simple-oauth2')
const fs = require('fs')

/**
 * Get code to perform authorization exchange
 */
module.exports = async (req, res) => {
  const { code, state } = req.query
  console.log("code", code)

  /**
   * Token exchange with CSRF handling
   */
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
      redirect_uri: 'http://127.0.0.1:3000/callback'
    }

    try {
      // Get the client / secret pair from file
      const creds = JSON.parse(fs.readFileSync('.creds'))
      console.log("creds", creds)

      // Get tokens
      const result = await oauth2.create({
        client: creds,
        auth: {
          tokenHost: 'http://127.0.0.1:4444',
          tokenPath: '/oauth2/token',
          authorizePath: '/oauth2/auth'
        }
      }).authorizationCode.getToken(options)

      // Get the user
      const { sub } = jwt.decode(result.id_token)

      // Login and redirect
      req.login({ id: sub}, (err) => {
        if (err) throw new Error('Could not authenticate')
        else res.redirect('/user')
      })

    } catch (error) {
      console.error(error)
      return res.status(500).json('Authentication failed')
    }
  }
}