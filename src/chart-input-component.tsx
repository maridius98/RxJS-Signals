import React, { useEffect, useRef, useState } from 'react';
import { Signal } from './signal';
import { formulaParser } from "./parser";
import { Observable, Subject, Subscription, debounceTime, take, tap } from 'rxjs';
import { createRealTimeLineChart, point } from './diagram';

export const ChartWithInputs = () => {
	const componentRef = useRef(null);
	const chartRef = useRef(null);
	const signalRef = useRef<Signal>(null);
	const signalsRef = useRef<Signal[]>(null);
	const subscriptionRef = useRef(null);
	const formulaSubcriptionRef = useRef<Subscription>(null)
	const formulaSubjectRef = useRef<Subject<{value: string, index: number}>>(null);
	const fraction = 100;
	const [mainFormula, setFormula] = useState('sin(t^2)');
	const [formulas, setFormulas] = useState([]);
	const [intervalValue, setIntervalValue] = useState(1);
	const [isPaused, setIsPaused] = useState(true);
	const [filterValue, setFilterValue] = useState(1000);
	const [samplesValue, setLengthValue] = useState(3000);
	const [mergeFunctions, setMergeFunctions] = useState(false);

	const handleMainFormulaChange = (event: any) => {
		event.preventDefault();
		setFormula(event.target.value);
		if (formulaSubjectRef.current) {
			formulaSubjectRef.current.next({ value: event.target.value, index: 1 });
		}
	}; 			

	const handleFormulaChange = (index: number) => (event: any) => {
		event.preventDefault();
		const newFormulas = [...formulas];
		newFormulas[index] = event.target.value;
		setFormulas(newFormulas);
		if (formulaSubjectRef.current) {
			formulaSubjectRef.current.next({ index: index + 2, value: event.target.value });
		}
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

	const subRef = () => {
		formulaSubjectRef.current = new Subject<{value: string, index: number}>();
		formulaSubcriptionRef.current = formulaSubjectRef.current.pipe(
			debounceTime(2000),
			tap(f => {
				console.log(functionEvaluationString(f.index, f.value));
				formulaParser.evaluate(functionEvaluationString(f.index, f.value));
				})
			).subscribe()
	};

	const renderChart = (signal: Observable<point>, index: number, chart: any) => {
		subscriptionRef.current = signal.subscribe(point => {
			chart.updateChart(point, index+1)
		})
	}

	const handleAddFormula = () => {
		setFormulas([...formulas, 't']);
	};

	const functionEvaluationString = (index: number, domain: string) => {
		return `f${index}(t) = ${domain}`;
	}

	const appendOperators = () => {
		if (mergeFunctions) {
			formulas.map((p, idx) => {
				idx += 2;
				const functionName = 'f' + idx;
				formulaParser.evaluate(functionEvaluationString(idx, p));
				const signal = new Signal(functionName, fraction);
				signalsRef.current.push(signal);
			})
			signalRef.current.combineSignals(signalsRef.current);
			signalRef.current.appendOperators([take(signalsRef.current.length * samplesValue)]);
		}
	}

	const handleSubmit = (event: any) => {
		event.preventDefault();
		if (!chartRef.current) { 
			chartRef.current = createRealTimeLineChart(componentRef.current);
		}
		if (subscriptionRef.current) {
			subscriptionRef.current.unsubscribe();
		}
		if (formulaSubcriptionRef.current) {
			formulaSubcriptionRef.current.unsubscribe();
		}
		signalsRef.current = []
		const fullMainFormula = `f1(t) = ` + mainFormula;
		formulaParser.clear();
		formulaParser.evaluate(fullMainFormula);
		signalRef.current = new Signal(`f1`, fraction);
		signalsRef.current.unshift(signalRef.current);
		chartRef.current.resetChart();
		appendOperators();
		signalRef.current.changeInterval(intervalValue);
		signalRef.current.filterSignal();
	
		subRef();
		renderChart(signalRef.current.emittedSignal, 1, chartRef.current);
		setIsPaused(() => false);
	};

	useEffect(() => {
		if (signalRef.current){
			if (isPaused) {
				signalsRef.current.map(s => {
					s.pause();
					});
				}
			else {
				signalsRef.current.map(s => {
					s.resume();
				});
			}
		}
	}, [isPaused]);

	useEffect(() => {
		if (signalRef.current){
			signalRef.current.changeFilterSubject(filterValue);
		}
	}, [filterValue]);


	useEffect(() => {
		if (signalRef.current){
			signalsRef.current.map((s, idx) => {
					s.changeInterval(intervalValue);
					console.log(idx);
				});
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
					value={mainFormula}
					onChange={handleMainFormulaChange}
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
				min="0"
				max="200" 
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
				<label htmlFor={`formula${index+1}`}>{`Formula ${index+1}`}</label>
				<input
					type="text"
					id={`formula${index+1}`}
					value={formula}
					onChange={handleFormulaChange(index)}
				/>
				</div>
			))}
			{mergeFunctions && (
				<div>
					<button type="button" onClick={handleAddFormula}>Add Formula</button>
				</div>
			)}
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
