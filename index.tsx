import * as React from "react";
import * as ReactDOM from "react-dom";
import { addShapeToScene } from './src/viewer';
import { makeBottle } from './src/bottle';
import { stats } from './src/lib/three-util'

type State = {
  fps: number;
}
type Props = {

}
class App extends React.Component<Props, State> {
  constructor(p: Props) {
    super(p);
    this.state = {
      fps: 0
    };
    setInterval(() => {
      const frameCount = stats.frameCount;
      const penult = frameCount.length - 2;
      this.setState({ fps: stats.frameCount[penult] });
    }, 1000);

    let width = 50, height = 70, thickness = 30;
    makeBottle(width, height, thickness).then(addShapeToScene);
  }


  render() {
    return <p>fps {this.state.fps.toFixed(0)} </p>;
  }
}


ReactDOM.render(<App />, document.querySelector("#app"));
