/// <reference path="../types/opencascade.d.ts" />

import {
  Color,
  Mesh,
  MeshStandardMaterial,
  Group,
  Scene
} from 'three';
import { initOpenCascade, TopoDS_Shape } from "opencascade.js";
import { setupThreeJSViewport } from './lib/three-util';
import visualize from './lib/visualize';


export const scene = setupThreeJSViewport();
export const openCascadePromise = initOpenCascade().then(oc => {
  console.log("opencascade wasm loaded");
  return oc.ready;
});
export const addShapeToScene = (shape: TopoDS_Shape) => {
  openCascadePromise.then(openCascade => {
    const objectMat = new MeshStandardMaterial({
      color: new Color(0.9, 0.9, 0.9)
    });

    let geometries = visualize(openCascade, shape);

    let group = new Group();
    geometries.forEach(geometry => {
      group.add(new Mesh(geometry, objectMat));
    });

    group.name = "shape";
    group.rotation.x = -Math.PI / 2;
    scene.add(group);
  });

};
