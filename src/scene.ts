import { AmbientLight, AxesHelper, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { Planet, Sun, Moon } from "./planets.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class Demo extends Scene {
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  cameraController: OrbitControls;
  animateNo: number = -1;
  constructor() {
    super()
    this.renderer = new WebGLRenderer();
    this.camera = new PerspectiveCamera(50, 1, 0.1, 1000)
    this.cameraController = new OrbitControls(this.camera, this.renderer.domElement)
    this.children = []
    this.init()
    this._raf()
    addEventListener('resize', () => this.onresize())
    addEventListener('keydown', (e) => this.zoom(e))
  }
  init() {
    const light = new AmbientLight(0xffffff, 0)
    const axis = new AxesHelper(100)
    
    this.loadUnits()
    this.camera.position.set(150, 150, 100)
    this.camera.lookAt(new Vector3(0,0,0))
    this.renderer.setSize(innerWidth, innerHeight)
    this.renderer.shadowMap.enabled = true
    this.add(this.camera, light, axis)
    document.body.append(this.renderer.domElement)
  }
  async loadUnits() {
    const data = await this.loadData();
    const sun  = new Sun(data.sun)
    this.add(sun)
    for (const key in data.planets) {
      if (Object.hasOwnProperty.call(data.planets, key)) {
        const planetData = data.planets[key];
        const planet = new Planet(planetData)
        if (planetData.moons) {
          for (let i = 0; i < planetData.moons.length; i++) {
            const moonData = planetData.moons[i];
            planet.add(new Moon(moonData))
          }
        }
        sun.add(planet)
      }
    }    
  }
  async loadData() {
    const planets = await fetch('/res/json/planets.json').then(data => data.json())
    const sun = await fetch("/res/json/sun.json").then(data => data.json())
    const asteroids = await fetch("/res/json/asteroids.json").then(data => data.json())

    return { planets, sun, asteroids }
  }
  _raf() {
    this.animateNo = requestAnimationFrame((_dt) => {
      this.update()
      this._raf()
    })
  }
  _pause() {
    cancelAnimationFrame(this.animateNo)
  }
  onresize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(innerWidth, innerHeight);
  }
  zoom(e: KeyboardEvent) {
    let r = e.code.toLowerCase()
    if (r.includes('key')) {
      r = r.slice(3, e.code.length)
    }
    if (r == 'n') {
      this.camera.zoom += 1
      this.camera.updateProjectionMatrix()
    }
    if (r == 'm' && this.camera.zoom > 1) {
      this.camera.zoom -= 1
      this.camera.updateProjectionMatrix()
    }
  }

  update() {
    this.children.forEach(c => {
      if(c instanceof Sun){
        c.update()
      }
    })
    
    this.renderer.render(this, this.camera)
  }
}

export {
  Demo
}