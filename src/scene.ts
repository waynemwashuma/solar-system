import { AmbientLight, AxesHelper, Object3D, PerspectiveCamera, PointLight, Quaternion, Scene, Vector3, WebGLRenderer } from "three";
import { FlyControls } from "./flycontrols.js";
import { OrbitControls } from "./orbitcontrols.js";
import { Asteriods, CelestialObject, createOrbitMesh, Moon, ORBIT_DISTANCE_SCALE, Planet, Ring, Sun } from "./objects";

type OrbitData = {
  apegree: number;
  pedigree: number;
}

class Demo extends Scene {
  renderer: WebGLRenderer;
  commandElement: HTMLInputElement;
  camera: PerspectiveCamera;
  sun: Sun | undefined;
  sunLight: PointLight | undefined;
  focusedObject: Object3D | undefined;
  cameraController: FlyControls;
  orbitControls: OrbitControls;
  animateNo: number = -1;
  lasttime = 0;
  speed = 0.01
  constructor() {
    super()
    this.renderer = new WebGLRenderer({ logarithmicDepthBuffer: true });
    this.camera = new PerspectiveCamera(50, 1, 0.1, 10000)
    this.commandElement = document.getElementById('command-input') as HTMLInputElement
    this.cameraController = new FlyControls(this.camera, this.renderer.domElement)
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)
    this.orbitControls.listenToKeyEvents(this.renderer.domElement)
    this.orbitControls.enablePan = false
    this.renderer.domElement.tabIndex = 0
    this.children = []

    this.init()
    this._raf()
    this.commandElement.addEventListener('keydown', this.onCommand.bind(this))
    addEventListener('resize', () => this.resize())
    addEventListener('keydown', (event) => {
      if(event.code === 'Slash'){
        if(document.activeElement === this.commandElement){
          this.renderer.domElement.focus()
        } else {
          this.commandElement.focus()
        }
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    })
  }
  orbitRangeFromData(orbit: OrbitData): [number, number] {
    return [orbit.pedigree / ORBIT_DISTANCE_SCALE, orbit.apegree / ORBIT_DISTANCE_SCALE]
  }
  init() {
    const light = new AmbientLight(0xffffff, 0)
    const axis = new AxesHelper(100)

    this.loadUnits()
    this.camera.position.set(150, 150, 100)
    this.camera.lookAt(new Vector3(0, 0, 0))
    this.renderer.shadowMap.enabled = true
    this.cameraController.dragToLook = true
    this.cameraController.rollSpeed = 0.1
    this.orbitControls.enabled = false
    this.cameraController.movementSpeed = 5
    this.add(this.camera, light, axis)
    this.resize()
    document.body.append(this.renderer.domElement)
  }
  async loadUnits() {
    const data = await this.loadData();
    const sun = new Sun(data.sun)
    this.sun = sun
    this.sunLight = sun.light

    this.add(sun, sun.light)
    for (const key in data.planets) {
      if (Object.hasOwnProperty.call(data.planets, key)) {
        const planetData = data.planets[key];
        const planet = new Planet(planetData)
        if (planetData.moons) {
          for (let i = 0; i < planetData.moons.length; i++) {
            const moonData = planetData.moons[i];
            const moon = new Moon(moonData)
            planet.add(moon)
            if (moon.orbitMajorRadius > 0) {
              const moonOrbit = createOrbitMesh(moon.orbitMajorRadius, moon.orbitMinorRadius, 100)
              moonOrbit.rotateX(moon.orbitOffsetAngle * (Math.PI / 180))
              planet.add(moonOrbit)
            }
          }
        }
        if (planetData.ring) {
          const { ring } = planetData;
          planet.add(new Ring({
            ...ring,
            revolutionSpeed: 0,
          }))
        }
        sun.add(planet)
        if (planet.orbitMajorRadius > 0) {
          const planetOrbit = createOrbitMesh(planet.orbitMajorRadius, planet.orbitMinorRadius, 100)
          planetOrbit.rotateX(planet.orbitOffsetAngle * (Math.PI / 180))
          sun.add(planetOrbit)
        }
      }
    }

    const innerBeltRange = this.orbitRangeFromData({
      pedigree: data.planets.mars.orbit.pedigree,
      apegree: data.planets.jupiter.orbit.apegree,
    })
    const outerBeltRange = this.orbitRangeFromData({
      pedigree: data.planets.neptune.orbit.pedigree,
      apegree: data.planets.neptune.orbit.apegree + 640,
    })
    const outerBelt = new Asteriods(data.outerBelt, outerBeltRange)
    const innerBelt = new Asteriods(data.innerBelt, innerBeltRange)

    // sun.add(outerBelt)
    // sun.add(innerBelt)
  }
  async loadData() {
    const planets = await fetch('/assets/json/planets.json').then(data => data.json())
    const sun = await fetch("/assets/json/sun.json").then(data => data.json())
    const innerBelt = await fetch("/assets/json/innerBelt.json").then(data => data.json())
    const outerBelt = await fetch("/assets/json/outerBelt.json").then(data => data.json())
    return { planets, sun, innerBelt, outerBelt }
  }
  _raf() {
    this.animateNo = requestAnimationFrame((time) => {
      const dt = this.lasttime - time

      this.lasttime = time
      this.update(dt * this.speed)
      this._raf()
    })
  }
  _pause() {
    cancelAnimationFrame(this.animateNo)
  }
  resize() {
    const width = innerWidth
    const height = innerHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height);
  }
  zoom(e: KeyboardEvent) {
    if (e.code == 'KeyN') {
      this.camera.updateProjectionMatrix()
    }
    if (e.code == 'KeyM' && this.camera.zoom > 1) {
      this.camera.zoom -= 1
      this.camera.updateProjectionMatrix()
    }
  }

  focus(objectName: string) {
    const object = this.getObjectByName(objectName)

    if (!object) {
      this.unfocus()
      return
    }
    this.focusedObject = object
    this.cameraController.enabled = false
    this.orbitControls.enabled = true
    if (object instanceof CelestialObject) {
      this.orbitControls.minDistance = object.radius + 0.2
      this.orbitControls.maxDistance = object.radius + 10
    }
  }

  unfocus() {
    const position = new Vector3()
    const orientation = new Quaternion()
    const scale = new Vector3()
    this.camera.matrixWorld.decompose(position, orientation, scale)
    this.camera.removeFromParent()
    this.camera.position.copy(position)
    this.camera.quaternion.copy(orientation)
    this.camera.scale.copy(scale)
    this.cameraController.enabled = true
    this.orbitControls.enabled = false
  }

  onCommand(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      const objectName = this.commandElement.value.toLowerCase()

      if (objectName === 'none') {
        this.unfocus()
      } else {
        this.focus(objectName)
      }
      this.renderer.domElement.focus()
      this.commandElement.blur()
      this.commandElement.value = ''
    }
  }
  update(dt: number) {
    if (this.sun && this.sunLight) {
      this.sunLight.position.copy(this.sun.getWorldPosition(new Vector3()))
    }
    if (this.focusedObject) {
      this.orbitControls.target.copy(
        this.focusedObject.getWorldPosition(new Vector3())
      )
    }
    this.cameraController.update(dt)
    if (this.orbitControls.enabled) {
      this.orbitControls.update(dt)
    }
    this.children.forEach(c => {
      c.traverse(child => {
        if (child instanceof CelestialObject) {
          child.update(dt)
        }
      })
    })

    this.renderer.render(this, this.camera)
  }
}

export {
  Demo
}
