import { Mesh, MeshStandardMaterial, Object3D, SphereGeometry, Vector3 } from "three"
import { textureLoader } from "./utils"

export const ORBIT_DISTANCE_SCALE = 1
export const OBJECT_RADIUS_SCALE = 0.1 / 6378

export type OrbitOptions = {
  apegree: number;
  pedigree: number;
  offsetAngle: number;
  reverse?: boolean;
}

export type CelestialObjectOptions = {
  name?: string;
  rotationSpeed?: number;
  revolutionSpeed?: number;
  radius?: number;
  segments?: number;
  orbit?: OrbitOptions;
  textures: string[];
}

export class CelestialObject extends Object3D {
  orbitRotation = 0
  rotationSpeed: number;
  revolutionSpeed: number;
  orbitMajorRadius: number;
  orbitMinorRadius: number;
  orbitOffsetAngle: number;
  orbitDirection: 1 | -1;
  radius: number;
  constructor({
    name,
    textures,
    revolutionSpeed = 0,
    rotationSpeed = 0,
    orbit,
    segments,
    radius
  }: CelestialObjectOptions) {
    super()
    const computedRadius = radius
      ? radius * OBJECT_RADIUS_SCALE
      : 0
    const mesh = new Mesh(new SphereGeometry(computedRadius, segments, segments), new MeshStandardMaterial({
      map: textures[0] ? textureLoader.load(textures[0]) : undefined,
    }));
    const apegree = orbit?.apegree ?? 0
    const pedigree = orbit?.pedigree ?? 0
    const offsetAngle = orbit?.offsetAngle ?? 0
    const major = (apegree + pedigree) / 2 / ORBIT_DISTANCE_SCALE
    const eccentricity = apegree + pedigree === 0 ? 0 : (apegree - pedigree) / (apegree + pedigree)
    const minor = major * Math.sqrt(1 - eccentricity * eccentricity)

    this.position.set(major, 0, 0)
    mesh.castShadow = true
    mesh.receiveShadow = true

    this.name = name || 'celestial object'
    this.radius = computedRadius
    this.orbitMajorRadius = major
    this.orbitMinorRadius = Number.isFinite(minor) ? minor : major
    this.orbitOffsetAngle = offsetAngle
    this.orbitDirection = orbit?.reverse ? -1 : 1
    this.rotationSpeed = rotationSpeed
    this.revolutionSpeed = revolutionSpeed
    this.add(mesh)
  }

  update(dt: number) {
    this.orbitRotation += this.revolutionSpeed * dt * this.orbitDirection
    this.position.set(
      Math.sin(this.orbitRotation) * this.orbitMajorRadius,
      0,
      Math.cos(this.orbitRotation) * this.orbitMinorRadius,
    )
    this.position.applyAxisAngle(new Vector3(1, 0, 0), this.orbitOffsetAngle * (Math.PI / 180))
    this.rotateY(this.rotationSpeed * dt)
  }
}
