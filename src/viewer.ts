/// <reference path="../types/opencascade.d.ts" />

import {
  Color,
  Mesh,
  MeshStandardMaterial,
  Group,
  Scene,
  BufferGeometry,
  BufferAttribute
} from 'three';
import { TopoDS_Shape } from "opencascade.js";
import { openCascadeHelper } from './lib/opencascade-util';
import { setupThreeJSViewport } from './lib/three-util';


export const scene = setupThreeJSViewport();

const objectMat = new MeshStandardMaterial({
  color: new Color(0.9, 0.9, 0.9)
});

export const addShapeToScene = (shape: TopoDS_Shape) => {
    const goemetries = openCascadeHelper.visualize(shape);
    const group = new Group();
    goemetries.forEach(({ vertices, normals, indices }) => {
      const geometry = new BufferGeometry()
      geometry.setAttribute('position',
        new BufferAttribute(vertices, 3)
      )
      geometry.setAttribute('normal',
        new BufferAttribute(normals, 3)
      )
      geometry.setIndex(new BufferAttribute(indices, 1))

      group.add(new Mesh(geometry, objectMat));
    });
    group.name = "shape";
    group.rotation.x = -Math.PI / 2;
    scene.add(group);
};
