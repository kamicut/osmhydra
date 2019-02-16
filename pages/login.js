import Button from '../components/button'

class Login {
  static async getInitialProps({ query }) {
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
        {
          this.props.user
            ? (
              <div>
                <p className="measure-copy">You've never logged into this application</p>
                <br />
                <Button href="/auth/openstreetmap">Login with OSM</Button>
              </div>)
            : <Button href="/auth/logout">Logout</Button>
        }
      </section>
    )

  }
}

export default Login