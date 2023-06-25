import { updateChart } from "./diagram";
import { emittedSignal } from "./signals";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

emittedSignal.subscribe((point) => {
  updateChart(point);
});

ReactDOM.render(<App />, document.getElementById('root'));
