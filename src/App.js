import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Constants from './Constants';
import Player from './../node_modules/midi-player-js';
import Mario from './mario-midi.js';

class App extends Component {
  constructor() {
    super();
    var MidiPlayer = new Player.Player()
    MidiPlayer.loadDataUri(Mario);
    console.log(MidiPlayer.events);
    this.midiEvents = MidiPlayer.events[3];
    this.beat_pixel_length = 10;
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

class Piano extends Component {
  render() {
    var rows = Constants.NOTES.map(function(note, midiNumber) {
      return <PianoRow key={midiNumber} noteName={note} isBlackKey={true} />;
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
      <div className="PianoRow">
        {this.props.noteName}
      </div>
    );
  }
}

class Roll extends Component {
  render() {
    var rows = [];

    Constants.NOTES.forEach(function(note, midiNumber) {
      rows.push(<Row key={midiNumber} midiNumber={midiNumber} midiEvents={this.props.midiEvents} commonValues={this.props.commonValues} />);
    }.bind(this));

    return (
      <div className="Roll">
        {rows}
      </div>
    );
  }
}

class Row extends Component {
  render() {
    var midiEvents = this.props.midiEvents.filter(function(event) {
      if (event.noteNumber === this.props.midiNumber) return true;
      return false;
    }.bind(this));

    var squares = midiEvents.map(function(event, index) {
      if (event.name === 'Note on') {
        return <Square key={index} width="20" left={event.tick * this.props.commonValues.tickPixelLength} />
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
