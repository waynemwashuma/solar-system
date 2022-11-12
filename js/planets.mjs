import { Mesh, SphereGeometry, MeshStandardMaterial, PointLight, TextureLoader, Object3D, RingGeometry, Points, Float64BufferAttribute, Vector3, BufferGeometry, PointsMaterial, Float32BufferAttribute, ShaderMaterial, DoubleSide } from "three";
let textureLoader = new TextureLoader()
textureLoader.setPath('/res/img/')
function randomIntFromRange(min, max) {
    return Math.round((Math.random() * (max - min)) + min)
}
function randomFloatFromRange(min, max) {
    return (Math.random() * (max - min)) + min
}
class Sun {
    constructor(params) {
        this.name = 'sun';
        this.rotationSpeed = params.rotationSpeed || Math.PI / 3
        this.mesh = new Mesh(new SphereGeometry(params.radius, params.segments, params.segments), new MeshStandardMaterial({
            map: textureLoader.load(params.textures[0]),
            wireframe: params.wireframe || false
        }));
        this.mesh.position.set(params.distance, 0, 0)
        this.children = [new PointLight(0xf5e275, 10, 10000)]
        this.children[0].castShadow = true
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true

    }
    init(demo) {
        demo.children.push(this)
        demo.scene.add(this.mesh)
        this.children.forEach(c => {
            demo.scene.add(c)
        })
    }
    update() {
        this.mesh.rotateY(this.rotationSpeed)
    }
}

class Planet extends Sun {
    constructor(params) {
        super(params)
        this.name = `planet/${params.name}`
        this.initMesh()
        this.revolutionSpeed = params.revolutionSpeed
    }
    add(...objs){
        for (let i = 0; i < objs.length; i++) {
            const child = objs[i];
            
            this.children.push(child)
            this.mesh.add(child.anchor)
            //child.init(this._global)
        }
    }
    init(demo) {
        demo.children.push(this)
        demo.scene.add(this.anchor);
        this.children.forEach(c => {
            c.init(demo)
        })
        this._global = demo
        return this
    }
    initMesh() {
        this.children = []
        this.anchor = new Object3D()
        this.anchor.add(this.mesh)
    }
    update() {
        this.anchor.rotateY(this.revolutionSpeed)
        this.mesh.rotateY(this.rotationSpeed)
        this.children.forEach(child=>{
            child.update()
        })
    }
}

class Moon extends Planet {
    constructor(params, anchor) {
        super(params);
        this.name = 'moon'
        this.anchorPoint = anchor
        console.log(anchor);
    }
    update() {


        
        this.anchor.position.copy(this.anchorPoint.position)
        this.anchor.rotateY(this.revolutionSpeed)
        this.mesh.rotateY(this.rotationSpeed)
    }
}

class Asteriods extends Planet {
    constructor(params) {
        super(params)
        this.name = 'asteroids'
        this.anchor.remove(this.mesh)
        this.initAsteroids(params)
    }
    initAsteroids(params) {
        let asteroidBuffer = []
        for (let i = 0; i < params.number; i++) {
            let vector = new Vector3(randomFloatFromRange(-1,1),randomFloatFromRange(-1,1),randomFloatFromRange(-1,1)).normalize().multiplyScalar(randomIntFromRange(params.minDistance, params.maxDistance))
            asteroidBuffer.push(vector.x, vector.y, vector.z)
        }
        let points = new BufferGeometry()
        points.setAttribute("position", new Float32BufferAttribute(asteroidBuffer, 3))
        this.mesh = new Points(points, new PointsMaterial({
            color: 0xffffff,
            size: .5,
        }))
        this.anchor.add(this.mesh)
    }
    update() {

    }
    // init(demo) {
    //     demo.scene.add(this.mesh)
    // }
}
class Ring extends Moon {
    constructor(params, anchor) {
        super(params, anchor)
        this.name = 'ring'
        this.mesh = new Mesh(new RingGeometry(18, 23, 28),new MeshStandardMaterial({
            color:0xffffff,
            map: textureLoader.load(params.textures[0]),
            side:DoubleSide
        }))
    }
}


class SolaFlares {

}
export {
    Planet,
    Sun,
    Moon,
    Ring,
    Asteriods
}