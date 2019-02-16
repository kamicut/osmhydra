import Button from '../components/button'
import React, { Component } from 'react'

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
        <br />
        {
          this.props.user
            ? (
              <div>
                <h2>Welcome, {this.props.user.displayName}!</h2>
                <Button href="/auth/logout">Logout</Button>
              </div>
            )
            : <Button href="/auth/openstreetmap">Login with OSM</Button>
        }
      </section>
    )
  }
}

export default Home