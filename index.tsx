import * as React from "react";
import * as ReactDOM from "react-dom";
import { addShapeToScene } from './src/viewer';
import { makeBottle } from './src/bottle';

const App = () => (
  <h1>My React and TypeScript App!</h1>
);


let width = 50, height = 70, thickness = 30;
makeBottle(width, height, thickness).then(addShapeToScene);

ReactDOM.render(<App />, document.querySelector("#app"));