import React, { Component } from 'react';
import './css/App.css';
import Constants from './Constants';
import Mario from './midi/mario-midi.js';
//import Buns from './midi/hot-cross-buns-midi.js';
import Player from 'midi-player-js';

class App extends Component {
  constructor() {
    super();
    // How wide in pixels a single beat should be.
    this.beat_pixel_length = 20;

    // Initialize MIDI parser/player
    this.midiPlayer = new Player.Player((event) => {
      this.handleMidiEvent(event);
    });

    this.midiPlayer.on('playing', function(tick) {
      if (true || tick.tick % 20 === 0) {
        //console.log(tick)
        this.handlePlayTick(tick.tick);
      }
    }.bind(this));

    this.midiPlayer.loadDataUri(Mario);
    //this.midiPlayer.play();

    this.state = {
                  error:            null,
                  selectedTrack:    0,
                  currentTick:      0,
                  midiEvents:       this.midiPlayer.events[0],
                  tickPixelLength:  this.beat_pixel_length / this.midiPlayer.division,
                  activeNoteNumbers: [],
                  };

    this.settingState = false;

    // Bind methods to this
    this.handleTrackChange = this.handleTrackChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handlePlayTick = this.handlePlayTick.bind(this);
  }

  play = () => {
    this.midiPlayer.play();
  }

  handleTrackChange(event) {
    this.setState({
                    selectedTrack:  event.target.value,
                    midiEvents:     this.midiPlayer.events[event.target.value]
                  });
  }

  handleFileChange(event) {
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

    reader.readAsArrayBuffer(event.target.files[0]);
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

  handleMidiEvent = (event) => {
    if (event.name === 'Note on') {
      const activeNoteNumbers = [...this.state.activeNoteNumbers];
      activeNoteNumbers.push(event.noteNumber);
      this.setState({activeNoteNumbers});
    }
  }

  render() {
    var options = this.midiPlayer.tracks.map((element, index) => <option key={index}>{index}</option>);
    var rows = [];

    Constants.NOTES.forEach(function(noteObject) {
      rows.push(<Row key={noteObject.midiNumber} midiNumber={noteObject.midiNumber} midiEvents={this.state.midiEvents} appState={this.state} />);
    }.bind(this));

    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to React Piano Roll</h2>
          <div>
            <input type="file" onChange={this.handleFileChange} />
            {this.state.error &&
              <p>{this.state.error}</p>
            }
          </div>
          <p>
            <label>Select Track</label>
            <select onChange={this.handleTrackChange} style={{"color": "#000"}}>{options}</select>
          </p>
          <p><button onClick={this.play}>Play</button></p>
        </div>
        <Piano activeNoteNumbers={this.state.activeNoteNumbers} />
        <div className="Roll">
          <div className="beat-lines"></div>
          {rows}
          {/*<div className="Playhead" style={{transform: 'translate(' + this.state.currentTick * this.state.tickPixelLength + 'px)'}}></div>*/}

          <Playhead currentTick={this.state.currentTick} tickPixelLength={this.state.tickPixelLength} />
        </div>
      </div>
    );
  }
}

class Piano extends Component {
  render() {
    const rows = Constants.NOTES.map(noteObject => {
      return <PianoRow key={noteObject.midiNumber} midiNumber={noteObject.midiNumber} noteName={noteObject.noteName} active={this.props.activeNoteNumbers.indexOf(noteObject.midiNumber) >= 0} />;
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
        {this.props.noteName} {this.props.active ? 'YES':''}
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

class Playhead extends Component {
  render() {
    return <div className="Playhead" style={{transform: 'translate(' + this.props.currentTick * this.props.tickPixelLength + 'px)'}}></div>
  }
}

export default App;
