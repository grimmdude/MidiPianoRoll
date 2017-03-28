import React, { Component } from 'react';
import './css/App.css';
import Constants from './Constants';
import Player from './../node_modules/midi-player-js';
import Mario from './midi/mario-midi.js';
//import Buns from './midi/hot-cross-buns-midi.js';

class App extends Component {
  constructor() {
    super();
    // How wide in pixels a single beat should be.
    this.beat_pixel_length = 20;

    // Initialize MIDI parser/player
    this.midiPlayer = new Player.Player();
    this.midiPlayer.on('playing', function(tick) {
      this.handlePlayTick(tick.tick);

    }.bind(this));
    this.midiPlayer.loadDataUri(Mario);

    //this.midiPlayer.play();

    this.state = {
                  error:            null,
                  selectedTrack:    0,
                  currentTick:      0,
                  midiEvents:       this.midiPlayer.events[0],
                  tickPixelLength:  this.beat_pixel_length / this.midiPlayer.division
                  };

    this.settingState = false;

    // Bind methods to this
    this.handleTrackChange = this.handleTrackChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handlePlayTick = this.handlePlayTick.bind(this);
  }

  handleTrackChange(selectedTrack) {
    this.setState({
                    selectedTrack:  selectedTrack,
                    midiEvents:     this.midiPlayer.events[selectedTrack],
                    currentTick:    this.state.currentTick + 10
                  });
  }

  handleFileChange(file) {
    var reader  = new FileReader();

    reader.onload = function(e) {
      try {
        this.midiPlayer.loadArrayBuffer(e.target.result);
        this.setState({
                        error:            null, 
                        midiEvents:       this.midiPlayer.events[0],
                        tickPixelLength:  this.beat_pixel_length / this.midiPlayer.division
                      });

      } catch(e) {
        this.setState({error: e});
      }
      
    }.bind(this);

    reader.readAsArrayBuffer(file);
  }

  handlePlayTick(tick) {
    //console.log(tick)
    if (!this.settingState) {
      this.settingState = true;
      this.setState({currentTick: tick}, function() {
        this.settingState = false;
      }.bind(this));
    }
  }

  render() {

    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to React Piano Roll</h2>
          <ChooseFile onFileChange={this.handleFileChange} appState={this.state} />
          <SelectTrack midiPlayer={this.midiPlayer} onTrackChange={this.handleTrackChange} />
        </div>
        <Piano />
        <Roll appState={this.state} />
      </div>
    );
  }
}

class Playhead extends Component {
  render() {
    return (
      <div className="Playhead" style={{left: this.props.appState.currentTick}}></div>
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
      rows.push(<Row key={noteObject.midiNumber} midiNumber={noteObject.midiNumber} midiEvents={this.props.appState.midiEvents} appState={this.props.appState} />);
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

    var squares = midiEvents.map(function(event, index) {
      if (event.name === 'Note on') {
        // The next event should either be a "Note on" with 0 velocity (running status), or a "Note off".
        if (event.velocity > 0 && midiEvents[index + 1]) {
            let width = midiEvents[index + 1].delta;
            return <Square key={index} width={width * this.props.appState.tickPixelLength} left={event.tick * this.props.appState.tickPixelLength} />
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
      <div className="Square" style={{"width": this.props.width   + "px", "left": this.props.left   + "px"}}></div>
    );
  }
}

class ChooseFile extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onFileChange(event.target.files[0]);
  }

  render() {
    return (
      <div>
        <input type="file" onChange={this.handleChange} />
        {this.props.appState.error &&
          <p>{this.props.appState.error}</p>
        }
      </div>
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
      <p><label>Select Track</label><select onChange={this.handleChange} style={{"color": "#000"}}>{options}</select></p>
    );
  }
}

export default App;
