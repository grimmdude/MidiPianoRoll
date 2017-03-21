import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Constants from './Constants';
import Player from './../node_modules/midi-player-js';
import Mario from './mario-midi.js';
import Buns from './hot-cross-buns-midi.js';

class App extends Component {
  constructor() {
    super();
    var MidiPlayer = new Player.Player()
    MidiPlayer.loadDataUri(Mario);
    //console.log(MidiPlayer.events);
    this.midiEvents = MidiPlayer.events[6];
    this.beat_pixel_length = 20;
    this.beat_division =  MidiPlayer.division;
    this.tick_pixel_length = this.beat_pixel_length / this.beat_division;
    //console.log(Constants)
    this.commonValues = {
      "tickPixelLength" : this.beat_pixel_length / this.beat_division
    };
  }

  render() {

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React Piano Roll</h2>
        </div>
        <Piano />
        <Roll midiEvents={this.midiEvents} commonValues={this.commonValues} />
      </div>
    );
  }
}

class Playhead extends Component {
  render() {
    return (
      <div className="Playhead"></div>
    );
  }
}

class Ruler extends Component {
  render() {
    // How many beat markers to render?
    var beatMarkers = [];

    for (var i = 1; i <= 2000; i++) {
       beatMarkers.push(<li key={i.toString()}></li>);
    }

    return (
     <ul className="ruler">{beatMarkers}</ul>
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
        {rows}
        <Playhead />
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
        if (event.velocity > 0) {
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

export default App;
