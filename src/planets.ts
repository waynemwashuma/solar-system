import { Mesh, SphereGeometry, PointLight, TextureLoader, Object3D, Points, Vector3, BufferGeometry, PointsMaterial, Float32BufferAttribute, MeshBasicMaterial, Quaternion, LineLoop, LineBasicMaterial } from "three";
let textureLoader = new TextureLoader()
textureLoader.setPath('/res/img/')
function randomIntFromRange(min: number, max: number) {
  return Math.round((Math.random() * (max - min)) + min)
}
function randomFloatFromRange(min: number, max: number) {
  return (Math.random() * (max - min)) + min
}

function transformVector3(orientation: Quaternion, vector: Vector3) {
  const vx = vector.x,
    vy = vector.y,
    vz = vector.z
  const qx = orientation.x,
    qy = orientation.y,
    qz = orientation.z,
    qw = orientation.w

  const tx = 2 * (qy * vz - qz * vy)
  const ty = 2 * (qz * vx - qx * vz)
  const tz = 2 * (qx * vy - qy * vx)

  vector.x = vx + qw * tx + qy * tz - qz * ty
  vector.y = vy + qw * ty + qz * tx - qx * tz
  vector.z = vz + qw * tz + qx * ty - qy * tx

  return vector
}

type CelestialObjectOptions = {
  name?: string;
  rotationSpeed?: number;
  revolutionSpeed?: number;
  radius?: number;
  segments?: number;
  distance?: number;
  textures: string[];
  wireframe: boolean;
}

type AsteroidOptions = {
  number: number;
  minDistance?: number;
  maxDistance?: number;
}
class Sun extends Object3D {
  orbitRotation = 0
  rotationSpeed: number;
  revolutionSpeed: number;
  distance: number;
  constructor({
    name,
    textures,
    revolutionSpeed = 0,
    rotationSpeed = 0,
    distance = 0,
    segments,
    radius,
    wireframe
  }: CelestialObjectOptions) {
    super()
    const light = new PointLight(0xf5e275, 10, 10000)
    const mesh = new Mesh(new SphereGeometry(radius, segments, segments), new MeshBasicMaterial({
      map: textures[0] ? textureLoader.load(textures[0]) : undefined,
      wireframe: wireframe || false
    }));
    this.position.set(distance, 0, 0)
    mesh.castShadow = true
    mesh.receiveShadow = true
    light.castShadow = true

    this.name = name || 'celestial object'
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

class Planet extends Sun {
  constructor(params: CelestialObjectOptions) {
    super(params)
    this.name = `planet/${params.name}`
  }
}

class Moon extends Planet {
  constructor(params: { name?: string; revolutionSpeed?: number; rotationSpeed?: number; radius?: number; segments?: number; textures: string[]; wireframe: boolean; distance: number; }) {
    super(params);
    this.name = 'moon'
  }
  override update() {
    this.rotateY(this.rotationSpeed)
  }
}

class Asteriods extends Planet {
  constructor(params: CelestialObjectOptions & AsteroidOptions, range: [number, number]) {
    super(params)
    this.clear()
    this.initAsteroids(params, range)
  }
  initAsteroids(params: AsteroidOptions, range: [number, number]) {
    const asteroidBuffer = []
    const beltRange = range[0] - range[1]
    for (let i = 0; i < params.number; i++) {
      const vector = new Vector3(
        randomFloatFromRange(-1, 1),
        randomFloatFromRange(-1, 1),
        randomFloatFromRange(-1, 1)
      )
        .normalize()
        .multiplyScalar(
          randomIntFromRange(
            range[0] + beltRange * (params.minDistance || 1),
            range[1] - beltRange * (1 - (params.maxDistance || 1))
          )
        )
      asteroidBuffer.push(vector.x, vector.y, vector.z)
    }
    const points = new BufferGeometry()
    points.setAttribute("position", new Float32BufferAttribute(asteroidBuffer, 3))
    const mesh = new Points(points, new PointsMaterial({
      color: 0xffffff,
      size: .5,
    }))
    this.add(mesh)
  }
}
export {
  Planet,
  Sun,
  Moon,
  Asteriods
}

export function createOrbitMesh(major: number, minor: number, segments: number = 100) {
  const points = generateEllipsePoints(major, minor, segments)
  const mesh = new BufferGeometry().setFromPoints(
    points
  )
  return new LineLoop(mesh, new LineBasicMaterial({
    color: 0xffffff
  }))

}
function generateEllipsePoints(major: number, minor: number, segments: number = 100): Vector3[] {
  const points = [];

  for (let i = 0; i < segments; i++) {
    const t = (i / (segments - 1)) * (2 * Math.PI);
    const x = major * Math.cos(t);
    const y = minor * Math.sin(t);

    points.push(new Vector3(x, 0, y));
  }

  return points;
}