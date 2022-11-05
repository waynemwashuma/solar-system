import { Mesh, SphereGeometry, MeshStandardMaterial, PointLight,TextureLoader, Object3D } from "three";
let textureLoader = new TextureLoader()
textureLoader.setPath('/res/img/')

class Sun {
    constructor(params) {
        this.name = 'sun';
        this.rotationSpeed = params.rotationSpeed ||Math.PI/3
        this.mesh =new Mesh(new SphereGeometry(params.radius, params.segments, params.segments),new MeshStandardMaterial({
            map:textureLoader.load(params.textures[0]),
            wireframe:params.wireframe || false
        }));
        this.mesh.position.set(params.distance,0,0)
        this.children = [new PointLight(0xf5e275,10,10000)]
        this.children[0].castShadow = true
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        
    }
    init(demo){
        demo.children.push(this)
        demo.scene.add(this.mesh)
        this.children.forEach(c=>{
            demo.scene.add(c)
        })
    }
    update(){
        this.mesh.rotateY(this.rotationSpeed)
    }
}

class Planet extends Sun {
    constructor(params) {
        super(params)
        this.name= 'planet'
        this.children = [new Object3D()]
        this.children[0].add(this.mesh)
    }
    update(){
        this.mesh.rotateY(this.rotationSpeed);
        this.children[0].rotateX(this.rotationSpeed)
    }
}

export{
    Planet,
    Sun
}