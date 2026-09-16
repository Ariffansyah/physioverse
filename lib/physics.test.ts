
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  apoapsis,
  circularSpeed,
  dragForce,
  fringeSpacing,
  glbb,
  heightAtX,
  optics,
  orbitPeriod,
  projectile,
  topSpeed,
  wavelengthRgb,
} from "./physics.ts";
import { courtX, courtY } from "./levels.ts";

const near = (a: number, b: number, eps = 1e-6) =>
  assert.ok(Math.abs(a - b) < eps, `${a} !== ${b}`);

test("optics: s = 2f puts the image at 2f, inverted, same size", () => {
  const { s, si, imageX, imageH } = optics(-4, -10, 3, 2);
  near(s, 6);
  near(si, 6);
  near(imageX, 2);
  near(imageH, -2);
});

test("optics: image stays real across the whole slider range", () => {
  for (let lensX = -6; lensX <= 6; lensX += 0.5) {
    assert.ok(optics(lensX, -10, 3, 2).si > 0, `virtual image at lensX=${lensX}`);
  }
});

test("projectile: 45° maximises range, and range = v²/g there", () => {
  const at45 = projectile(15, 45).range;
  near(at45, 15 ** 2 / 9.8);
  for (const angle of [10, 30, 60, 80]) {
    assert.ok(projectile(15, angle).range < at45);
  }
});

test("projectile: apex is reached at half the flight time", () => {
  const { apex, flight } = projectile(20, 37);
  const rad = (37 * Math.PI) / 180;
  const t = flight / 2;
  near(apex, 20 * Math.sin(rad) * t - 0.5 * 9.8 * t ** 2, 1e-9);
});

test("glbb: v² = v0² + 2as, and duration matches the distance travelled", () => {
  const { finalV, duration } = glbb(4, 2, 20);
  near(finalV, Math.sqrt(16 + 80));
  near(4 * duration + 0.5 * 2 * duration ** 2, 20, 1e-9);
});

test("glbb: standing still with no acceleration never finishes", () => {
  assert.equal(glbb(0, 0, 20).duration, Infinity);
  near(glbb(0, 0, 20).finalV, 0);
});

test("fringeSpacing: Δy = λL/d, dan skalanya benar", () => {
  near(fringeSpacing(550, 2, 0.22), 5e-3, 1e-9);
  near(fringeSpacing(550, 4, 0.22), 2 * fringeSpacing(550, 2, 0.22), 1e-12);
  near(fringeSpacing(550, 2, 0.44), fringeSpacing(550, 2, 0.22) / 2, 1e-12);
});

test("orbitPeriod: memenuhi hukum ketiga Kepler", () => {
  near(orbitPeriod(9), 12, 0.01);
  const a = orbitPeriod(6) ** 2 / 6 ** 3;
  const b = orbitPeriod(15) ** 2 / 15 ** 3;
  near(a, b, 1e-9);
});

test("apoapsis: injeksi lingkar tidak menaikkan jari-jari", () => {
  for (const r of [5, 9, 14]) near(apoapsis(r, circularSpeed(r)), r, 1e-6);
});

test("apoapsis: lebih cepat dari lingkar berarti naik, secepat lepas berarti tak kembali", () => {
  assert.ok(apoapsis(8, circularSpeed(8) * 1.1) > 8);
  assert.equal(apoapsis(8, Math.sqrt(2 * 200 / 8)), Infinity);
});

test("lintasan meninggalkan titik asal persis pada sudut bidiknya", () => {
  for (const angle of [10, 30, 45, 60, 80]) {
    const rad = (angle * Math.PI) / 180;
    const h = 1e-6;
    const slope = heightAtX(14, angle, h, 0) / h;
    near(slope, Math.tan(rad), 1e-4);
  }
});

test("court: sumbu tegak dan mendatar memakai skala yang sama", () => {
  near(courtX(1) - courtX(0), courtY(1) - courtY(0));
});

test("gaya hambat tumbuh dengan kuadrat laju", () => {
  const satu = dragForce(10, 0.32, 2.2);
  const dua = dragForce(20, 0.32, 2.2);
  assert.ok(Math.abs(dua / satu - 4) < 1e-9);
  assert.ok(Math.abs(satu - 0.5 * 1.2 * 0.32 * 2.2 * 100) < 1e-9);
});

test("di laju maksimum dorongan mesin persis mengimbangi hambatan", () => {
  const thrust = 480;
  const v = topSpeed(thrust, 0.32, 2.2);
  assert.ok(Math.abs(dragForce(v, 0.32, 2.2) - thrust) < 1e-9);
});

test("bodi yang lebih licin menaikkan laju maksimum", () => {
  assert.ok(topSpeed(480, 0.24, 2.2) > topSpeed(480, 0.42, 2.2));
});

test("wavelengthRgb: the band reads red at one end and blue at the other", () => {
  const [r, g, b] = wavelengthRgb(650);
  assert.ok(r > 0.9 && g < 0.1 && b === 0, `650 nm -> ${r},${g},${b}`);

  const blue = wavelengthRgb(460);
  assert.ok(blue[2] > 0.9 && blue[0] === 0);

  assert.ok(wavelengthRgb(520)[1] > 0.9, "520 nm should be green");
  assert.deepEqual(wavelengthRgb(900), [0, 0, 0]);

  for (const nm of [400, 450, 500, 550, 600, 650, 700]) {
    for (const c of wavelengthRgb(nm)) assert.ok(c >= 0 && c <= 1, `${nm} nm out of gamut`);
  }
});
