// import React, { useState } from 'react';

// // Your import statements for Chart and other required modules...

// let chartCounter = 0;

// const App = () => {
//   const [charts, setCharts] = useState<JSX.Element[]>([]);

//   const appendChart = () => {
//     // Add new Chart to the current list of Charts
//     setCharts((currentCharts) => [...currentCharts, <Chart />]);
//   };

//   const removeChart = () => {
//     setCharts((currentCharts) => {
//       // Remove the last Chart from the list
//       const newCharts = [...currentCharts];
//       newCharts.pop();
//       return newCharts;
//     });
//   };

//   return (
//     <div>
//       <button onClick={appendChart}>Add Chart</button>
//       <button onClick={removeChart}>Remove Chart</button>
//       {charts.map((chart, index) => <div key={index}>{chart}</div>)}
//     </div>
//   );
// };

// export default App;