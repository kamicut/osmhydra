import React, { Component} from 'react'
import Button from './button';
import Map from 'pigeon-maps'
import Marker from './marker'

class NewPlaceForm extends Component {
  render () {
    return (
      <div>
        <Map center={[ 38.895, -77.0366]} zoom={10} width={300} height={200}>
          <Marker anchor={[38.895, -77.0366]} payload={1} />
        </Map>
        <Button>Save</Button>
      </div>
    )
  }
}

export default class Places extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isEditing: false
    }

    this.addPlace = this.addPlace.bind(this)
  }

  addPlace () {
    console.log('here')
    this.setState({
      isEditing: true
    })
  }

  savePlace () {

  }

  render() {
    let { places } = this.props
    places = places || []

    return (
      <section>
        <h2 className="mt4">🌎 Your places</h2>
        <p>Add places that you want to keep track of or would like to map!</p>
        <br />
        {
          this.state.isEditing ? <NewPlaceForm /> : <div />
        }
        <Button onClick={this.addPlace}>Add a new place</Button>
      </section>
    )
  }
}