import Button from '../components/button'
import React, { Component } from 'react'

class Login extends Component {
  static async getInitialProps ({ query }) {
    if (query.user) {
      return {
        user: query.user
      }
    }
  }

  render() {
    return (
      <section>
        <h1>Login Provider</h1>
        <br />
        {
          this.props.user
            ? (
              <div>
                <h2>Welcome, {this.props.user.displayName}!</h2>
                <Button href="/auth/logout">Logout</Button>
              </div>
            )
            : <Button href="/auth/login">Login with OSM</Button>
        }
      </section>
    )
  }
}

export default Login