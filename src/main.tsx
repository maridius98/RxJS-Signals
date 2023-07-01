import { chart } from "./diagram";
import { Signal, signal1, signal2 } from "./signal";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

ReactDOM.render(<App />, document.getElementById('root'));

export const drawChart = () => {
  signal1.onEmittedSignalDefined((emittedSignal) => {
    emittedSignal.subscribe((point) => {
      chart.updateChart(point, 1);
    });
  });
  signal2.onEmittedSignalDefined((emittedSignal) => {
    emittedSignal.subscribe((point) => {
      chart.updateChart(point, 2);
    });
  });
}


