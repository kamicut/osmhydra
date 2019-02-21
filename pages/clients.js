import React, { Component } from 'react'

function newClient ({ client_id, client_name, client_secret}) {
  return <ul>
    <li><label>client_id: </label>{client_id}</li>
    <li><label>client_name: </label>{client_name}</li>
    <li><label>client_secret: </label>{client_secret}</li>
  </ul>

}

class Clients extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined,
      redirectURI: '',
      clientName: '',
      redirectURI: '',
      newClient: null
    }

    this.getClients = this.getClients.bind(this)
    this.createClient = this.createClient.bind(this)
    this.deleteClient = this.deleteClient.bind(this)
    this.refreshClients = this.refreshClients.bind(this)
    this.handleClientNameChange = this.handleClientNameChange.bind(this)
    this.handleClientCallbackChange = this.handleClientCallbackChange.bind(this)
  }

  async getClients () {
    let res = await fetch('/api/clients')
    if (res.status == 200) {
      return await res.json()
    }
    else {
      throw new Error('Could not retrieve clients')
    }
  }

  async createClient(e) {
    e.preventDefault()
    let res = await fetch('/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        client_name: this.state.clientName,
        redirect_uris: [this.state.redirectURI]
      }),
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    let newClient = {}
    if (res.status == 200) {
      newClient = await res.json()
    }
    else {
      throw new Error('Could not create new client')
    }

    this.setState({ newClient: newClient.client, clientName: '' })
    await this.refreshClients()
  }

  async deleteClient(id) {
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    await this.refreshClients()
  }

  handleClientNameChange (e) {
    this.setState({
      clientName: e.target.value
    })
  }
  
  handleClientCallbackChange (e) {
    this.setState({
      redirectURI: e.target.value
    })
  }

  async refreshClients() {
    try {
      let { clients } = await this.getClients()
      this.setState({
        clients,
        loading: false
      })
    } catch (e) {
      this.setState({
        error: e,
        loading: false
      })
    }
  }

  componentDidMount () {
    this.refreshClients()
  }

  render () {
    if (this.state.loading) return <div>Loading...</div>
    if (this.state.error) return <div> {this.state.error} </div>

    let clients = this.state.clients
    let clientSection = <p className="measure-copy">No clients created</p>
    if (clients.length > 0) {
      clientSection = (<ul>
        {
          clients.map(client => {
            return (
              <li key={client.client_id}>
                <span>{client.client_id}</span>
                <button onClick={() => this.deleteClient(client.client_id)}>x</button>
              </li>
            )
          })
        }
      </ul>)
    }

    return (
      <div>
        <section className="mb4">
          <h1>Your OAuth2 Clients</h1>
          {
            clientSection
          }
        </section>
        {
          this.state.newClient ? 
          <section className="bg-color-teal">
            <h2>Newly created client</h2>
            {newClient(this.state.newClient)}
          </section>
          : <div />
        }
        <section>
          <h2>Add a new client</h2>
          <form onSubmit={this.createClient} className="mw6">
            <label>Name: </label>
            <input className="mt2 mb3 w-100 dib" type="text" 
              placeholder="My app"
              onChange={this.handleClientNameChange}
            />
            <label>Callback URL: </label>
            <input className="mt2 mb3 w-100 dib" type="text" 
              placeholder="https://myapp/callback"
              onChange={this.handleClientCallbackChange}
            />
            <br />
            <br />
            <input type="submit" value="Create"/>
          </form>
        </section>
      </div>
    )
  }
}
export default Clients