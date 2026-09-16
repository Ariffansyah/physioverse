import { CHAMBERS, type ChamberKey } from "@/lib/levels";

/** One body per test chamber, in chamber order: the menus all point at these. */
const ORBITS = [
  { r: 2.3, size: 0.2, speed: 0.3, tilt: 0.45, roll: 0.1, phase: 0.4, spin: 0.5, ring: false },
  { r: 3.0, size: 0.16, speed: 0.24, tilt: -0.28, roll: -0.2, phase: 2.1, spin: -0.35, ring: false },
  { r: 3.8, size: 0.34, speed: 0.19, tilt: 0.22, roll: 0.26, phase: 4.4, spin: 0.22, ring: true },
  { r: 4.7, size: 0.22, speed: 0.15, tilt: -0.5, roll: 0.05, phase: 1.2, spin: 0.4, ring: false },
  { r: 5.5, size: 0.25, speed: 0.13, tilt: 0.3, roll: -0.12, phase: 0.9, spin: -0.28, ring: false },
  { r: 6.4, size: 0.28, speed: 0.11, tilt: 0.16, roll: -0.3, phase: 5.6, spin: -0.18, ring: false },
  { r: 7.4, size: 0.18, speed: 0.09, tilt: -0.2, roll: 0.18, phase: 3.0, spin: 0.3, ring: true },
];

// Plain data on purpose: the menus read it too, and must not drag three.js in.
export const PLANETS = (Object.keys(CHAMBERS) as ChamberKey[]).map((key, i) => ({
  chamber: key,
  name: CHAMBERS[key].name,
  color: CHAMBERS[key].tint,
  ...ORBITS[i],
}));

export const planetOf = (key: ChamberKey) => PLANETS.findIndex((p) => p.chamber === key);
