import {
  Color,
  Mesh,
  MeshStandardMaterial,
  Group,
  Scene
} from 'three';
import { initOpenCascade, TopoDS_Shape } from "opencascade.js";


console.time('wasm load');
export const openCascadePromise = initOpenCascade().then(oc => {
  console.timeEnd('wasm load');
  return oc.ready;
});


  openCascadePromise.then(openCascade => {

  });
