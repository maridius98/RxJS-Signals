import { interval, take, bufferToggle, windowToggle, map, bufferCount, filter, tap, finalize, concatAll, combineLatest, throttle, merge, flatMap, BehaviorSubject, switchMap, of, timer, Observable, ObservedValuesFromArray } from "rxjs";
import * as d3 from "d3";
import { formulaParser } from "./parser";

const isPaused$ = new BehaviorSubject(false);

function pause() {
  isPaused$.next(true);
}

function resume() {
  isPaused$.next(false);
}

function createRealTimeLineChart() {
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const x = d3.scaleLinear().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const line = d3
    .line<{ x: number; y: number }>()
    .curve(d3.curveBasis)
    .x((d) => x(d.x))
    .y((d) => y(d.y));

  const svg = d3
    .select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const data: { x: number; y: number }[] = [];

  const updateChart = (point: { x: number; y: number }) => {
    data.push(point);

    x.domain(d3.extent(data, (d) => d.x));
    y.domain([d3.min(data, (d) => d.y), d3.max(data, (d) => d.y)]);

    if (data.length === 1) {
      return;
    }

    svg.selectAll(".line").remove();

    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      .style('stroke', 'black')
      .style('stroke-width', 2)
      .style('fill', 'none');

    svg.selectAll(".axis").remove();

    svg
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

      svg
      .append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y));
  };

  return updateChart;
}

const formula = (t: number) => {
  return Math.exp(-0.1 * t) * Math.sin((2 / 3) * t);
};

const source$ = interval(1).pipe(
  map((t) => ({
    x: t,
    y: formulaParser.evaluate(`f(${t / 100})`),
  })),
  take(7000),
);

const filteredSignal = source$.pipe(
  filter(x => {
    return x.y > -0.7;
  }),
  throttle(() => interval(10)));

const signal = isPaused$.pipe(
  switchMap((paused) => (paused ? of(null) : filteredSignal))
);

const signal2 = interval(10).pipe(
  map((t) => ({
    x: t,
    y: -formula(t / 100),
  })),
  take(7000),
);


timer(1000).subscribe(() => {
  if (isPaused$.getValue() === true)
    isPaused$.next(false);
  else
    isPaused$.next(true);

  timer(1000).subscribe(() => {
    if (isPaused$.getValue() === true)
      isPaused$.next(false);
    else
      isPaused$.next(true);

      timer(1000).subscribe(() => {
        if (isPaused$.getValue() === true)
          isPaused$.next(false);
        else
          isPaused$.next(true);
    
          
      });
      
  });
});


const combinedSignal = combineLatest(signal, signal2, (s1, s2) => {
  return {y: s1.y*s2.y, x: s1.x};
});

const updateChart = createRealTimeLineChart();

// signal
//   .subscribe((point) => {
//     isPaused$.subscribe(p => {if (!p) console.log(point)});
//     if (point != null) {
//     updateChart(point);
//     }
// });

type point = {
  x: number,
  y: number
}

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
  subjectInterval.next(subjectInterval.getValue() + 10)
})

const emittedSignal = pausableObservable.observable.pipe(
  map((t) => ({
    x: t,
    y: formulaParser.evaluate(`f(${t / 100})`),
  })),
  take(7000),
);

emittedSignal.subscribe((point) => {
  updateChart(point);
})
