import React, { useEffect, useRef, useState } from 'react';
import { Signal } from './signal';
import { formulaParser } from "./parser";
import { Observable, take, tap } from 'rxjs';
import { createRealTimeLineChart, point } from './diagram';

export const ChartWithInputs = () => {
const componentRef = useRef(null);
const chartRef = useRef(null);
const signalRef = useRef<Signal>(null);
const signalsRef = useRef<Signal[]>(null);
const subscriptionRef = useRef(null);

const [formula, setFormula] = useState('sin(t^2)');
const [formulas, setFormulas] = useState(['t/10', 'cos(t)']);
const [intervalValue, setIntervalValue] = useState(1);
const [isPaused, setIsPaused] = useState(true);
const [filterValue, setFilterValue] = useState(-0.4);
const [samplesValue, setLengthValue] = useState(3000);
const [mergeFunctions, setMergeFunctions] = useState(false);

const handleFormula1Change = (event: any) => {
	event.preventDefault();
	setFormula(event.target.value);
}; 			

const handleFormulaChange = (index: number) => (event: any) => {
	event.preventDefault();
	const newFormulas = [...formulas];
	newFormulas[index] = event.target.value;
	setFormulas(newFormulas);
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
	if (mergeFunctions) {
	formulaParser.evaluate(`f2(t) = ${formulas[0]}`)
	formulaParser.evaluate(`f3(t) = ${formulas[1]}`)
	const signal2 = new Signal()
	const signal3 = new Signal()
	signal2.emitSignal(100, 2);
	signal3.emitSignal(100, 3);
	signalsRef.current.push(signal2, signal3);
	signalRef.current.combineSignals([signal2, signal3]);
	signalRef.current.showVertex();
	}
	signalRef.current.appendOperators([take(3*samplesValue)]);
}

const handleSubmit = (event: any) => {
	event.preventDefault();
	if (!chartRef.current){ 
		chartRef.current = createRealTimeLineChart(componentRef.current);
	}
	if (subscriptionRef.current) {
		subscriptionRef.current.unsubscribe();
	}
	signalsRef.current = []
	signalRef.current = new Signal();
	signalsRef.current.push(signalRef.current)
	chartRef.current.resetChart();
	formulaParser.clear();
	formulaParser.evaluate(`f1(t) = ` + formula);
	signalRef.current.emitSignal(100, 1);
	appendOperators();
	console.log(formulas);

	signalRef.current.changeInterval(intervalValue);
	renderChart(signalRef.current.emittedSignal, 1, chartRef.current);
	setIsPaused(() => false);
};

useEffect(() => {
	if (signalRef.current){
		if (isPaused) {
			if (mergeFunctions) {
				signalsRef.current.map(s => {
				s.pause()
				})
			}
			else {
				signalRef.current.pause();
			}
		} else {
			if (mergeFunctions) {
				signalsRef.current.map(s => {
					s.resume()
			})
			} else {
				signalRef.current.resume();
			}
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
		{mergeFunctions &&
		formulas.map((formula, index) => (
			<div key={index} className="label-input">
			<label htmlFor={`formula${index+1}`}>{`formula${index+1}`}</label>
			<input
				type="text"
				id={`formula${index+1}`}
				value={formula}
				onChange={handleFormulaChange(index)}
			/>
			</div>
		))}
		<button type="button" onClick={handlePauseToggle}>
			{isPaused ? 'Resume' : 'Pause'}
		</button>
		<button type="submit">Parse Signal</button>
		</form>

	<div id="graph" ref={componentRef}></div>
	</div>
);
};

export default ChartWithInputs;
