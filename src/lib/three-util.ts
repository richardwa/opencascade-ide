import { AmbientLight, DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const stats = {
  frameCount: [0],
}
setInterval(() => {
  stats.frameCount.push(0);
}, 1000);


export const setupThreeJSViewport = () => {
  const scene = new Scene();

  const renderer = new WebGLRenderer({ antialias: true });
  const viewport = document.getElementById("viewport");
  const viewportRect = viewport.getBoundingClientRect();
  renderer.setSize(viewportRect.width, viewportRect.height);
  viewport.appendChild(renderer.domElement);
  const camera = new PerspectiveCamera(75, viewportRect.width / viewportRect.height, 0.1, 1000);


  window.addEventListener('resize', () => {
    const viewportRect = viewport.getBoundingClientRect();
    const x = viewportRect.width;
    const y = viewportRect.height;
    camera.aspect = x / y;
    camera.updateProjectionMatrix();
    renderer.setSize(x, y);
  });

  const light = new AmbientLight(0x404040);
  scene.add(light);
  const directionalLight = new DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0.5, 0.5, 0.5);
  scene.add(directionalLight);

  camera.position.set(0, 50, 100);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.screenSpacePanning = true;
  controls.target.set(0, 50, 0);
  controls.update();

  function animate() {
    requestAnimationFrame(animate);
    stats.frameCount[stats.frameCount.length - 1]++;
    renderer.render(scene, camera);
  }
  animate();
  return scene;
}

