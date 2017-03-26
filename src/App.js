import React, { Component } from 'react';
import './App.css';
import Constants from './Constants';
import Player from './../node_modules/midi-player-js';
import Mario from './mario-midi.js';
import Buns from './hot-cross-buns-midi.js';

class App extends Component {
  constructor() {
    super();
    this.state = {
                  selectedTrack: 0,
                  currentTick: 0
                  };
    this.midiPlayer = new Player.Player();
    this.midiPlayer.loadDataUri(Mario);
    this.midiPlayer.on('playing', function(tick) {
      this.handlePlayTick(tick.tick);

    }.bind(this));
    //this.midiPlayer.play();
    this.midiEvents = this.midiPlayer.events[this.state.selectedTrack];
    this.beat_pixel_length = 20;
    this.tick_pixel_length = this.beat_pixel_length / this.midiPlayer.division;
    this.commonValues = {
      "tickPixelLength" : this.beat_pixel_length / this.midiPlayer.division
    };
    this.handleTrackChange = this.handleTrackChange.bind(this);
    this.handlePlayTick = this.handlePlayTick.bind(this);
  }

  handleTrackChange(selectedTrack) {
    this.setState({selectedTrack: selectedTrack});
    this.setState({currentTick:this.state.currentTick+10});
    this.midiEvents = this.midiPlayer.events[selectedTrack];
  }

  handlePlayTick(tick) {
    console.log(tick)
    this.setState({currentTick:tick});
  }

  render() {

    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to React Piano Roll</h2>
          <SelectTrack midiPlayer={this.midiPlayer} onTrackChange={this.handleTrackChange} />
        </div>
        <Piano />
        <Roll midiEvents={this.midiEvents} commonValues={this.commonValues} appState={this.state} />
      </div>
    );
  }
}

class Playhead extends Component {
  render() {
    return (
      <div className="Playhead" style={{left:this.props.appState.currentTick}}></div>
    );
  }
}

class Piano extends Component {
  render() {
    const rows = Constants.NOTES.map(noteObject => {
      return <PianoRow key={noteObject.midiNumber} midiNumber={noteObject.midiNumber} noteName={noteObject.noteName} />;
    });

    return (
      <div className="Piano">
        {rows}
      </div>
    );
  }
}

class PianoRow extends Component {
  render() {
    return (
      <div className="PianoRow" data-midi-number={this.props.midiNumber}>
        {this.props.noteName}
      </div>
    );
  }
}

class Roll extends Component {
  render() {
    var rows = [];

    Constants.NOTES.forEach(function(noteObject) {
      rows.push(<Row key={noteObject.midiNumber} midiNumber={noteObject.midiNumber} midiEvents={this.props.midiEvents} commonValues={this.props.commonValues} />);
    }.bind(this));

    return (
      <div className="Roll">
        <div className="beat-lines"></div>
        {rows}
        <Playhead appState={this.props.appState} />
      </div>
    );
  }
}

class Row extends Component {

  render() {
    // Grab MIDI events for this particular row
    var midiEvents = this.props.midiEvents.filter(function(event) {
      if (event.noteNumber === this.props.midiNumber) return true;
      return false;
    }.bind(this));


    /** 
    * Process of building squares:
    * Mark the start of a note, but
    *
    */

    var squares = midiEvents.map(function(event, index) {
      if (event.name === 'Note on') {
        // The next event should either be a "Note on" with 0 velocity (running status), or a "Note off".
        if (event.velocity > 0 && midiEvents[index + 1]) {
            let width = midiEvents[index + 1].delta;
            return <Square key={index} width={width * this.props.commonValues.tickPixelLength} left={event.tick * this.props.commonValues.tickPixelLength} />
        }

        return null;
      }
    }.bind(this));

    return (
      <div className="Row">
        {squares}
      </div>
    );
  }
}

// Each Square represents a note on and note off event.
class Square extends Component {
  render() {
    return (
      <div className="Square" style={{"width" : this.props.width   + "px", "left" : this.props.left   + "px"}}></div>
    );
  }
}

class SelectTrack extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onTrackChange(event.target.value);
  }

  render() {
    var options = this.props.midiPlayer.tracks.map((element, index) => <option key={index}>{index}</option>);

    return (
      <p><label>Select Track</label><select onChange={this.handleChange} style={{"color" : "black"}}>{options}</select></p>
    );
  }
}

export default App;
