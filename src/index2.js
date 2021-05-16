import React from './react/react';
import ReactDOM from './react/react-dom';

// 类组件
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
        <h3>{this.state.number}</h3>
        <button onClick={this.onClick}>加1</button>
      </div>
    );
  }
}

// 函数组件
function FunctionCounter() {
  return <h3>Count:0</h3>;
}

ReactDOM.render(<FunctionCounter />, document.getElementById('root'));

window.reRender2.remove();
window.reRender3.remove();
