import { take, map, BehaviorSubject, Observable, bufferCount, combineLatest, OperatorFunction, switchMap, NEVER, interval, of, startWith, takeUntil } from "rxjs";
import { formulaParser } from "./parser";
import { point } from "./diagram";
import { filter } from "rxjs";

export class Signal {

  private intervalSubject = new BehaviorSubject<number>(1);
  private pauseSubject = new BehaviorSubject<boolean>(false);
  private filterValue = new BehaviorSubject<number>(Infinity);
  private counter = 0;

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

  delete(){
    delete this.emittedSignal;
  }

  changeInterval(value: number) {
    this.intervalSubject.next(value);
  }

  pause() {
    this.pauseSubject.next(true);
  }

  resume() {
    this.pauseSubject.next(false);
  }

  emittedSignal: Observable<point>;

  appendOperators(operators: OperatorFunction<any, any>[]) {
    this.emittedSignal = operators.reduce((observable, operator) => observable.pipe(operator), this.emittedSignal);
  }

  emitSignal(fraction: number, signalNumber: number) {
    this.emittedSignal = this.pausableObservable.pipe(
      map((t) => ({
        x: t,
        y: formulaParser.evaluate(`f${signalNumber}(${t / fraction})`),
      })),
      bufferCount(3, 1),
      map((t) => ({
        x: t[1].x,
        y: t[1].y,
        isVertex: ((t[0].y < t[1].y && t[2].y < t[1].y) || (t[0].y > t[1].y && t[2].y > t[1].y))
      }))
    );
  
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


