import React from './react/react';
import ReactDOM from './react/react-dom';

// Hooks
function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return { count: state.count + 1 };
    default:
      return state;
  }
}
function FunctionCounter() {
  const [numberState, setNumberState] = React.useState({ number: 0 });
  const [countState, dispatch] = React.useReducer(reducer, { count: 0 });
  return (
    <div>
      <h3 onClick={() => setNumberState(state => ({ number: state.number + 1 }))}>
        useState Count: {numberState.number}
      </h3>
      <hr />
      <h3 onClick={() => dispatch({ type: 'ADD' })}>useReducer Count: {countState.count}</h3>
    </div>
  );
}

ReactDOM.render(<FunctionCounter />, document.getElementById('root'));

window.reRender2.remove();
window.reRender3.remove();
