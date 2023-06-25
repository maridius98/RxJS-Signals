import React, { useEffect, useState } from 'react';
import { pausableObservable, subjectInterval } from './signals';
import { formulaParser } from "./parser";

const App = () => {
    const [formula1, setFormula1] = useState('');
    const [formula2, setFormula2] = useState('');
    const [intervalValue, setIntervalValue] = useState(1);
    const [isPaused, setIsPaused] = useState(true);
    const [filterValue, setFilterValue] = useState(-0.4);
    const [samplesValue, setLengthValue] = useState(3000);
    const [showVertex, setShowVertex] = useState(false);
    const [mergeFunctions, setMergeFunctions] = useState(false);
  
    const handleFormula1Change = (event: any) => {
      setFormula1(event.target.value);
    };
  
    const handleFormula2Change = (event: any) => {
      setFormula2(event.target.value);
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
  
    const handleShowVertexToggle = () => {
      setShowVertex((prevShowVertex) => !prevShowVertex);
    };
  
    const handleMergeFunctionsToggle = () => {
      setMergeFunctions((prevMergeFunctions) => !prevMergeFunctions);
    };
  
    const handleSubmit = (event: any) => {
        event.preventDefault();
        formulaParser.clear();
        console.log(formula1);
        formulaParser.evaluate("f(t) = " + formula1);
        //formulaParser.evaluate("f2(t) = " + formula2);
        setIsPaused(() => false);
    };

    useEffect(() => {
        pausableObservable.pauseOrResume(isPaused);
        }, [isPaused]);

    useEffect(() => {
    subjectInterval.next(intervalValue);
        }, [intervalValue]);

  
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div className="label-input">
            <label htmlFor="formula1">Formula 1:</label>
            <input
              type="text"
              id="formula1"
              value={formula1}
              onChange={handleFormula1Change}
            />
          </div>
          <div className="label-input">
            <label htmlFor="formula2">Formula 2:</label>
            <input
              type="text"
              id="formula2"
              value={formula2}
              onChange={handleFormula2Change}
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
      </div>
    );
  };

export default App;