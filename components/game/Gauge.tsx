"use client";

import { Html, Line } from "@react-three/drei";
import type { Gauge } from "@/lib/levels";

const HEIGHT = 3.2;

export function LinearScale({
  gauge,
  target,
  position = [0, 0, 0],
  tint = "#cbb08a",
}: {
  gauge: Gauge;
  target: number;
  position?: [number, number, number];
  tint?: string;
}) {
  const max = gauge.max ?? target * 2;
  const ticks = Math.round(max / gauge.tick);
  const at = (v: number) => 0.4 + (v / max) * HEIGHT;

  return (
    <group position={position}>
      <mesh position={[0, 0.4 + HEIGHT / 2, 0]}>
        <boxGeometry args={[0.07, HEIGHT, 0.07]} />
        <meshStandardMaterial color="#6b7681" roughness={0.6} metalness={0.3} />
      </mesh>

      {Array.from({ length: ticks }, (_, i) => i + 1).map((n) => {
        const major = n % gauge.major === 0;
        return (
          <mesh key={n} position={[major ? 0.26 : 0.17, at(n * gauge.tick), 0]}>
            <boxGeometry args={[major ? 0.52 : 0.34, 0.04, 0.04]} />
            <meshStandardMaterial
              color="#8b949c"
              emissive="#8b949c"
              emissiveIntensity={major ? 0.35 : 0.12}
              roughness={0.7}
            />
          </mesh>
        );
      })}

      <group position={[0, at(target), 0]}>
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.8, 0.08, 0.08]} />
          <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0.82, 0, 0]}>
          <coneGeometry args={[0.11, 0.28, 12]} />
          <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.9} />
        </mesh>
        <pointLight color={tint} intensity={4} distance={5} />
      </group>
    </group>
  );
}

export function SpanRule({
  gauge,
  target,
  unitsPer,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  tint = "#cbb08a",
}: {
  gauge: Gauge;
  target: number;
  unitsPer: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  tint?: string;
}) {
  const max = gauge.max ?? target * 2;
  const ticks = Math.round(max / gauge.tick);
  const span = target * unitsPer;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, (max * unitsPer) / 2, 0]}>
        <boxGeometry args={[0.05, max * unitsPer, 0.05]} />
        <meshStandardMaterial color="#6b7681" roughness={0.6} />
      </mesh>

      {Array.from({ length: ticks + 1 }, (_, i) => i).map((n) => {
        const major = n % gauge.major === 0;
        return (
          <mesh key={n} position={[major ? 0.19 : 0.12, n * gauge.tick * unitsPer, 0]}>
            <boxGeometry args={[major ? 0.38 : 0.24, 0.035, 0.035]} />
            <meshStandardMaterial
              color="#8b949c"
              emissive="#8b949c"
              emissiveIntensity={major ? 0.35 : 0.12}
              roughness={0.7}
            />
          </mesh>
        );
      })}

      <group position={[-0.35, 0, 0]}>
        <mesh position={[0, span / 2, 0]}>
          <boxGeometry args={[0.06, span, 0.06]} />
          <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.8} />
        </mesh>
        {[0, span].map((y) => (
          <mesh key={y} position={[0.18, y, 0]}>
            <boxGeometry args={[0.42, 0.07, 0.07]} />
            <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.8} />
          </mesh>
        ))}
        <pointLight position={[0, span / 2, 0.4]} color={tint} intensity={4} distance={5} />
      </group>
    </group>
  );
}

export function Dim({
  from,
  to,
  label,
  tint = "#7fa9c9",
}: {
  from: [number, number, number];
  to: [number, number, number];
  label: string;
  tint?: string;
}) {
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2,
  ];

  return (
    <group>
      <Line points={[from, to]} color={tint} lineWidth={1.5} dashed dashSize={0.35} gapSize={0.25} />
      {[from, to].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
      <Html position={mid} center distanceFactor={14} zIndexRange={[20, 0]}>
        <span
          className="hud whitespace-nowrap px-2 py-1 font-mono text-[11px] tabular-nums"
          style={{ color: tint, borderColor: tint, pointerEvents: "none" }}
        >
          {label}
        </span>
      </Html>
    </group>
  );
}
