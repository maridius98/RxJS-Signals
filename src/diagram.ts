import * as d3 from "d3";

export type point = {
    x: number,
    y: number,
    isVertex?: boolean
  }

export function createRealTimeLineChart(containerId : HTMLElement) {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
  
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
  
    const line1 = d3
      .line<point>()
      .curve(d3.curveBasis)
      .x((d) => x(d.x))
      .y((d) => y(d.y));

    const line2 = d3
      .line<point>()
      .curve(d3.curveBasis)
      .x((d) => x(d.x))
      .y((d) => y(d.y));
  
    const svg = d3
      .select(containerId)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const data: point[] = [];
    const data2: point[] = [];

    const resetChart = () => {
      data.length = 0;
      data2.length = 0;
      svg.selectAll(".line1").remove();
      svg.selectAll(".line2").remove();
      svg.selectAll(".axis").remove();
    };
  
    const updateChart = (point: point, lineNumber: number) => {

      const pushData = (data: point[], point: point, line: d3.Line<point>, num: number, color: string) => {
        data.push(point);
        if (data.length>2)
          x.domain(d3.extent(data, (d) => d.x));
        y.domain([d3.min(data, (d) => d.y), d3.max(data, (d) => d.y)]);
        svg.selectAll(`.line${num}`).remove();

        svg
          .append("path")
          .datum(data)
          .attr("class", `line${num}`)
          .attr("d", line)
          .style('stroke', color)
          .style('stroke-width', 2)
          .style('fill', 'none');       
      }


      const drawCircles = (data: point[], num: number) => {

        let circles = svg.selectAll(`.circle${num}`).data(data);
        circles.exit().remove();

        circles.attr("cx", d => d.isVertex ? x(d.x) : null)
          .attr("cy", d => d.isVertex ? y(d.y) : null);
    
        circles.enter()
          .filter(d => d.isVertex)  
          .append("circle")
          .attr("class", `circle${num}`)
          .attr("cx", d => x(d.x))
          .attr("cy", d => y(d.y))
          .attr("r", 5)
          .style("fill", "red");
    }
    

      if (lineNumber == 1){
        pushData(data, point, line1, 1, "black");
        drawCircles(data, 1);
      }
      else if (lineNumber == 2){
        pushData(data2, point, line2, 2, "gray");
        drawCircles(data2, 2);
      }
  
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
  

  
