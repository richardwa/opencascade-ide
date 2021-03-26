import * as React from "react";
import * as ReactDOM from "react-dom";
import { addShapeToScene } from './src/viewer';
import { makeBottle } from './src/bottle';
import { stats } from './src/lib/three-util'


const App = () => {
  const last = stats.frameCount.length - 1;
  const fps = stats.frameCount[last - 1];

  return <h1>fps {fps.toFixed(0)} </h1>;
};

let width = 50, height = 70, thickness = 30;
makeBottle(width, height, thickness).then(addShapeToScene);

setInterval(() => {
  ReactDOM.render(<App />, document.querySelector("#app"));
}, 1000);