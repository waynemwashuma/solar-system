# JSON Parameters Reference

This document describes the parameters used by the solar system dataset under `assets/json/`.

## Files

- `assets/json/solarSystem.json`

## Shared Celestial Fields

These are used by the `sun` object, planet objects in the `planets` array, moon objects, and ring objects where applicable.

- `name` (string): Object identifier used in scene lookup/focus.
- `radius` (number): Physical radius in **kilometers** for Sun/planets/moons.
- `segments` (number): Geometry tessellation/detail.
- `textures` (string[]): Texture filenames loaded from `assets/img/`.
- `rotationSpeed` (number): Self-rotation speed.
- `revolutionSpeed` (number): Orbital revolution speed around parent.

Notes:
- Sphere render size is derived from `radius` with square-root compression so large bodies stay visible in-scene.

## Shared Orbit Fields

Used to drive orbital path generation for planets and moons.

- `orbit.apegree` (number): Farthest orbital distance.
- `orbit.pedigree` (number): Nearest orbital distance.
- `orbit.offsetAngle` (number): Orbit plane offset angle in degrees.
- `orbit.reverse` (boolean, optional): Reverse orbit direction when `true`.

Notes:
- For planets, `apegree/pedigree` values are in million kilometers.
- For moons, values are scene-scaled to keep local moon orbits readable.

## `solarSystem.sun`

Defines the Sun object.

- Uses shared celestial fields.
- Typical fields present: `name`, `radius`, `segments`, `textures`, `rotationSpeed`.

## `solarSystem.planets`

Top-level array of planet objects, ordered as they should appear in the dataset.

Each planet entry uses shared celestial fields and may include:

- `orbit` (object): Real-world orbit metadata.
  - `apegree` (number): Farthest solar distance (aphelion), in million km.
  - `pedigree` (number): Nearest solar distance (perihelion), in million km.
  - `offsetAngle` (number): Orbit plane offset/inclination vs solar plane, in degrees.
  - `reverse` (boolean, optional): `true` for reverse/retrograde orbit. Omitted means normal direction.

- `moons` (array, optional): List of moon objects using shared celestial fields and shared orbit fields.

- `ring` (object, optional): Ring config (currently for Saturn).
  - Shared celestial fields used by ring object: `segments`, `rotationSpeed`, `revolutionSpeed`, `textures`.
  - `innerRadius` (number): Inner ring radius.
  - `outerRadius` (number): Outer ring radius.

## `solarSystem.innerBelt` and `solarSystem.outerBelt`

Defines asteroid belt generation settings.

- `number` (number): Number of asteroid points to generate.
- `orbit` (object): Belt spread factors across the belt range.
  - `minDistance` (number): Lower normalized distribution factor.
  - `maxDistance` (number): Upper normalized distribution factor.
- `revolutionSpeed` (number): Belt revolution speed.
- `textures` (string[]): Source texture list for belt object config.

Notes:
- Belt `orbit.minDistance/maxDistance` are currently interpreted by asteroid generation logic as distribution factors, not literal kilometers.
