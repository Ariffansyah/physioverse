// Tabrakan AABB untuk pemain dan bola. Murni matematika — diuji di collide.test.ts.
import { GRAVITY } from "./physics.ts";

export type Point = { x: number; y: number; z: number };

/** Kotak sejajar sumbu: titik tengah + setengah rusuk. */
export type Box = { x: number; y: number; z: number; hx: number; hy: number; hz: number };

export const box = (x: number, y: number, z: number, hx: number, hy: number, hz: number): Box => ({
  x,
  y,
  z,
  hx,
  hy,
  hz,
});

/**
 * Dorong pemain keluar dari kotak lewat sumbu yang tembusnya paling dangkal.
 * Pemain diperlakukan sebagai silinder tegak setinggi mata.
 */
export function pushOut(p: Point, radius: number, boxes: Box[], top: number) {
  for (const b of boxes) {
    if (b.y - b.hy > top || b.y + b.hy < 0) continue;
    const dx = p.x - b.x;
    const dz = p.z - b.z;
    const ox = b.hx + radius - Math.abs(dx);
    const oz = b.hz + radius - Math.abs(dz);
    if (ox <= 0 || oz <= 0) continue;
    if (ox < oz) p.x = b.x + Math.sign(dx || 1) * (b.hx + radius);
    else p.z = b.z + Math.sign(dz || 1) * (b.hz + radius);
  }
}

/** Ada yang tersentuh kotak? Dipakai untuk menyerahkan lintasan analitik ke fisika. */
export function touches(x: number, y: number, z: number, r: number, boxes: Box[]) {
  return boxes.some(
    (k) => Math.abs(x - k.x) < k.hx + r && Math.abs(y - k.y) < k.hy + r && Math.abs(z - k.z) < k.hz + r,
  );
}

export type Body = {
  p: { x: number; y: number; z: number };
  v: { x: number; y: number; z: number };
  r: number;
};

/** Pantulkan bola dari satu kotak. Bola didekati sebagai kotak juga — cukup untuk clank. */
function hitBox(b: Body, k: Box, e: number) {
  const dx = b.p.x - k.x;
  const dy = b.p.y - k.y;
  const dz = b.p.z - k.z;
  const ox = k.hx + b.r - Math.abs(dx);
  const oy = k.hy + b.r - Math.abs(dy);
  const oz = k.hz + b.r - Math.abs(dz);
  if (ox <= 0 || oy <= 0 || oz <= 0) return false;
  if (ox <= oy && ox <= oz) {
    b.p.x = k.x + Math.sign(dx || 1) * (k.hx + b.r);
    b.v.x *= -e;
  } else if (oy <= oz) {
    b.p.y = k.y + Math.sign(dy || 1) * (k.hy + b.r);
    b.v.y *= -e;
  } else {
    b.p.z = k.z + Math.sign(dz || 1) * (k.hz + b.r);
    b.v.z *= -e;
  }
  return true;
}

/**
 * Satu langkah integrasi bola: gravitasi, pantul lantai, pantul kotak, gesekan
 * gelinding. Dipakai setelah lintasan analitik selesai — nilai misi tetap dari
 * `level.solve`, ini murni kelanjutan yang kelihatan.
 *
 * ponytail: Euler + AABB, tanpa rotasi dan tanpa CCD. Bola cepat bisa tembus
 * kotak tipis; ganti ke swept test kalau itu kelihatan.
 */
export function stepBody(
  b: Body,
  dt: number,
  { boxes = [], floorY = 0, scale = 1, restitution = 0.55 } = {} as {
    boxes?: Box[];
    floorY?: number;
    scale?: number;
    restitution?: number;
  },
) {
  const step = Math.min(dt, 0.05);
  b.v.y -= GRAVITY * scale * step;
  b.p.x += b.v.x * step;
  b.p.y += b.v.y * step;
  b.p.z += b.v.z * step;

  const rest = floorY + b.r;
  if (b.p.y < rest) {
    b.p.y = rest;
    b.v.y = b.v.y < 0 ? -b.v.y * restitution : b.v.y;
    if (Math.abs(b.v.y) < 0.5 * scale) b.v.y = 0;
    b.v.x *= 0.97;
    b.v.z *= 0.97;
  }
  for (const k of boxes) hitBox(b, k, restitution);
}

/** Pemain menyenggol bola yang sudah menggelinding. */
export function nudge(b: Body, eye: Point, reach = 0.6, force = 3.5) {
  const dx = b.p.x - eye.x;
  const dz = b.p.z - eye.z;
  const d = Math.hypot(dx, dz);
  if (d > b.r + reach) return;
  b.v.x += (dx / (d || 1)) * force;
  b.v.z += (dz / (d || 1)) * force;
  if (b.v.y <= 0.01) b.v.y = 1.4;
}
