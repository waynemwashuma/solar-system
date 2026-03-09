import { GUI } from "dat.gui";
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "../src/orbitcontrols.js";

const container = document.getElementById("app");

if (!container) {
  throw new Error("Missing #app container");
}

const scene = new Scene();
scene.background = new Color(0x03050a);

const camera = new PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 0.8, 4.8);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 2.5;
controls.maxDistance = 10;
controls.minPolarAngle = Math.PI * 0.2;
controls.maxPolarAngle = Math.PI * 0.8;

const ambientLight = new AmbientLight(0x8fa7ff, 0.45);
const keyLight = new DirectionalLight(0xfff2d6, 2.8);
keyLight.position.set(4, 2, 5);
const rimLight = new DirectionalLight(0x5c88ff, 1.4);
rimLight.position.set(-3, -1, -4);
scene.add(ambientLight, keyLight, rimLight);

const planet = new Group();

const surface = new Mesh(
  new IcosahedronGeometry(1.6, 5),
  new MeshPhysicalMaterial({
    color: 0xb8d4ff,
    roughness: 0.9,
    metalness: 0.05,
    wireframe: true,
  }),
);

planet.add(surface);
scene.add(planet);

const guiState = {
  wireframe: true,
};

const gui = new GUI({ name: "Planet Controls" });
gui.width = 300;
gui.add(guiState, "wireframe").name("Show wireframe").onChange((value: boolean) => {
  surface.material.wireframe = value;
});

surface.material.wireframe = guiState.wireframe;

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);

  surface.rotation.y += 0.0025;
  controls.update(1 / 60);

  renderer.render(scene, camera);
}

resize();
controls.update();
animate();

window.addEventListener("resize", resize);
