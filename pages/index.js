import React, { Component } from 'react'
import Button from '../components/button'

class Home extends Component {
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
        <h1>OSM with Hydra</h1>
        <p className="measure-copy">
          The purpose of this application is to demonstrate the ORY/Hydra Oauth2 server using OSM as the login middleware.
        </p>
        {
          this.props.user
            ? (
              <div className="mt4">
                <h2>Welcome, {this.props.user}!</h2>
                <ul className="mt4 mb4">
                  <li><a href='/clients'>Your OAuth2 clients</a></li>
                  <li><a href='/profile'>Your Profile</a></li>
                </ul>
                <Button href="/logout">Logout</Button>
              </div>
            )
            : <Button href="/login">Sign in →</Button>
        }
      </section>
    )
  }
}

export default Home