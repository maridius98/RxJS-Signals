import { updateChart } from "./diagram";
import { emittedSignal } from "./signals";

emittedSignal.subscribe((point) => {
  updateChart(point);
  console.log(point);
});
