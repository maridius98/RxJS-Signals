import { chart, point } from "./diagram";
import { Signal, signal1, signal2 } from "./signal";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import { Observable } from "rxjs";

ReactDOM.render(<App />, document.getElementById('root'));

export const drawChart = (signals: Observable<point>[]) => {
  signals.forEach((p, index) => {
    p.subscribe((point) => {
      chart.updateChart(point, index+1)
    })
  })
}


