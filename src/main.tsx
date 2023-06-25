import { chart } from "./diagram";
import { Signal } from "./signal";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

const signal = Signal.getInstance();

ReactDOM.render(<App />, document.getElementById('root'));

export const drawChart = () => {
  signal.onEmittedSignalDefined((emittedSignal) => {
    emittedSignal.subscribe((point) => {
      chart.updateChart(point);
    });
  });
}


