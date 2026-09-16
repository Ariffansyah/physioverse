"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";
import type { Level } from "@/lib/levels";
import { pushOut } from "@/lib/collide";
import { solidsFor } from "./solids";
import { BOUNDS, EYE, SPAWN } from "./hall";

const WALK = 6.5;
const SPRINT = 11;
const UP = new Vector3(0, 1, 0);
const BODY_R = 0.42;

export function Player({ active, level }: { active: boolean; level: Level; onNear?: (near: boolean) => void }) {
  const solids = useMemo(() => solidsFor(level), [level]);
  const keys = useRef(new Set<string>());
  const bob = useRef(0);
  const spawned = useRef(false);

  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const step = useRef(new Vector3());

  useEffect(() => {
    const down = (e: KeyboardEvent) => keys.current.add(e.code);
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const clear = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  useFrame(({ camera }, dt) => {
    if (!spawned.current) {
      spawned.current = true;
      camera.position.set(...SPAWN);
      camera.rotation.set(0, -Math.PI / 2, 0, "YXZ");
    }

    const k = keys.current;
    const ahead = (k.has("KeyW") ? 1 : 0) - (k.has("KeyS") ? 1 : 0);
    const side = (k.has("KeyD") ? 1 : 0) - (k.has("KeyA") ? 1 : 0);

    if (active && (ahead || side)) {
      camera.getWorldDirection(forward.current);
      forward.current.y = 0;
      forward.current.normalize();
      right.current.crossVectors(forward.current, UP).normalize();

      const speed = (k.has("ShiftLeft") ? SPRINT : WALK) * Math.min(dt, 0.05);
      step.current
        .set(0, 0, 0)
        .addScaledVector(forward.current, ahead)
        .addScaledVector(right.current, side)
        .normalize()
        .multiplyScalar(speed);

      camera.position.x = clamp(camera.position.x + step.current.x, -BOUNDS.x, BOUNDS.x);
      camera.position.z = clamp(camera.position.z + step.current.z, -BOUNDS.z, BOUNDS.z);
      pushOut(camera.position, BODY_R, solids, EYE);
      bob.current += speed * 2.2;
    } else {
      bob.current += dt * 0.6;
    }

    camera.position.y = EYE + Math.sin(bob.current) * 0.045;
  });

  return null;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
