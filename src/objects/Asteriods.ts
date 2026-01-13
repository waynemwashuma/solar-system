import { Vector3, BufferGeometry, Float32BufferAttribute, Points, PointsMaterial } from "three";
import { CelestialObject, CelestialObjectOptions } from "./CelestialObject";
import { randomFloatFromRange, randomIntFromRange } from "./utils";


export type AsteroidOptions = {
  number: number;
  minDistance?: number;
  maxDistance?: number;
};

export class Asteriods extends CelestialObject {
  constructor(params: CelestialObjectOptions & AsteroidOptions, range: [number, number]) {
    super(params);
    this.clear();
    this.initAsteroids(params, range);
  }
  initAsteroids(params: AsteroidOptions, range: [number, number]) {
    const asteroidBuffer = [];
    const beltRange = range[0] - range[1];
    for (let i = 0; i < params.number; i++) {
      const vector = new Vector3(
        randomFloatFromRange(-1, 1),
        randomFloatFromRange(-1, 1),
        randomFloatFromRange(-1, 1)
      )
        .normalize()
        .multiplyScalar(
          randomIntFromRange(
            range[0] + beltRange * (params.minDistance || 1),
            range[1] - beltRange * (1 - (params.maxDistance || 1))
          )
        );
      asteroidBuffer.push(vector.x, vector.y, vector.z);
    }
    const points = new BufferGeometry();
    points.setAttribute("position", new Float32BufferAttribute(asteroidBuffer, 3));
    const mesh = new Points(points, new PointsMaterial({
      color: 0xffffff,
      size: .5,
    }));
    this.add(mesh);
  }
}


