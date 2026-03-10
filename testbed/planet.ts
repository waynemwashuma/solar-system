import { GUI } from "dat.gui";
import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { Atmosphere } from "./Atmosphere.js";
import { OrbitControls } from "../src/orbitcontrols.js";

function createSpherifiedCubeGeometry(radius: number, segments: number) {
  const geometry = new BoxGeometry(radius * 2, radius * 2, radius * 2, segments, segments, segments);
  const positions = geometry.getAttribute("position");
  const vertex = new Vector3();

  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    vertex.normalize().multiplyScalar(radius);
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}

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
const planetRadius = 1.6;
const atmosphereRadius = 1.73;
const planetGeometry = createSpherifiedCubeGeometry(planetRadius, 24);
const faceColors = [
  0xff6b6b,
  0xf7b267,
  0xffe66d,
  0x4ecdc4,
  0x5dade2,
  0xa29bfe,
];
const surfaceMaterials = faceColors.map((color) => new MeshPhysicalMaterial({
  color,
  roughness: 0.88,
  metalness: 0.04,
  clearcoat: 0.08,
  wireframe: false,
}));

const surface = new Mesh(
  planetGeometry,
  surfaceMaterials,
);

const atmosphere = new Atmosphere({
  radius: atmosphereRadius,
  segments: 24,
});

planet.add(surface);
planet.add(atmosphere);
scene.add(planet);

const guiState = {
  wireframe: false,
  atmosphereIntensity: 1.35,
  atmosphereFalloff: 3.4,
  atmosphereSunBoost: 1.1,
  atmosphereThickness: atmosphereRadius,
};

const gui = new GUI({ name: "Planet Controls" });
gui.width = 300;
gui.add(guiState, "wireframe").name("Show wireframe").onChange((value: boolean) => {
  surfaceMaterials.forEach((material) => {
    material.wireframe = value;
  });
});
gui.add(guiState, "atmosphereIntensity", 0, 3, 0.01).name("Atmosphere intensity").onChange((value: number) => {
  atmosphere.setIntensity(value);
});
gui.add(guiState, "atmosphereFalloff", 1, 8, 0.01).name("Atmosphere falloff").onChange((value: number) => {
  atmosphere.setFalloff(value);
});
gui.add(guiState, "atmosphereSunBoost", 0, 3, 0.01).name("Sun boost").onChange((value: number) => {
  atmosphere.setSunBoost(value);
});
gui.add(guiState, "atmosphereThickness", planetRadius + 0.03, planetRadius + 0.35, 0.001)
  .name("Atmosphere radius")
  .onChange((value: number) => {
    atmosphere.setRadius(value);
  });

surfaceMaterials.forEach((material) => {
  material.wireframe = guiState.wireframe;
});

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
  atmosphere.rotation.y = surface.rotation.y;
  atmosphere.update(camera.position, keyLight.position);
  controls.update(1 / 60);

  renderer.render(scene, camera);
}

resize();
controls.update();
animate();

window.addEventListener("resize", resize);
