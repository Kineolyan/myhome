import React from 'react';
import {connect} from 'react-redux';

/*
 * Which injected props should be calculated
 * from the application state and how?
 */
const mapStateToProps = (state) => {
  return {
    value: state
  };
}

/*
 * Which injected props should be callbacks
 * that dispatch actions, and which actions?
 */
const mapDispatchToProps = (dispatch) => {
  return {
    onIncrement: () => {
      dispatch({
        type: 'INCREMENT_ASYNC'
      })
    },
    onDecrement: () => {
      dispatch({
        type: 'DECREMENT_ASYNC'
      })
    },
    onIncrementOdd: () => {
      dispatch({
        type: 'INCREMENT_IF_ODD'
      })
    }
  };
};

/*
 * What does UI look like, assuming it doesn't know
 * about the state or actions, and is a function
 * of the props?
 */
const Counter = ({
  value,
  onIncrement,
  onDecrement,
  onIncrementOdd
}) => (
  <div>
    <h1>{value}</h1>
    <button onClick={onIncrement}>+</button>
    <button onClick={onDecrement}>-</button>
    <button onClick={onIncrementOdd}>odd +</button>
  </div>
);

const CounterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Counter);

export default CounterContainer;