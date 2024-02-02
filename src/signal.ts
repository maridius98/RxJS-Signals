import { take, map, BehaviorSubject, Observable, bufferCount, combineLatest, OperatorFunction, switchMap, NEVER, interval, of, startWith, takeUntil, filter } from "rxjs";
import { formulaParser } from "./parser";
import { point } from "./diagram";
import { abs } from "mathjs";

export class Signal {

	private intervalSubject = new BehaviorSubject<number>(1);
	private pauseSubject = new BehaviorSubject<boolean>(false);
	private filterSubject = new BehaviorSubject<number>(Infinity);
	private counter = 0;
	emittedSignal: Observable<point>;
    formula: string;
    scalar: number;

    constructor(formulaName: string, scalar = 100){
        this.formula = formulaName;
        this.scalar = scalar;
        console.log(this.formula);
        this.emitSignal();
    }

	pausableObservable = this.intervalSubject.pipe(
		switchMap(intervalValue => this.pauseSubject.pipe(
			switchMap(paused => paused ? NEVER : interval(intervalValue)
				.pipe(
				startWith(this.counter), 
				switchMap(() => {
					this.counter++;
					return of(this.counter);
				})
				)
				
			)
        )),
	);

	filterSignal(){
		this.appendOperators([filter(point => abs(point.y) < this.filterSubject.value)])
	}

	combineSignals(signals: Signal[]) {
		const emittedSignals = signals.flatMap(s => s.emittedSignal);
		emittedSignals.unshift(this.emittedSignal);
		this.emittedSignal = combineLatest(emittedSignals, (...points: point[]) => {
            return points.reduce((acc, value) => {
                return {
                    y: acc.y * value.y,
                    x: value.x
                }
            });
        })
	}

	showVertex(){
		this.appendOperators([
		bufferCount(3, 1),
		map((t) => ({
			x: t[1].x,
			y: t[1].y,
			isVertex: ((t[0].y < t[1].y && t[2].y < t[1].y) || (t[0].y > t[1].y && t[2].y > t[1].y))
		    }))
		,
		],
		
	)}

	appendOperators(operators: OperatorFunction<any, any>[]) {
		this.emittedSignal = operators.reduce((observable, operator) => observable.pipe(operator), this.emittedSignal);
	}

	emitSignal() {
		this.emittedSignal = this.pausableObservable.pipe(
		map((t) => ({
			x: t,
			y: formulaParser.evaluate(`${this.formula}(${t/this.scalar})`),
            })),
		)
	}

    delete() {
	    delete this.emittedSignal;
	}

	changeInterval(value: number) {
        this.intervalSubject.next(value);
	}

	changeFilterSubject(value: number) {
		this.filterSubject.next(value);
	}

	pause() {
		this.pauseSubject.next(true);
	}

	resume() {
		this.pauseSubject.next(false);
	}
}

