import { AmbientLight, AxesHelper, PerspectiveCamera, PointLight, Scene, WebGL1Renderer } from "three";
import { Planet, Sun } from "./planets.mjs";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";

class Demo {
    constructor() {
        this.scene = new Scene()
        this.renderer = new WebGL1Renderer();
        this.camera = new PerspectiveCamera(50,1,0.1,10000)
        this.cameraController =new OrbitControls(this.camera,this.renderer.domElement)
        this.children = []
        this.init()
        this._raf()
        addEventListener('resize',this.onresize)
        addEventListener('keydown',e=>this.zoom(e))
    }
    init() {
        this.loadUnits()
        let light = new AmbientLight({ color: 0xfff })
        let axis =new AxesHelper()

        this.camera.position.set(150,150,100)
        this.renderer.setSize(innerWidth, innerHeight)
        document.body.append(this.renderer.domElement)
        this.renderer.shadowMap.enabled = true
        this.scene.add(this.camera, light,axis)
    }
    async loadUnits() {
        let data = await this.loadData();
        for (const key in data.planets) {
            if (Object.hasOwnProperty.call(data.planets, key)) {
                const planet = data.planets[key];
                new Planet(planet).init(this)
            }
        }
        new Sun(data.sun).init(this)
    }
    async loadData() {
        let planets = await fetch('/res/json/planets.json').then(data => data.json())
        let sun = await fetch("/res/json/sun.json").then(data => data.json())

        return { planets, sun }
    }
    _raf() {
        requestAnimationFrame(dt => {
            this.update()
            this._raf()
        })
    }
    onresize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(innerWidth, innerHeight);
    }
    zoom(e){
        let r = e.code.toLowerCase()
        console.log(r.includes('key'));
        if (r.includes('key')) {
            r = r.slice(3,e.code.length)
        }
        console.log(r);
        if (r == 'n') {
            this.camera.zoom += 1
            this.camera.updateProjectionMatrix()
        }
        if (r == 'm' && this.camera.zoom >1) {
            this.camera.zoom -= 1
            this.camera.updateProjectionMatrix()
        }
        console.log(this.camera.zoom);
    }
    add(obj) {
        obj.init(this)
    }
    update(){
        this.children.forEach(c=>{
            c.update()
        })
        this.renderer.render(this.scene, this.camera)
    }
}

export {
    Demo
}