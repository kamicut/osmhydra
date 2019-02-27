/**
 * Consent provider
 */

const hydra = require('../lib/hydra')
const url = require('url')
const { serverRuntimeConfig } = require('../../next.config')

function getConsent (app) {
  return async (req, res, next) => {
    const query = url.parse(req.url, true).query
    const challenge = query.consent_challenge

    try {
      let consent = await hydra.getConsentRequest(challenge) // Check for challenge success
      // We can skip if skip is set to yes or if the requesting app is the management UI
      if (consent.skip || consent.client.client_id === serverRuntimeConfig.OSM_HYDRA_ID) { 
        let accept = await hydra.acceptConsentRequest(challenge, {
          grant_scope: consent.requested_scope,
          grant_access_token_audience: consent.requested_access_token_audience,
          session: {}
        })

        res.redirect(accept.redirect_to)
      } else {
        app.render(req, res, '/consent', {
          challenge: challenge,
          requested_scope: consent.requested_scope,
          user: consent.subject,
          client: consent.client
        })
      }
    } catch (e) {
      next(e)
    }
  }
}

/**
 * Process the reply of the user, whether they
 * consent the client to access their information
 */
function postConsent (app) {
  return async (req, res, next) => {
    const challenge = req.body.challenge
    if (req.body.submit === 'Deny access') {
      try {
        let reject = await hydra.rejectConsentRequest(challenge, {
          error: 'access_denied',
          error_description: 'The resource owner denied the request'
        })
        res.redirect(reject.redirect_to)
      } catch (e) {
        next(e)
      }
    } else {
      let grant_scope = req.body.grant_scope
      if (!Array.isArray(grant_scope)) {
        grant_scope = [grant_scope]
      }

      try {
        const consent = await hydra.getConsentRequest(challenge)
        let accept = await hydra.acceptConsentRequest(challenge, {
          grant_scope,
          session: {},
          grant_access_token_audience: consent.requested_access_token_audience,
          remember: Boolean(req.body.remember),
          remember_for: 3600
        })
        res.redirect(accept.redirect_to)
      } catch (e) {
        console.error(e)
        next(e)
      }
    }
  }
}

module.exports = {
  getConsent,
  postConsent
}