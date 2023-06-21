import { interval, take, range, map, bufferCount, filter, tap, finalize } from "rxjs";
import { SmoothieChart, TimeSeries } from "smoothie";

const formula = (t : number) => {
  return Math.exp(-0.1*t) * Math.sin(2/3 * t);
}

const arr : number[] = [];

const signal =
interval(10).pipe(
  map(t => t / 100),
  map(t => formula(t)),
  take(3000)
);

document.addEventListener('DOMContentLoaded', function() {
  const smoothie = new SmoothieChart();
  smoothie.streamTo(document.getElementById("mycanvas") as HTMLCanvasElement);
  let line = new TimeSeries();
  signal.subscribe(x => {
    line.append(Date.now(), x);
  })

  smoothie.addTimeSeries(line);
});

signal.subscribe(console.log);