import * as d3 from "d3";

export type point = {
    x: number,
    y: number
  }

export function createRealTimeLineChart() {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
  
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
  
    const line = d3
      .line<point>()
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
  
    const data: point[] = [];

    const resetChart = () => {
      data.length = 0;
      svg.selectAll(".line").remove();
      svg.selectAll(".axis").remove();
    };
  
    const updateChart = (point: point) => {
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
  
    return {
      updateChart,
      resetChart
    }
  }
  
export const chart = createRealTimeLineChart();
  
