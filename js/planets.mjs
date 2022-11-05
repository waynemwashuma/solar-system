import { Mesh, SphereGeometry, MeshStandardMaterial, PointLight,TextureLoader } from "three";
let textLoader = new TextureLoader()
textLoader.setPath('/res/img/')
class Sun {
    constructor(params) {
        this.mesh =new Mesh(new SphereGeometry(params.radius, params.segments, params.segments),new MeshStandardMaterial({
            wireframe:params.wireframe || false
        }));
        this.children = [new PointLight({color:0xf5e275})];

        textLoader.load(params.textures[0],texture=>{
              this.mesh.material.map = texture  
        })
    }
    init(demo){
        demo.children.push(this)
        demo.scene.add(this.mesh)
        this.children.forEach(c=>{
            demo.scene.add(c)
        })
    }
}

class Planet extends Sun {
    constructor(params) {
        super(params)
    }
}

export{
    Planet,
    Sun
}