import React, { Component } from 'react'

class Consent extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        user: query.user,
        client: query.client,
        challenge: query.challenge,
        requested_scope: query.requested_scope
      }
    }
  }

  render() {
    const { user, client, requested_scope, challenge } = this.props

    if (!client) return <div>
      Invalid parameters, go back <a href="/">home</a>?
    </div>

    const clientDisplayName = client.client_name || client.client_id 
    return (
      <section>
        <form method="post">
          <input type="hidden" value={challenge} name="challenge" />
          <p>
            Hi, {user}, <strong>{clientDisplayName}</strong> wants to access resources on your behalf and to:
          </p>
          {
            requested_scope.map(scope => {
              return <div key={scope}>
                <input type="checkbox" id={scope} value={scope} name="grant_scope" />
                <label htmlFor={scope}>{scope}</label>
                <br />
              </div>
            })
          }
          <p>
            Do you want to be asked next time when this application wants to access your data? The application will not be able to ask for more permissions without your consent.
          </p>
          <ul>
            {client.client_policy ? <li><a href={client.client_policy}>Policy</a></li> : <div />}
            {client.tos_uri ? <li><a href={client.tos_uri}>Terms of Service</a></li> : <div />}
          </ul>
          <p>
            <input type="checkbox" id="remember" name="remember" value="1" />
            <label htmlFor="remember">Do not ask me again</label>
          </p>
          <p>
            <input type="submit" name="submit" value="Allow access" />
            <input type="submit" name="submit" value="Deny access" />
          </p>
        </form>
      </section>
    )
  }
}

export default Consent