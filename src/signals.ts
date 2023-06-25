import { take, map, BehaviorSubject, Observable } from "rxjs";
import { formulaParser } from "./parser";

function createPausableObservable(interval: BehaviorSubject<number>) {
    let paused = false;
    let value: number = 0;
    
    let intervalId: any;
  
    const internalObservable = new Observable<number>((observer) => {
      let intervalSub = interval.subscribe((newInterval) => {
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
      }
    }
  
    return pausableObservable;
  }

  export const subjectInterval = new BehaviorSubject<number>(1);
  
  export const pausableObservable = createPausableObservable(subjectInterval);
  
  export const emittedSignal = pausableObservable.observable.pipe(
    map((t) => ({
      x: t,
      y: formulaParser.evaluate(`f(${t / 100})`),
    })),
    take(2000),
  );
  
 

