import { take, map, BehaviorSubject, Observable, bufferCount, pluck, tap } from "rxjs";
import { formulaParser } from "./parser";
import { point } from "./diagram";

export class Signal {

private static instance: Signal;

public static getInstance(): Signal {
  if (!Signal.instance) {
    Signal.instance = new Signal();
  }
  return Signal.instance;
}

pausableObservable: {
    observable: Observable<number>;
    pauseOrResume: (pause: boolean) => void;
}

emittedSignal: Observable<point>;

intervalSubject: BehaviorSubject<number> = new BehaviorSubject<number>(1);

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

  emitSignal(fraction: number) {
    this.emittedSignal = this.pausableObservable.observable.pipe(
      bufferCount(3, 1),
      map((t) => ({
        x: t[1],
        y: formulaParser.evaluate(`f(${t[1] / fraction})`),
        isVertex: ((t[0] < t[1] && t[2] < t[1]) || (t[0] > t[1] && t[2] > t[1]))
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
  
 

