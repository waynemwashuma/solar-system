import { AmbientLight, AxesHelper, Object3D, PerspectiveCamera, Quaternion, Scene, Vector3, WebGLRenderer } from "three";
import { FlyControls } from "./flycontrols.js";
import { OrbitControls } from "./orbitcontrols.js";
import { Asteriods, createOrbitMesh, Moon, Planet, Sun } from "./planets.js";

class Demo extends Scene {
  renderer: WebGLRenderer;
  commandElement: HTMLInputElement;
  camera: PerspectiveCamera;
  focusedObject: Object3D | undefined;
  cameraController: FlyControls;
  orbitControls: OrbitControls;
  animateNo: number = -1;
  lasttime = 0;
  speed = 0.01
  constructor() {
    super()
    this.renderer = new WebGLRenderer();
    this.camera = new PerspectiveCamera(50, 1, 0.1, 1000)
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

    this.add(sun)
    for (const key in data.planets) {
      if (Object.hasOwnProperty.call(data.planets, key)) {
        const planetData = data.planets[key];
        const planet = new Planet(planetData)
        if (planetData.moons) {
          for (let i = 0; i < planetData.moons.length; i++) {
            const moonData = planetData.moons[i];
            planet.add(new Moon(moonData))
            if (moonData.distance) {
              planet.add(createOrbitMesh(moonData.distance, moonData.distance, 100))
            }
          }
        }
        sun.add(planet)
        if (planetData.distance) {
          sun.add(createOrbitMesh(planetData.distance, planetData.distance, 100))
        }
      }
    }

    const innerBeltRange: [number, number] = [data.planets.mars.distance, data.planets.jupiter.distance]
    const outerBeltRange: [number, number] = [data.planets.neptune.distance, data.planets.neptune.distance + 50]
    const outerBelt = new Asteriods(data.outerBelt, outerBeltRange)
    const innerBelt = new Asteriods(data.innerBelt, innerBeltRange)

    sun.add(outerBelt)
    sun.add(innerBelt)
  }
  async loadData() {
    const planets = await fetch('/res/json/planets.json').then(data => data.json())
    const sun = await fetch("/res/json/sun.json").then(data => data.json())
    const innerBelt = await fetch("/res/json/innerBelt.json").then(data => data.json())
    const outerBelt = await fetch("/res/json/outerBelt.json").then(data => data.json())

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
        if (child instanceof Sun) {
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
