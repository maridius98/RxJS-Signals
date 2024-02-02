import React, { useState } from 'react';
import { ChartWithInputs } from './chart-input-component';

const App = () => {
  const [charts, setCharts] = useState<JSX.Element[]>([]);

  const appendChart = () => {
    setCharts((currentCharts) => [...currentCharts, <ChartWithInputs />]);
  };

  const removeChart = () => {
    setCharts((currentCharts) => {
      const newCharts = [...currentCharts];
      newCharts.pop();
      return newCharts;
    });
  };

  return (
    <div>
      <button onClick={appendChart}>Add Chart</button>
      <button onClick={removeChart}>Remove Chart</button>
      {charts.map((chart, index) => <div key={index}>{chart}</div>)}
    </div>
  );
};

export default App;