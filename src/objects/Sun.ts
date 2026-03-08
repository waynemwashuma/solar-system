import { Color, Mesh, MeshStandardMaterial, Object3D, PointLight } from "three";
import { CelestialObject, CelestialObjectOptions } from "./CelestialObject";

export class Sun extends CelestialObject {
  light: PointLight;

  constructor(options: CelestialObjectOptions) {
    super(options);
    this.traverse((child: Object3D) => {
      if (!(child instanceof Mesh)) {
        return;
      }

      if (Array.isArray(child.material)) {
        child.material.forEach((material) => {
          if (material instanceof MeshStandardMaterial) {
            material.emissive = new Color(0xf5e275);
            material.emissiveIntensity = 1.5;
          }
        });
        return;
      }

      if (child.material instanceof MeshStandardMaterial) {
        child.material.emissive = new Color(0xf5e275);
        child.material.emissiveIntensity = 1.5;
      }
    });

    this.light = new PointLight(0xffffff, 1, 0, 0);
    this.light.castShadow = false;
  }
}
