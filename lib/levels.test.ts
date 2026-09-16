import assert from "node:assert/strict";
import { test } from "node:test";
import { LEVELS, closest, isSolved, sanitizeParams, sensitivity, type Level } from "./levels.ts";
import { canPractice, practiceLevel } from "./practice.ts";

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


for (const level of LEVELS) {
  test(`${level.id} sensitivity menunjuk arah yang benar dari default`, () => {
    const senses = sensitivity(level, level.defaults);
    assert.equal(senses.length, level.controls.length);

    const base = level.solve(level.defaults);
    const need = level.goal.target - base;
    const top = senses[0]!;
    assert.ok(Math.abs(top.per) > 0, `${top.key} tidak berpengaruh sama sekali`);

    const c = level.controls.find((x) => x.key === top.key)!;
    const dir = top.per * need > 0 ? 1 : -1;
    const moved = Math.min(c.max, Math.max(c.min, level.defaults[top.key] + dir * c.step));
    if (moved !== level.defaults[top.key]) {
      const after = level.solve({ ...level.defaults, [top.key]: moved });
      assert.ok(
        Math.abs(level.goal.target - after) < Math.abs(need),
        `${level.id}: ${top.key} ke ${moved} malah menjauh (${base} -> ${after})`,
      );
    }
  });
}


test("closest menunjuk percobaan terdekat, termasuk kalau targetnya negatif", () => {
  const bay = LEVELS.find((l) => l.id === "bay-01")!;
  assert.equal(closest(bay, [18.2, 22.4, 19.9]), 2);
  assert.equal(closest(bay, [19.9, 22.4, 18.2]), 0);
  assert.equal(closest(bay, [25]), 0);
  assert.equal(closest(bay, []), -1);

  const hall = LEVELS.find((l) => l.id === "hall-02")!;
  assert.equal(hall.goal.target < 0, true);
  assert.equal(closest(hall, [-1.2, -2.1, -3.4]), 1);

  assert.equal(closest(bay, [Infinity, 21]), 1);
});


for (const level of LEVELS) {
  test(`${level.id} latihan: targetnya beda, tetap bisa diselesaikan`, () => {
    if (!canPractice(level)) {
      assert.equal(practiceLevel(level, 1), null, `${level.id} seharusnya ditolak`);
      return;
    }

    for (const seed of [1, 7, 4242]) {
      const p = practiceLevel(level, seed)!;
      assert.ok(p, `${level.id} seed ${seed} tidak menghasilkan apa-apa`);

      const t = p.goal.target;
      assert.notEqual(t, level.goal.target, "targetnya sama dengan aslinya");
      assert.ok(
        Math.abs(t / level.gauge.tick - Math.round(t / level.gauge.tick)) < 1e-6,
        `${t} bukan kelipatan ${level.gauge.tick}, tiang penandanya jadi bohong`,
      );
      assert.equal(p.xp, 0, "latihan tidak boleh memberi XP");
      assert.equal(p.marker === undefined, level.marker === undefined);
      if (p.marker !== undefined) assert.equal(p.marker, t, "penanda tidak ikut pindah");

      assert.ok(p.clue.given.at(-1)!.includes(String(t)));
      assert.equal(p.clue.relation, level.clue.relation);

      assert.equal(isSolved(p, p.solve(p.defaults)), false, "lolos cuma dengan default");
      let ok = false;
      for (const params of grid(p)) {
        if (isSolved(p, p.solve(params))) {
          ok = true;
          break;
        }
      }
      assert.ok(ok, `${level.id} seed ${seed}: target ${t} tidak terjangkau slider`);
    }
  });
}

test("seed yang sama memberi misi latihan yang sama", () => {
  const bay = LEVELS.find((l) => l.id === "bay-01")!;
  assert.equal(practiceLevel(bay, 99)!.goal.target, practiceLevel(bay, 99)!.goal.target);
  const targets = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((n) => practiceLevel(bay, n)!.goal.target));
  assert.ok(targets.size > 1, "delapan seed memberi target yang itu-itu saja");
});
