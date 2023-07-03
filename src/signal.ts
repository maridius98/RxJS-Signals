import { take, map, BehaviorSubject, Observable, bufferCount, pluck, tap, combineLatest, OperatorFunction } from "rxjs";
import { formulaParser } from "./parser";
import { point } from "./diagram";

export class Signal {

pausableObservable: {
    observable: Observable<number>;
    pauseOrResume: (pause: boolean) => void;
}


emittedSignal: Observable<point>;

intervalSubject: BehaviorSubject<number> = new BehaviorSubject<number>(1);

addOperators(operators: OperatorFunction<any, any>[]) {
  this.emittedSignal = operators.reduce((observable, operator) => observable.pipe(operator), this.emittedSignal);
}

createPausableObservable() {
  let paused = false;
  let value: number = 0;
  
  let intervalId: any;

  const internalObservable = new Observable<number>((observer) => {
    let intervalSub = this.intervalSubject.subscribe((newInterval) => {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (!paused){
          observer.next(value++);
        }
      }, newInterval);
    });
    
    return () => {
      clearInterval(intervalId);
      intervalSub.unsubscribe();
    };
   });
    
    const pausableObservable = {
      observable: internalObservable,
      pauseOrResume: (pause: boolean) => {
        paused = pause;
      },
      reset: () => {
        value = 0;
      }
    }
  
    this.pausableObservable = pausableObservable;
  }

  emitSignal(fraction: number, signalNumber: number) {
    this.emittedSignal = this.pausableObservable.observable.pipe(
      map((t) => ({
        x: t,
        y: formulaParser.evaluate(`f${signalNumber}(${t / fraction})`),
      })),
      bufferCount(3, 1),
      map((t) => ({
        x: t[1].x,
        y: t[1].y,
        isVertex: ((t[0].y < t[1].y && t[2].y < t[1].y) || (t[0].y > t[1].y && t[2].y > t[1].y))
      })),
      take(2000),
    );
  
    this._callbacks.forEach((callback) => callback(this.emittedSignal));
    this._callbacks = [];
  }

  private _callbacks: Array<(emittedSignal: Observable<point>) => void> = [];

  onEmittedSignalDefined(callback: (emittedSignal: Observable<point>) => void) {
    if (this.emittedSignal) {
      callback(this.emittedSignal);
    } else {
      this._callbacks.push(callback);
    }
  }
}

export const signal1 = new Signal();
export const signal2 = new Signal();

export const combineSignals = (signal1: Observable<point>, signal2: Observable<point>) => {
  const returnSignal = combineLatest(signal1, signal2, (s1, s2) => {
    return {y: s1.y * s2.y, x: s1.x}
  });
  return returnSignal;
}


