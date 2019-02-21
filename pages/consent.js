import React, { Component } from 'react'

class Consent extends Component {
  constructor (props) {
    super(props)

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

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

  handleInputChange (event) {
    const value = event.target.value
    const name = event.target.name
    this.setState({
      [name]: value
    })
  }

  async handleSubmit (event) {
    event.preventDefault()
    await fetch('/consent', {
      method: 'POST',
      body: JSON.stringify(Object.assign({
        challenge: this.props.challenge
      }, this.state)),
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  }

  render() {
    const { user, client, requested_scope, challenge } = this.props

    if (!client) return <div>
      Invalid parameters, go back <a href="/">home</a>?
    </div>

    const clientDisplayName = client.client_name || client.client_id 
    return (
      <section>
        <form onSubmit={this.handleSubmit}>
          <input type="hidden" value={challenge} name="challenge" />
          <p>
            Hi, {user}, <strong>{clientDisplayName}</strong> wants to access resources on your behalf and to:
          </p>
          {
            requested_scope.map(scope => {
              return <div key={scope}>
                <input type="checkbox" id={scope} value={scope} name="grant_scope" onChange={this.handleInputChange}/>
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
            <input type="checkbox" id="remember" name="remember" value="1" onChange={this.handleInputChange}/>
            <label htmlFor="remember">Do not ask me again</label>
          </p>
          <p>
            <input type="submit" name="submit" value="Allow access" onChange={this.handleInputChange}/>
            <input type="submit" name="submit" value="Deny access" onChange={this.handleInputChange}/>
          </p>
        </form>
      </section>
    )
  }
}

export default Consent