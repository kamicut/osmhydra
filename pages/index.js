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
                <Button href="/manage/logout">Logout</Button>
                <div className="mt4">
                  <a href='/clients'>Your OAuth2 clients</a>
                </div>
              </div>
            )
            : <Button href="/manage/login">Sign in →</Button>
        }
      </section>
    )
  }
}

export default Home