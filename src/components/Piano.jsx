import React, { PureComponent } from 'react';
import Constants from '../Constants';
import PianoRow from './PianoRow';

class Piano extends PureComponent {
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

export default Piano;