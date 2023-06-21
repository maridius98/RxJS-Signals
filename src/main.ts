import { interval, take, range, map, bufferCount, filter, tap, finalize } from "rxjs";
import * as d3 from "d3";

function createRealTimeLineChart(verticalRange: [number, number], horizontalLength: number) {
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const x = d3.scaleLinear().range([0, width]).domain([0, horizontalLength]);
  const y = d3.scaleLinear().range([height, 0]).domain(verticalRange);

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
    y.domain([-1, d3.max(data, (d) => d.y)]);

    svg.selectAll(".line").remove();

    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('fill', 'none');

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

const signal = interval(1).pipe(
  map((t) => ({
    x: t,
    y: formula(t / 100),
  })),
  take(3000),
);

const updateChart = createRealTimeLineChart([-1, 1], 3000);

signal.subscribe((point) => {
  updateChart(point);
});
