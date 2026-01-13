import { BufferGeometry, LineBasicMaterial, LineLoop, Quaternion, TextureLoader, Vector3 } from "three"

export const textureLoader = new TextureLoader()
textureLoader.setPath('/res/img/')

export function randomIntFromRange(min: number, max: number) {
  return Math.round((Math.random() * (max - min)) + min)
}
export function randomFloatFromRange(min: number, max: number) {
  return (Math.random() * (max - min)) + min
}

export function transformVector3(orientation: Quaternion, vector: Vector3) {
  const vx = vector.x,
    vy = vector.y,
    vz = vector.z
  const qx = orientation.x,
    qy = orientation.y,
    qz = orientation.z,
    qw = orientation.w

  const tx = 2 * (qy * vz - qz * vy)
  const ty = 2 * (qz * vx - qx * vz)
  const tz = 2 * (qx * vy - qy * vx)

  vector.x = vx + qw * tx + qy * tz - qz * ty
  vector.y = vy + qw * ty + qz * tx - qx * tz
  vector.z = vz + qw * tz + qx * ty - qy * tx

  return vector
}
export function createOrbitMesh(major: number, minor: number, segments: number = 100) {
  const points = generateEllipsePoints(major, minor, segments);
  const mesh = new BufferGeometry().setFromPoints(
    points
  );
  return new LineLoop(mesh, new LineBasicMaterial({
    color: 0xffffff
  }));

}
export function generateEllipsePoints(major: number, minor: number, segments: number = 100): Vector3[] {
  const points = [];

  for (let i = 0; i < segments; i++) {
    const t = (i / (segments - 1)) * (2 * Math.PI);
    const x = major * Math.cos(t);
    const y = minor * Math.sin(t);

    points.push(new Vector3(x, 0, y));
  }

  return points;
}
