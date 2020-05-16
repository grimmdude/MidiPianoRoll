import React, { PureComponent } from 'react';
import Square from './Square';

class Row extends PureComponent {

  render() {
    // Grab MIDI events for this particular row
    const midiEvents = this.props.midiEvents.filter(function(event) {
      if (event.noteNumber === this.props.midiNumber) return true;
      return false;
    }.bind(this));

    const squares = midiEvents.map(function(event, index) {
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

export default Row;