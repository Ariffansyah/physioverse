

export const GRAVITY = 9.8;


export function optics(lensX: number, objectX: number, focal: number, objectH: number) {
  const s = lensX - objectX;
  const si = (s * focal) / (s - focal);
  return { s, si, imageX: lensX + si, imageH: (-objectH * si) / s };
}


export function projectile(speed: number, angleDeg: number, g = GRAVITY) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    rad,
    range: (speed ** 2 * Math.sin(2 * rad)) / g,
    apex: (speed * Math.sin(rad)) ** 2 / (2 * g),
    flight: (2 * speed * Math.sin(rad)) / g,
  };
}


export function glbb(v0: number, accel: number, distance: number) {
  const finalV = Math.sqrt(v0 ** 2 + 2 * accel * distance);
  const duration = accel > 0 ? (finalV - v0) / accel : v0 > 0 ? distance / v0 : Infinity;
  return { finalV, duration };
}


export function fringeSpacing(wavelengthNm: number, screenM: number, slitMm: number) {
  return (wavelengthNm * 1e-9 * screenM) / (slitMm * 1e-3);
}


export const MU = 200;


export const orbitPeriod = (r: number, mu = MU) => 2 * Math.PI * Math.sqrt(r ** 3 / mu);


export function apoapsis(r: number, v: number, mu = MU) {
  const energy = v ** 2 / 2 - mu / r;
  if (energy >= 0) return Infinity;
  const a = -mu / (2 * energy);
  const h = r * v;
  const e = Math.sqrt(Math.max(0, 1 + (2 * energy * h ** 2) / mu ** 2));
  return a * (1 + e);
}


export function heightAtX(
  speed: number,
  angleDeg: number,
  x: number,
  releaseH = 0,
  g = GRAVITY,
) {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  if (cos <= 1e-9) return releaseH;
  const t = x / (speed * cos);
  return releaseH + speed * Math.sin(rad) * t - 0.5 * g * t * t;
}


export function basketballHeight(
  speed: number,
  angleDeg: number,
  hoopDist: number,
  releaseH = 2.0,
) {
  return heightAtX(speed, angleDeg, hoopDist, releaseH);
}


export const circularSpeed = (r: number, mu = MU) => Math.sqrt(mu / r);


export const AIR = 1.2;


export const dragForce = (v: number, cd: number, area: number, rho = AIR) =>
  0.5 * rho * cd * area * v ** 2;


export const topSpeed = (thrust: number, cd: number, area: number, rho = AIR) =>
  Math.sqrt((2 * thrust) / (rho * cd * area));
