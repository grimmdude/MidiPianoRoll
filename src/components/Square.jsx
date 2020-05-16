import React, { PureComponent } from 'react';

// Each Square represents a note on and note off event.
class Square extends PureComponent {
  render() {
    return (
      <div className="Square" style={{"width": this.props.width   + "px", "left": this.props.left   + "px"}}></div>
    );
  }
}

export default Square;