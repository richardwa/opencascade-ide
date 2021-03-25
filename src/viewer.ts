/// <reference path="../types/opencascade.d.ts" />

import {
  Color,
  Mesh,
  MeshStandardMaterial,
  Group,
  Scene
} from 'three';
import { initOpenCascade, OpenCascade, TopoDS_Shape } from "opencascade.js";
import { setupThreeJSViewport } from './lib/three-util';
import visualize from './lib/visualize';
import { makeBottle } from './bottle';

const addShapeToScene = async (openCascade: OpenCascade, shape: TopoDS_Shape, scene: Scene) => {
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
}

const scene = setupThreeJSViewport();

initOpenCascade().then(oc => oc.ready).then(openCascade => {
  let width = 50, height = 70, thickness = 30;
  let bottle = makeBottle(openCascade, width, height, thickness);
  addShapeToScene(openCascade, bottle, scene);
});
