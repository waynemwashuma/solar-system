import { Mesh, MeshStandardMaterial, Object3D, Quaternion, SphereGeometry, Vector3 } from "three"
import { textureLoader, transformVector3 } from "./utils"

export type CelestialObjectOptions = {
  name?: string;
  rotationSpeed?: number;
  revolutionSpeed?: number;
  radius?: number;
  segments?: number;
  distance?: number;
  textures: string[];
}

export class CelestialObject extends Object3D {
  orbitRotation = 0
  rotationSpeed: number;
  revolutionSpeed: number;
  distance: number;
  radius: number;
  constructor({
    name,
    textures,
    revolutionSpeed = 0,
    rotationSpeed = 0,
    distance = 0,
    segments,
    radius
  }: CelestialObjectOptions) {
    super()
    const mesh = new Mesh(new SphereGeometry(radius, segments, segments), new MeshStandardMaterial({
      map: textures[0] ? textureLoader.load(textures[0]) : undefined,
    }));
    this.position.set(distance, 0, 0)
    mesh.castShadow = true
    mesh.receiveShadow = true

    this.name = name || 'celestial object'
    this.radius = radius || 0
    this.distance = distance
    this.rotationSpeed = rotationSpeed
    this.revolutionSpeed = revolutionSpeed
    this.add(mesh)
  }

  update(dt: number) {
    if (this.parent) {
      const inverse = this.parent.getWorldQuaternion(new Quaternion()).invert()
      const distance = transformVector3(inverse, new Vector3(this.distance, 0, 0))

      this.position.copy(distance)
    }
    this.orbitRotation += this.revolutionSpeed * dt
    this.position.set(Math.sin(this.orbitRotation) * this.distance, 0, Math.cos(this.orbitRotation) * this.distance)
    this.rotateY(this.rotationSpeed * dt)
  }
}
