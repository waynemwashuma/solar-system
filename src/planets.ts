import { Mesh, SphereGeometry, PointLight, TextureLoader, Object3D, Points, Vector3, BufferGeometry, PointsMaterial, Float32BufferAttribute, MeshBasicMaterial } from "three";
let textureLoader = new TextureLoader()
textureLoader.setPath('/res/img/')
function randomIntFromRange(min: number, max: number) {
  return Math.round((Math.random() * (max - min)) + min)
}
function randomFloatFromRange(min: number, max: number) {
  return (Math.random() * (max - min)) + min
}

type CelestialObjectOptions = { 
  rotationSpeed?: number;
  revolutionSpeed?: number;
  radius?: number;
  segments?: number;
  textures: string[];
  wireframe: boolean;
  distance: number;
}
class Sun extends Object3D {
  rotationSpeed: number;
  revolutionSpeed: number;
  mesh: Object3D;
  constructor(params: CelestialObjectOptions) {
    super()
    const light = new PointLight(0xf5e275, 10, 10000)
    const mesh = new Mesh(new SphereGeometry(params.radius, params.segments, params.segments), new MeshBasicMaterial({
      map: params.textures[0] ? textureLoader.load(params.textures[0]) : undefined,
      wireframe: params.wireframe || false
    }));
    
    mesh.position.set(params.distance, 0, 0)
    mesh.castShadow = true
    mesh.receiveShadow = true
    light.castShadow = true

    this.name = 'sun'
    this.rotationSpeed = params.rotationSpeed || 0
    this.revolutionSpeed = params.revolutionSpeed || 0
    this.mesh = mesh
    this.add(mesh)
  }

  update() {
    this.mesh.rotateY(this.rotationSpeed)
  }
}

class Planet extends Sun {
  constructor(params: { name?: string; revolutionSpeed?: number; rotationSpeed?: number; radius?: number; segments?: number; textures: string[]; wireframe: boolean; distance: number; }) {
    super(params)
    this.name = `planet/${params.name}`
  }

  override update() {
    this.rotateY(this.rotationSpeed)
    this.mesh.rotateY(this.rotationSpeed)
    super.update()
  }
}

class Moon extends Planet {
  constructor(params: { name?: string; revolutionSpeed?: number; rotationSpeed?: number; radius?: number; segments?: number; textures: string[]; wireframe: boolean; distance: number; }) {
    super(params);
    this.name = 'moon'
  }
  override update() {
    this.rotateY(this.rotationSpeed)
    this.mesh.rotateY(this.rotationSpeed)
  }
}

class Asteriods extends Planet {
  constructor(params: { name?: string; revolutionSpeed?: number; rotationSpeed?: number; radius?: number; segments?: number; textures: string[]; wireframe: boolean; distance: number; }) {
    super(params)
    this.name = 'asteroids'
    this.remove(this.mesh)
    this.initAsteroids(params)
  }
  initAsteroids(params: { name?: string | undefined; revolutionSpeed?: number | undefined; rotationSpeed?: number | undefined; radius?: number | undefined; segments?: number | undefined; textures?: string[]; wireframe?: boolean; distance?: number; number?: any; minDistance?: any; maxDistance?: any; }) {
    let asteroidBuffer = []
    for (let i = 0; i < params.number; i++) {
      let vector = new Vector3(randomFloatFromRange(-1, 1), randomFloatFromRange(-1, 1), randomFloatFromRange(-1, 1)).normalize().multiplyScalar(randomIntFromRange(params.minDistance, params.maxDistance))
      asteroidBuffer.push(vector.x, vector.y, vector.z)
    }
    let points = new BufferGeometry()
    points.setAttribute("position", new Float32BufferAttribute(asteroidBuffer, 3))
    this.mesh = new Points(points, new PointsMaterial({
      color: 0xffffff,
      size: .5,
    }))
    this.add(this.mesh)
  }
  override update() { }
}
export {
  Planet,
  Sun,
  Moon,
  Asteriods
}