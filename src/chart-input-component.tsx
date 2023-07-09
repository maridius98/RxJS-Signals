import React, { useEffect, useRef, useState } from 'react';
import { Signal } from './signal';
import { formulaParser } from "./parser";
import { Observable, tap } from 'rxjs';
import { createRealTimeLineChart, point } from './diagram';

const ChartWithInputs = () => {
  const graphRef = useRef(null);
  const chart = createRealTimeLineChart(graphRef.current);
  const signal = new Signal();

  const [formula, setFormula] = useState('');
  const [intervalValue, setIntervalValue] = useState(1);
  const [isPaused, setIsPaused] = useState(true);
  const [filterValue, setFilterValue] = useState(-0.4);
  const [samplesValue, setLengthValue] = useState(3000);
  const [showVertex, setShowVertex] = useState(false);
  const [mergeFunctions, setMergeFunctions] = useState(false);

  const handleFormula1Change = (event: any) => {
    event.preventDefault();
    setFormula(event.target.value);
  };

  const handleIntervalChange = (event: any) => {
    event.preventDefault();
    setIntervalValue(Number(event.target.value));
  };

  const handlePauseToggle = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  };

  const handleFilterChange = (event: any) => {
    setFilterValue(Number(event.target.value));
  };

  const handleSamplesChange = (event: any) => {
    setLengthValue(Number(event.target.value));
  };

  const handleShowVertexToggle = () => {
    setShowVertex((prevShowVertex) => !prevShowVertex);
  };

  const handleMergeFunctionsToggle = () => {
    setMergeFunctions((prevMergeFunctions) => !prevMergeFunctions);
  };

  const drawChart = (signal: Observable<point>, index: number) => {
    signal.subscribe(point => {
      chart.updateChart(point, index+1)
    })
  }

  const handleSubmit = (event: any) => {
    event.preventDefault();
    chart.resetChart();
    formulaParser.clear();
    formulaParser.evaluate(`f1(t) = ` + formula);
    signal.emitSignal(100, 1);
    signal.appendOperators([tap(p => console.log(p.x))]);

    drawChart(signal.emittedSignal, 1);
    setIsPaused(() => false);
};

  // useEffect(() => {
  //     if (isPaused){
  //       signal.pause();
  //     } else {
  //       signal.resume();
  //     }
  // }, [isPaused]);

  // useEffect(() => {
  //     signal.changeInterval(intervalValue);
  // }, [intervalValue]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
          <div className="label-input">
            <label htmlFor="formula1">Formula 1:</label>
            <input
              type="text"
              id="formula1"
              value={formula}
              onChange={handleFormula1Change}
            />
          </div>

          <div className="label-input">
            <label htmlFor="interval">Interval:</label>
            <input
              type="range"
              min="1"
              max="100"
              id="interval"
              value={intervalValue}
              onChange={handleIntervalChange}
            />
          </div>
          <div className="label-input">
            <label htmlFor="filter">Filter:</label>
            <input
              type="range"
              id="filter"
              min="-10"
              max="10" 
              value={filterValue}
              onChange={handleFilterChange}
            />
          </div>
          <div className="label-input">
            <label htmlFor="samples">Samples:</label>
            <input
              type="range"
              id="samples"
              min="10"
              max="5000"
              value={samplesValue}
              onChange={handleSamplesChange}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={showVertex}
                onChange={handleShowVertexToggle}
              />
              Show Vertex
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={mergeFunctions}
                onChange={handleMergeFunctionsToggle}
              />
              Merge Functions
            </label>
          </div>
          <button type="button" onClick={handlePauseToggle}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button type="submit">Parse Signal</button>
        </form>

      <div id="graph" ref={graphRef}></div>
    </div>
  );
};

function HomePage() {
  return (
    <div className="App">
      <ChartWithInputs />
    </div>
  );
}

export default HomePage;
