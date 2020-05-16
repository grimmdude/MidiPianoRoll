import React, { PureComponent } from 'react';

class PianoRow extends PureComponent {
  render() {
    return (
      <div className="PianoRow" data-midi-number={this.props.midiNumber}>
        {this.props.noteName}
      </div>
    );
  }
}

export default PianoRow;