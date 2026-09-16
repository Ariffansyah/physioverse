import { isSolved, type Level } from "./levels.ts";

export const canPractice = (level: Level) =>
  level.marker === undefined || level.marker === level.goal.target;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function reachable(level: Level): number[] {
  const CAP = 18;
  const axes = level.controls.map((c) => {
    const steps = Math.max(Math.round((c.max - c.min) / c.step), 1);
    const take = Math.min(steps, CAP);
    return Array.from({ length: take + 1 }, (_, i) => c.min + ((steps * i) / take) * c.step);
  });

  const out: number[] = [];
  const walk = (i: number, p: Record<string, number>) => {
    if (i === axes.length) {
      const v = level.solve(p);
      if (Number.isFinite(v)) out.push(v);
      return;
    }
    for (const v of axes[i]!) walk(i + 1, { ...p, [level.controls[i]!.key]: v });
  };
  walk(0, { ...level.defaults });
  return out;
}

const STATES_GOAL = /target|sasaran/i;

export function practiceLevel(base: Level, seed: number): Level | null {
  if (!canPractice(base)) return null;

  const values = reachable(base);
  if (values.length === 0) return null;

  const tick = base.gauge.tick;
  const tol = base.goal.tolerance;
  const lo = Math.min(...values);
  const hi = Math.max(...values);

  const cands: number[] = [];
  for (let t = Math.ceil(lo / tick) * tick; t <= hi + 1e-9; t += tick) {
    const target = Number(t.toFixed(6));
    if (target === base.goal.target) continue;
    if (base.gauge.max !== undefined && Math.abs(target) > base.gauge.max) continue;
    if (Math.sign(target) !== Math.sign(base.goal.target)) continue;
    const size = Math.abs(target) / Math.abs(base.goal.target);
    if (size < 0.4 || size > 2.5) continue;
    const probe = { ...base, goal: { ...base.goal, target } };
    if (isSolved(probe, base.solve(base.defaults))) continue;
    if (values.some((v) => Math.abs(v - target) <= tol)) cands.push(target);
  }
  if (cands.length === 0) return null;

  const target = cands[Math.floor(mulberry32(seed)() * cands.length)]!;
  const unit = base.goal.unit;

  return {
    ...base,
    id: `${base.id}-bonus`,
    name: `${base.name} · Bonus`,
    brief: `Ruang, alat, dan rumusnya sama seperti ${base.name}. Yang diacak cuma angkanya, jadi tidak ada jawaban yang bisa dihafal. Misi bonus tidak dicatat dan tidak memberi XP.`,
    objective: `${base.goal.label} harus ${target} ${unit}, boleh meleset ±${tol} ${unit}.`,
    goal: { ...base.goal, target },
    marker: base.marker === undefined ? undefined : target,
    clue: {
      ...base.clue,
      given: [
        ...base.clue.given.filter((g) => !STATES_GOAL.test(g)),
        `Target ${base.goal.label} ${target} ${unit}`,
      ],
    },
    xp: 0,
  };
}
