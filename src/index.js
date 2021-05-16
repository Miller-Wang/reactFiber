import React from './react/react';
import ReactDOM from './react/react-dom';

class ClassCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }
  onClick = () => {
    this.setState(state => ({ number: state.number + 1 }));
  };
  render() {
    return (
      <div id="counter">
        <span>{this.state.number}</span>
        <button onClick={this.onClick}>加1</button>
      </div>
    );
  }
}

window.reRender2.remove();
window.reRender3.remove();

ReactDOM.render(<ClassCounter />, document.getElementById('root'));
