import assert from "node:assert/strict";
import { test } from "node:test";
import { box, nudge, pushOut, stepBody, touches, type Body } from "./collide.ts";

const wall = box(0, 1, 0, 0.2, 1, 2);

test("pemain terdorong keluar lewat sumbu tersempit", () => {
  const p = { x: 0.1, y: 1.7, z: 0 };
  pushOut(p, 0.4, [wall], 1.7);
  assert.ok(Math.abs(p.x - 0.6) < 1e-9, `di ${p.x}, harusnya hx + radius`);
  assert.equal(p.z, 0, "sumbu z yang tembusnya lebih dalam tidak ikut digeser");
});

test("kotak di atas kepala dilewati begitu saja", () => {
  const p = { x: 0, y: 1.7, z: 0 };
  pushOut(p, 0.4, [box(0, 6, 0, 1, 1, 1)], 1.7);
  assert.deepEqual(p, { x: 0, y: 1.7, z: 0 });
});

test("bola jatuh berhenti tepat di atas lantai", () => {
  const b: Body = { p: { x: 0, y: 5, z: 0 }, v: { x: 0, y: 0, z: 0 }, r: 0.3 };
  for (let i = 0; i < 600; i++) stepBody(b, 1 / 60, { floorY: 0.5 });
  assert.ok(Math.abs(b.p.y - 0.8) < 1e-6, `berhenti di ${b.p.y}`);
  assert.equal(b.v.y, 0);
});

test("bola memantul balik dari kotak dan kehilangan energi", () => {
  const b: Body = { p: { x: -0.45, y: 1, z: 0 }, v: { x: 6, y: 0, z: 0 }, r: 0.2 };
  stepBody(b, 1 / 60, { boxes: [wall], restitution: 0.5 });
  assert.ok(b.v.x < 0, "arah x berbalik");
  assert.ok(Math.abs(b.v.x) < 6, "kecepatannya berkurang");
  assert.ok(b.p.x <= -0.4 + 1e-9, "dikembalikan ke luar kotak");
});

test("touches sejalan dengan pantulan stepBody", () => {
  assert.equal(touches(0, 1, 0, 0.2, [wall]), true);
  assert.equal(touches(3, 1, 0, 0.2, [wall]), false);
});

test("senggolan pemain mendorong bola menjauh", () => {
  const b: Body = { p: { x: 1, y: 0.3, z: 0 }, v: { x: 0, y: 0, z: 0 }, r: 0.3 };
  nudge(b, { x: 0.6, y: 1.7, z: 0 });
  assert.ok(b.v.x > 0, "terdorong menjauh dari pemain");
  nudge(b, { x: 9, y: 1.7, z: 0 });
  assert.equal(b.v.x, 3.5, "pemain jauh tidak berpengaruh");
});
