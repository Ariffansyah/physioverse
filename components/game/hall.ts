export const HALL = { halfX: 24, halfZ: 8, wallH: 14 };
export const BOUNDS = { x: HALL.halfX - 1, z: HALL.halfZ - 1 };
export const EYE = 1.7;

export const SPAWN: [number, number, number] = [-22, EYE, 2.6];

import type { Level } from "@/lib/levels";

export type Lockable = { lock: () => void; unlock: () => void };

export type ChamberProps = {
  level: Level;
  params: Record<string, number>;
  runToken: number;
  onFinish: (value: number) => void;
  onInteract?: () => void;
};
