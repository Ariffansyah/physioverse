import {
  basketballHeight,
  fringeSpacing,
  glbb,
  optics,
  orbitPeriod,
  projectile,
} from "./physics.ts";

export type ChamberKey = "ballistics" | "photonics" | "kinetics" | "quantum" | "gravity" | "court";

export const BAY = { origin: -19, scale: 0.55 };
export const BENCH = { objectX: -10, objectH: 1 };
export const RAIL = { length: 20, scale: 0.8 };
export const SLIT = { maskX: -6, unitsPerMetre: 4, screenMm: 30 };
export const ORBIT = { scale: 0.35, centreY: 9 };
export const COURT = { origin: -18, scale: 0.9, releaseH: 2.0, hoopH: 3.0 };

export const courtX = (metres: number) => COURT.origin + metres * COURT.scale;
export const courtY = (metres: number) => metres * COURT.scale + 0.08;

export type Control = {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
};

export type Gauge = {
  tick: number;
  major: number;
  max?: number;
};

export type Level = {
  id: string;
  chamber: ChamberKey;
  name: string;
  brief: string;
  objective: string;
  controls: Control[];
  defaults: Record<string, number>;
  solve: (p: Record<string, number>) => number;
  goal: { label: string; unit: string; target: number; tolerance: number };
  gauge: Gauge;
  clue: { relation: string; given: string[]; hint: string };
  marker?: number;
  xp: number;
};

export const CHAMBERS: Record<ChamberKey, { name: string; tint: string; blurb: string }> = {
  ballistics: {
    name: "Ballistic Bay",
    tint: "#f0b463",
    blurb: "Terowongan uji balistik. Lintasan parabola, tanpa hambatan udara.",
  },
  court: {
    name: "Hoops Court",
    tint: "#f79a42",
    blurb: "Lapangan basket fisika - atur bola langsung, lihat jarak ke ring.",
  },
  photonics: {
    name: "Photon Hall",
    tint: "#5fb8ef",
    blurb: "Bangku optik sepanjang 20 meter dengan lensa yang bisa digeser.",
  },
  kinetics: {
    name: "Kinetic Rail",
    tint: "#6fd49a",
    blurb: "Rel magnetik 20 meter dengan gerbang pengukur di ujungnya.",
  },
  quantum: {
    name: "Quantum Well",
    tint: "#8fb0f2",
    blurb: "Sumber foton tunggal, dua celah dan layar bergraduasi.",
  },
  gravity: {
    name: "Orbit Well",
    tint: "#b9c6d6",
    blurb: "Satu massa pusat dan cincin penanda konsentris.",
  },
};

export const LEVELS: Level[] = [
  {
    id: "bay-01",
    chamber: "ballistics",
    name: "Kalibrasi Meriam",
    brief: "Meriam di ujung terowongan. Jarak cincin target tertulis di lantai, baca dan hitung jatuhnya.",
    objective: "Jarak cincin 20 m dari meriam. Atur sudut dan tenaga agar peluru jatuh di ring.",
    controls: [
      { key: "angle", label: "Sudut Elevasi θ", unit: "°", min: 10, max: 80, step: 0.5 },
      { key: "speed", label: "Kecepatan Awal v₀", unit: "m/s", min: 5, max: 25, step: 0.5 },
    ],
    defaults: { angle: 30, speed: 11 },
    solve: (p) => projectile(p.speed, p.angle).range,
    clue: {
      relation: "R = v² · sin(2θ) / g",
      given: ["g = 9.80 m/s²", "Tiang penanda tiap 5.0 m", "Jarak target 20 m"],
      hint: "Coba 45° dulu, sin 2θ = 1, cari v.",
    },
    goal: { label: "Jangkauan R", unit: "m", target: 20, tolerance: 1 },
    gauge: { tick: 5, major: 2 },
    marker: 20,
    xp: 100,
  },
  {
    id: "court-01",
    chamber: "court",
    name: "Free Throw",
    brief: "Bola basket di lapangan. Ubah tinggi lepas, sudut, dan tenaga. Jarak ke ring 8 m, tinggi ring 3.0 m.",
    objective: "Ring di 8.0 m, tinggi ring 3.0 m. Atur bola agar lewat ring.",
    controls: [
      { key: "h0", label: "Tinggi Lepas h₀", unit: "m", min: 1.4, max: 2.6, step: 0.1 },
      { key: "angle", label: "Sudut Lempar θ", unit: "°", min: 20, max: 75, step: 0.5 },
      { key: "speed", label: "Kecepatan Lempar v₀", unit: "m/s", min: 6, max: 16, step: 0.1 },
    ],
    defaults: { h0: 2.0, angle: 45, speed: 9 },
    solve: (p) => basketballHeight(p.speed, p.angle, 8, p.h0 ?? 2.0),
    clue: {
      relation: "y = h₀ + x·tanθ − g·x² / (2v²cos²θ)",
      given: ["h₀ atur sendiri", "x = 8.0 m jarak ring", "g = 9.8 m/s²", "Target y = 3.0 m di ring"],
      hint: "Masukkan h₀ dan θ, cari v yang bikin y = 3.0 di x = 8.",
    },
    goal: { label: "Tinggi Bola di Ring y", unit: "m", target: 3.0, tolerance: 0.25 },
    gauge: { tick: 0.5, major: 2, max: 4 },
    marker: 8,
    xp: 110,
  },
  {
    id: "hall-01",
    chamber: "photonics",
    name: "Fokuskan Berkas",
    brief: "Bangku optik 20 m. Lensa bisa digeser. Posisi detektor terbaca di mistar lantai.",
    objective: "Detektor di 6 m dari benda. Atur posisi lensa agar bayangan jatuh di detektor.",
    controls: [{ key: "lensX", label: "Posisi Lensa x", unit: "m", min: -6, max: 6, step: 0.05 }],
    defaults: { lensX: -4, focal: 3 },
    solve: (p) => optics(p.lensX, BENCH.objectX, p.focal ?? 3, BENCH.objectH).imageX,
    clue: {
      relation: "1/f = 1/s + 1/s', lalu x_bayangan = x_lensa + s'",
      given: ["Benda di x = -10.0 m", "f = 3.0 m", "Target bayangan di x = 6 m"],
      hint: "Hitung s = x_lensa - x_benda, cari s' lalu x bayangan.",
    },
    goal: { label: "Posisi Bayangan x'", unit: "m", target: 6, tolerance: 0.3 },
    gauge: { tick: 2, major: 1 },
    marker: 6,
    xp: 140,
  },
  {
    id: "rail-01",
    chamber: "kinetics",
    name: "Gerbang Kecepatan",
    brief: "Rel 20 m. Gerbang di ujung butuh kecepatan 12 m/s untuk terbuka.",
    objective: "Panjang rel 20 m. Atur kecepatan awal dan percepatan agar lewat gerbang 12 m/s.",
    controls: [
      { key: "v0", label: "Kecepatan Awal v₀", unit: "m/s", min: 0, max: 10, step: 0.05 },
      { key: "accel", label: "Percepatan a", unit: "m/s²", min: 0, max: 5, step: 0.05 },
    ],
    defaults: { v0: 3, accel: 1 },
    solve: (p) => glbb(p.v0, p.accel, RAIL.length).finalV,
    clue: {
      relation: "v² = v₀² + 2 · a · s",
      given: ["s = 20.0 m", "Target v = 12 m/s di ujung"],
      hint: "Pilih a, hitung v₀, atau sebaliknya. Tidak perlu waktu.",
    },
    goal: { label: "Kecepatan Akhir vₜ", unit: "m/s", target: 12, tolerance: 0.4 },
    gauge: { tick: 1, major: 5, max: 20 },
    xp: 160,
  },
  {
    id: "well-01",
    chamber: "quantum",
    name: "Jarak Pita",
    brief: "Dua celah dan layar. Jarak antar pita terang 5 mm yang diminta.",
    objective: "Target pita 5 mm. Atur jarak celah dan jarak layar.",
    controls: [
      { key: "slit", label: "Jarak Celah d", unit: "mm", min: 0.05, max: 0.5, step: 0.005 },
      { key: "screen", label: "Jarak Layar L", unit: "m", min: 0.5, max: 3, step: 0.05 },
    ],
    defaults: { slit: 0.3, screen: 1, wavelength: 550 },
    solve: (p) => fringeSpacing(p.wavelength ?? 550, p.screen, p.slit) * 1000,
    clue: {
      relation: "Δy = λ · L / d",
      given: ["λ = 550 nm tetap", "Target Δy = 5 mm"],
      hint: "Perhatikan satuan: λ nm, d mm, L m, hasil mm.",
    },
    goal: { label: "Jarak Antar Pita Δy", unit: "mm", target: 5, tolerance: 0.3 },
    gauge: { tick: 1, major: 5, max: 15 },
    xp: 200,
  },
  {
    id: "orbit-01",
    chamber: "gravity",
    name: "Orbit Lingkar",
    brief: "Orbit lingkar. Periode target 12 s. Pilih jari jari yang pas.",
    objective: "Massa pusat μ = 200. Atur jari jari agar periode 12 s.",
    controls: [{ key: "radius", label: "Jari-jari Orbit r", unit: "m", min: 4, max: 16, step: 0.05 }],
    defaults: { radius: 6 },
    solve: (p) => orbitPeriod(p.radius),
    clue: {
      relation: "T = 2π · √(r³ / μ)",
      given: ["μ = 200 m³/s²", "Target T = 12 s"],
      hint: "Balik rumus untuk r. Tidak perlu nebak.",
    },
    goal: { label: "Periode Orbit T", unit: "s", target: 12, tolerance: 0.15 },
    gauge: { tick: 0.5, major: 2, max: 20 },
    xp: 240,
  },
];

export const getLevel = (id: string) => LEVELS.find((l) => l.id === id);

export const isSolved = (level: Level, value: number) =>
  Number.isFinite(value) && Math.abs(value - level.goal.target) <= level.goal.tolerance;

export function sanitizeParams(level: Level, raw: unknown): Record<string, number> {
  const input = (raw ?? {}) as Record<string, unknown>;
  const params = { ...level.defaults };
  for (const c of level.controls) {
    const v = Number(input[c.key]);
    if (Number.isFinite(v)) params[c.key] = Math.min(c.max, Math.max(c.min, v));
  }
  return params;
}

export const RANKS = [
  { at: 0, title: "Cadet" },
  { at: 250, title: "Field Technician" },
  { at: 500, title: "Lab Engineer" },
  { at: 800, title: "Senior Physicist" },
  { at: 1060, title: "Verse Architect" },
] as const;

export const rankFor = (xp: number) => [...RANKS].reverse().find((r) => xp >= r.at)!.title;
