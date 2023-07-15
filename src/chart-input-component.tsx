import React, { useEffect, useRef, useState } from 'react';
import { Signal } from './signal';
import { formulaParser } from "./parser";
import { Observable, take, tap } from 'rxjs';
import { createRealTimeLineChart, point } from './diagram';

export const ChartWithInputs = () => {
  const graphRef = useRef(null);
  const chartRef = useRef(null);
  const signalRef = useRef<Signal>(null);
  const subscriptionRef = useRef(null);

  const [formula, setFormula] = useState('');
  const [intervalValue, setIntervalValue] = useState(1);
  const [isPaused, setIsPaused] = useState(true);
  const [filterValue, setFilterValue] = useState(-0.4);
  const [samplesValue, setLengthValue] = useState(3000);
  const [mergeFunctions, setMergeFunctions] = useState(false);

  const handleFormula1Change = (event: any) => {
    event.preventDefault();
    setFormula(event.target.value);
  };

  const handleIntervalChange = (event: any) => {
    
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

  const handleMergeFunctionsToggle = () => {
    setMergeFunctions((prevMergeFunctions) => !prevMergeFunctions);
  };

  const renderChart = (signal: Observable<point>, index: number, chart: any) => {
    subscriptionRef.current = signal.subscribe(point => {
      chart.updateChart(point, index+1)
    })
  }

  const appendOperators = () => {
    signalRef.current.appendOperators([take(samplesValue)]);
  }

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (!chartRef.current){ 
      chartRef.current = createRealTimeLineChart(graphRef.current);
    }
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    
    signalRef.current = new Signal();
    chartRef.current.resetChart();
    formulaParser.clear();
    formulaParser.evaluate(`f1(t) = ` + formula);
    signalRef.current.emitSignal(100, 1);
    appendOperators();

    signalRef.current.changeInterval(intervalValue);
    renderChart(signalRef.current.emittedSignal, 1, chartRef.current);
    setIsPaused(() => false);
  };

  useEffect(() => {
    if (signalRef.current){
      if (isPaused){
        signalRef.current.pause();
      } else {
        signalRef.current.resume();
      }
    }
  }, [isPaused]);

  useEffect(() => {
    if (signalRef.current){
      
    }
  }, [filterValue]);
  

  useEffect(() => {
    if (signalRef.current){
     signalRef.current.changeInterval(intervalValue);
    }
  }, [intervalValue]);

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
              type="numeric"
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

export default ChartWithInputs;
