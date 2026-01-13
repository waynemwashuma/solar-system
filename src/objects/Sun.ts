import { PointLight } from "three";
import { CelestialObject, CelestialObjectOptions } from "./CelestialObject";

export class Sun extends CelestialObject {
  constructor(options: CelestialObjectOptions) {
    super(options);
    const light = new PointLight(0xf5e275, 10, 10000);
    light.castShadow = true;

    this.add(light);
  }
}
