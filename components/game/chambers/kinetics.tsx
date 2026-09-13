"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Mesh } from "three";
import { RAIL } from "@/lib/levels";
import { glbb } from "@/lib/physics";
import { Dim, LinearScale } from "../Gauge";
import type { ChamberProps } from "../hall";

const { length: D, scale: S } = RAIL;
const START = -(D * S) / 2;
const STALLED_BEAT = 1.5;

export default function Kinetics({ level, params, runToken, onFinish, onInteract }: ChamberProps) {
  const { duration } = glbb(params.v0, params.accel, D);
  const runTime = Number.isFinite(duration) ? duration : STALLED_BEAT;

  const cart = useRef<Mesh>(null);
  const t = useRef(0);
  const live = useRef(false);

  useEffect(() => {
    t.current = 0;
    live.current = runToken > 0;
    cart.current?.position.setX(START);
  }, [runToken]);

  useFrame((_, dt) => {
    if (!live.current || !cart.current) return;
    t.current += dt;

    const x = Math.min(params.v0 * t.current + 0.5 * params.accel * t.current ** 2, D);
    cart.current.position.setX(START + x * S);

    if (t.current >= runTime) {
      live.current = false;
      onFinish(level.solve(params));
    }
  });

  return (
    <group>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[D * S, 0.3, 2]} />
        <meshStandardMaterial color="#0a0e12" metalness={0.7} roughness={0.4} />
      </mesh>
      {[-0.6, 0.6].map((z) => (
        <mesh key={z} position={[0, 0.33, z]}>
          <boxGeometry args={[D * S, 0.08, 0.12]} />
          <meshStandardMaterial color="#9fb3a6" emissive="#9fb3a6" emissiveIntensity={0.3} roughness={0.7} />
        </mesh>
      ))}

      <Gate x={START} color="#e4e8ea" />
      <Gate x={-START} color="#9fb3a6" />

      <LinearScale
        gauge={level.gauge}
        target={level.goal.target}
        position={[-START + 1.1, 0, 1.9]}
      />

      <mesh
        ref={cart}
        position={[START, 0.8, 0]}
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
        <boxGeometry args={[1.1, 0.8, 1.3]} />
        <meshStandardMaterial
          color="#1a222b"
          emissive="#9fb3a6"
          emissiveIntensity={0.8 + params.accel * 0.25}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <group position={[START - 0.7, 0.8, 0]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[ -i * 0.18, 0, 0]}>
            <boxGeometry args={[0.12, 0.22, 0.9]} />
            <meshBasicMaterial
              color={i < params.accel ? "#ff8c2a" : "#1a222b"}
              transparent
              opacity={i < params.accel ? 0.7 : 0.18}
            />
          </mesh>
        ))}
      </group>
      <Dim
        from={[START, 0.5, -1.8]}
        to={[-START, 0.5, -1.8]}
        label={`s = ${D.toFixed(1)} m dari gerbang ke gerbang`}
        tint="#cbb08a"
      />

    </group>
  );
}

function Gate({ x, color }: { x: number; color: string }) {
  return (
    <group position={[x, 0, 0]}>
      {[-1.3, 1.3].map((z) => (
        <mesh key={z} position={[0, 1.6, z]}>
          <boxGeometry args={[0.2, 3.2, 0.2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[0.2, 0.2, 2.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} roughness={0.6} />
      </mesh>
      <pointLight position={[0, 2, 0]} color={color} intensity={10} distance={8} />
    </group>
  );
}
