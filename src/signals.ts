import { interval, take, map, BehaviorSubject, Observable } from "rxjs";
import { formulaParser } from "./parser";

function createPausableObservable(interval: BehaviorSubject<number>) {
    let paused = true;
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
      pauseOrResume: () => {
        paused = !paused;
      }
    }
  
    return pausableObservable;
  }
  
  const subjectInterval = new BehaviorSubject<number>(1);
  
  const pausableObservable = createPausableObservable(subjectInterval);
  pausableObservable.observable.subscribe((value) => console.log(value));
  
  interval(1000).subscribe(() => {
    pausableObservable.pauseOrResume();
  })
  
  export const emittedSignal = pausableObservable.observable.pipe(
    map((t) => ({
      x: t,
      y: formulaParser.evaluate(`f(${t / 100})`),
    })),
    take(7000),
  );
  
 

