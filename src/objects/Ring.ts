import { DoubleSide, Mesh, MeshBasicMaterial, RingGeometry } from "three";
import { CelestialObject, CelestialObjectOptions } from "./CelestialObject";
import { textureLoader } from "./utils";

export type RingOptions = CelestialObjectOptions & {
  innerRadius: number;
  outerRadius: number;
};

export class Ring extends CelestialObject {
  constructor({ innerRadius, outerRadius, textures, ...rest }: RingOptions) {
    super({ ...rest, textures });
    this.clear();

    const geometry = new RingGeometry(innerRadius, outerRadius, rest.segments ?? 128, 1);
    const uvAttribute = geometry.getAttribute("uv");
    const positionAttribute = geometry.getAttribute("position");

    for (let i = 0; i < uvAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const radius = Math.hypot(x, y);

      // The texture is a ring cross-section: map it by radius, reuse it for all angles.
      const u = (radius - innerRadius) / (outerRadius - innerRadius);
      const v = 0.5;

      uvAttribute.setXY(i, u, v);
    }

    uvAttribute.needsUpdate = true;

    const map = textures[0] ? textureLoader.load(textures[0]) : undefined;
    const material = new MeshBasicMaterial({
      map,
      transparent: true,
      side: DoubleSide,
      depthWrite: false,
    });
    const mesh = new Mesh(geometry, material);
    mesh.rotateX(Math.PI / 2);

    this.add(mesh);
  }

  override update(dt: number) {
    this.rotateY(this.rotationSpeed * dt);
  }
}
