import assert from "node:assert/strict";
import { test } from "node:test";
import { LEVELS, isSolved, sanitizeParams, type Level } from "./levels.ts";

function* grid(level: Level): Generator<Record<string, number>> {
  const ctrls = level.controls;
  const steps = (c: (typeof level.controls)[number]) =>
    Array.from(
      { length: Math.round((c.max - c.min) / c.step) + 1 },
      (_, i) => c.min + i * c.step,
    );
  const lists = ctrls.map(steps);
  function* rec(
    idx: number,
    cur: Record<string, number>,
  ): Generator<Record<string, number>> {
    if (idx === ctrls.length) {
      yield { ...level.defaults, ...cur };
      return;
    }
    for (const v of lists[idx]!) {
      cur[ctrls[idx]!.key] = v;
      yield* rec(idx + 1, cur);
    }
  }
  yield* rec(0, {});
}

for (const level of LEVELS) {
  test(`${level.id} bisa diselesaikan dengan slider yang tersedia`, () => {
    let best = Infinity;
    for (const params of grid(level)) {
      const value = level.solve(params);
      if (!Number.isFinite(value)) continue;
      best = Math.min(best, Math.abs(value - level.goal.target));
      if (isSolved(level, value)) return;
    }
    assert.fail(`tidak terjangkau; selisih terbaik ${best.toFixed(3)}`);
  });

  test(`${level.id} targetnya jatuh tepat di satu garis skala`, () => {
    const steps = level.goal.target / level.gauge.tick;
    assert.ok(
      Math.abs(steps - Math.round(steps)) < 1e-9,
      `${level.goal.target} bukan kelipatan ${level.gauge.tick}`,
    );
  });

  test(`${level.id} tidak lolos dengan parameter default`, () => {
    assert.equal(isSolved(level, level.solve(level.defaults)), false);
  });
}

test("sanitizeParams menjepit nilai liar dari browser", () => {
  const level = LEVELS[0];
  const p = sanitizeParams(level, { angle: 9999, speed: -50, hack: 1 });
  assert.equal(p.angle, 80);
  assert.equal(p.speed, 5);
  assert.equal("hack" in p, false);
});

test("sanitizeParams jatuh ke default kalau bukan angka", () => {
  const level = LEVELS[0];
  assert.deepEqual(
    sanitizeParams(level, { angle: "abc" }).angle,
    level.defaults.angle,
  );
  assert.deepEqual(sanitizeParams(level, null), level.defaults);
});
