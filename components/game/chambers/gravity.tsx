"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Mesh } from "three";
import { CHAMBERS, ORBIT } from "@/lib/levels";
import { MU, circularSpeed, orbitPeriod } from "@/lib/physics";
import { Dim, LinearScale } from "../Gauge";
import type { ChamberProps } from "../hall";

const { scale: S, centreY: CY } = ORBIT;
const TIMEOUT = 26;

function pull(x: number, y: number): [number, number] {
  const r2 = x * x + y * y;
  const k = -MU / (r2 * Math.sqrt(r2));
  return [k * x, k * y];
}

export default function Gravity({ level, params, runToken, onFinish, onInteract }: ChamberProps) {
  const tint = CHAMBERS[level.chamber].tint;

  const r0 = params.radius;
  const v0 = level.marker === undefined ? circularSpeed(r0) : params.speed;

  const body = useRef<Mesh>(null);
  const pos = useRef({ x: r0, y: 0 });
  const vel = useRef({ x: 0, y: v0 });
  const t = useRef(0);
  const rising = useRef(false);
  const live = useRef(false);

  useEffect(() => {
    t.current = 0;
    rising.current = false;
    live.current = runToken > 0;
    pos.current = { x: r0, y: 0 };
    vel.current = { x: 0, y: v0 };
    body.current?.position.set(r0 * S, 0, 0);
  }, [runToken, r0, v0]);

  useFrame((_, dt) => {
    if (!live.current || !body.current) return;
    const frame = Math.min(dt, 1 / 30);
    t.current += frame;

    const before = Math.hypot(pos.current.x, pos.current.y);
    const h = frame / 4;

    for (let i = 0; i < 4; i++) {
      const [ax, ay] = pull(pos.current.x, pos.current.y);
      pos.current.x += vel.current.x * h + 0.5 * ax * h * h;
      pos.current.y += vel.current.y * h + 0.5 * ay * h * h;
      const [bx, by] = pull(pos.current.x, pos.current.y);
      vel.current.x += 0.5 * (ax + bx) * h;
      vel.current.y += 0.5 * (ay + by) * h;
    }

    const after = Math.hypot(pos.current.x, pos.current.y);
    body.current.position.set(pos.current.x * S, pos.current.y * S, 0);

    if (level.marker === undefined) {
      if (t.current >= orbitPeriod(r0)) {
        live.current = false;
        onFinish(level.solve(params));
      }
      return;
    }

    if (after > before) rising.current = true;
    if ((rising.current && after < before) || t.current > TIMEOUT) {
      live.current = false;
      onFinish(level.solve(params));
    }
  });

  const rings = Array.from(
    { length: Math.round((level.gauge.max ?? 24) / level.gauge.tick) },
    (_, i) => (i + 1) * level.gauge.tick,
  );

  return (
    <group
      position={[0, CY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onInteract?.();
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <mesh>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial color="#141a21" roughness={0.35} metalness={0.75} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.02, 32, 32]} />
        <meshStandardMaterial
          color={tint}
          emissive={tint}
          emissiveIntensity={1.2}
          transparent
          opacity={0.14}
        />
      </mesh>
      <pointLight color={tint} intensity={16} distance={26} />

      {rings.map((r) => {
        const target = level.marker !== undefined && Math.abs(r - level.marker) < 1e-9;
        return (
          <mesh key={r}>
            <ringGeometry args={[r * S - 0.02, r * S + 0.02, 128]} />
            <meshStandardMaterial
              color={target ? "#cbb08a" : "#6b7681"}
              emissive={target ? "#cbb08a" : "#6b7681"}
              emissiveIntensity={target ? 1.6 : 0.5}
              toneMapped={false}
              transparent
              opacity={target ? 0.95 : 0.45}
              side={2}
            />
          </mesh>
        );
      })}

      <Dim
        from={[0, 0, 0]}
        to={[r0 * S, 0, 0]}
        label={`r = ${r0.toFixed(2)} m dari pusat massa`}
        tint="#7fa9c9"
      />


      {level.marker === undefined && (
        <LinearScale
          gauge={level.gauge}
          target={level.goal.target}
          position={[-11, -CY, 4]}
          tint={tint}
        />
      )}

      <mesh ref={body} position={[r0 * S, 0, 0]}>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshStandardMaterial color="#e4e8ea" emissive="#7fa9c9" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
    </group>
  );
}
