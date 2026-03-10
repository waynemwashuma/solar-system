import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  DoubleSide,
  Mesh,
  ShaderMaterial,
  Vector3,
} from "three";
import atmosphereFragmentShader from "../assets/shader/atmosphereFragment.glsl?raw";
import atmosphereVertexShader from "../assets/shader/atmosphereVertex.glsl?raw";

function createSpherifiedCubeGeometry(radius: number, segments: number) {
  const geometry = new BoxGeometry(radius * 2, radius * 2, radius * 2, segments, segments, segments);
  const positions = geometry.getAttribute("position");
  const vertex = new Vector3();

  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    vertex.normalize().multiplyScalar(radius);
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}

type AtmosphereUniforms = {
  uCameraPosition: { value: Vector3 };
  uLightDirection: { value: Vector3 };
  uAtmosphereColor: { value: Color };
  uSunsetColor: { value: Color };
  uIntensity: { value: number };
  uFalloff: { value: number };
  uSunBoost: { value: number };
  uEdgeSoftness: { value: number };
};

type AtmosphereOptions = {
  radius: number;
  segments: number;
  color?: Color;
  sunsetColor?: Color;
  intensity?: number;
  falloff?: number;
  sunBoost?: number;
  edgeSoftness?: number;
};

export class Atmosphere extends Mesh {
  private readonly baseRadius: number;
  declare material: ShaderMaterial;

  constructor({
    radius,
    segments,
    color = new Color(0x72b6ff),
    sunsetColor = new Color(0xff9a5a),
    intensity = 1.35,
    falloff = 3.4,
    sunBoost = 1.1,
    edgeSoftness = 1.9,
  }: AtmosphereOptions) {
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      uniforms: {
        uCameraPosition: { value: new Vector3() },
        uLightDirection: { value: new Vector3(1, 0, 0) },
        uAtmosphereColor: { value: color },
        uSunsetColor: { value: sunsetColor },
        uIntensity: { value: intensity },
        uFalloff: { value: falloff },
        uSunBoost: { value: sunBoost },
        uEdgeSoftness: { value: edgeSoftness },
      } satisfies AtmosphereUniforms,
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
    });

    super(createSpherifiedCubeGeometry(radius, segments), material);

    this.baseRadius = radius;
  }

  update(cameraPosition: Vector3, lightDirection: Vector3) {
    this.material.uniforms["uCameraPosition"]?.value.copy(cameraPosition);
    this.material.uniforms["uLightDirection"]?.value.copy(lightDirection).normalize();
  }

  setIntensity(value: number) {
    const uniform = this.material.uniforms["uIntensity"];
    if(uniform){
      uniform.value = value
    }
  }

  setFalloff(value: number) {
    const uniform = this.material.uniforms["uFalloff"];
    if(uniform){
      uniform.value = value
    }
  }

  setSunBoost(value: number) {
    const uniform = this.material.uniforms["uSunBoost"];
    if(uniform){
      uniform.value = value
    }
  }

  setRadius(value: number) {
    this.scale.setScalar(value / this.baseRadius);
  }
}
