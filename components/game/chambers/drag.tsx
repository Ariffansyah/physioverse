"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group, Mesh } from "three";
import { CHAMBERS, WIND } from "@/lib/levels";
import { dragForce, topSpeed } from "@/lib/physics";
import { LinearScale } from "../Gauge";
import type { ChamberProps } from "../hall";

const { carX: X0, mass: MASS, speedup: SPEEDUP } = WIND;
const WHEEL_R = 0.34;


const SCROLL = 0.25;
const LANE = 44;
const DASHES = 22;
const RINGS = 7;
const STREAKS = 26;

const PER_N = 0.0026;


export default function Drag({ level, params, runToken, onFinish, onInteract }: ChamberProps) {
  const tint = CHAMBERS[level.chamber].tint;

  const cd = params.cd ?? WIND.cd;
  const area = params.area ?? WIND.area;


  const cruise = params.thrust !== undefined ? topSpeed(params.thrust, cd, area) : params.speed;
  const thrust = dragForce(cruise, cd, area);

  const road = useRef<Group>(null);
  const tunnel = useRef<Group>(null);
  const wind = useRef<Group>(null);
  const wheels = useRef<Mesh[]>([]);
  const dragArrow = useRef<Group>(null);
  const readout = useRef<HTMLSpanElement>(null);

  const v = useRef(0);
  const shift = useRef(0);
  const t = useRef(0);
  const live = useRef(false);

  useEffect(() => {
    v.current = 0;
    t.current = 0;
    live.current = runToken > 0;
  }, [runToken]);

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05);

    if (live.current) {
      t.current += step;

      const nett = thrust - dragForce(v.current, cd, area);
      v.current = Math.max(0, v.current + (nett / MASS) * step * SPEEDUP);


      if (v.current > cruise * 0.995 || t.current > 6) {
        live.current = false;
        onFinish(level.solve(params));
      }
    }

    shift.current = (shift.current + v.current * SCROLL * step) % LANE;

    if (road.current) road.current.position.x = -shift.current;
    if (tunnel.current) tunnel.current.position.x = -(shift.current % (LANE / RINGS));
    if (wind.current) wind.current.position.x = -((shift.current * 1.6) % 3);
    for (const w of wheels.current) {
      if (w) w.rotation.y -= (v.current * SCROLL * step) / WHEEL_R;
    }

    const now = dragForce(v.current, cd, area);
    if (dragArrow.current) dragArrow.current.scale.x = Math.max(0.001, now * PER_N);
    if (readout.current) {
      readout.current.textContent = `v = ${v.current.toFixed(1)} m/s · hambatan = ${now.toFixed(0)} N`;
    }
  });

  return (
    <group>


      <group ref={road}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[LANE * 2, 6.4]} />
          <meshStandardMaterial color="#121821" roughness={0.95} />
        </mesh>
        {Array.from({ length: DASHES * 2 }, (_, i) => -LANE + i * (LANE / DASHES)).map((x) => (
          <mesh key={x} position={[x, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.1, 0.16]} />
            <meshBasicMaterial color="#8b949c" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>


      <group ref={tunnel}>
        {Array.from({ length: RINGS * 2 }, (_, i) => -LANE + i * (LANE / RINGS)).map((x) => (
          <mesh key={x} position={[X0 + x, 3.1, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[3.2, 0.06, 8, 32]} />
            <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.35} />
          </mesh>
        ))}
      </group>


      <group ref={wind}>
        {Array.from({ length: STREAKS }, (_, i) => i).map((i) => {
          const x = X0 + 6 - (i % 13) * 1.4;
          const y = 0.5 + ((i * 7) % 11) * 0.26;
          const z = -2.4 + ((i * 5) % 9) * 0.6;
          return (
            <mesh key={i} position={[x, y, z]}>
              <boxGeometry args={[0.9, 0.012, 0.012]} />
              <meshBasicMaterial color="#9fd8e4" transparent opacity={0.28} />
            </mesh>
          );
        })}
      </group>

      <group position={[X0, 0, 0]}>
        <mesh
          position={[0, 0.8, 0]}
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
          <boxGeometry args={[4.4, 1.9, 2.2]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>


        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[4.2, 0.5, 1.8]} />
          <meshStandardMaterial color="#b8512f" metalness={0.45} roughness={0.35} />
        </mesh>
        <mesh position={[1.82, 0.4, 0]}>
          <boxGeometry args={[0.5, 0.28, 1.68]} />
          <meshStandardMaterial color="#8d3a1f" metalness={0.45} roughness={0.4} />
        </mesh>


        <mesh position={[-0.35, 1.05, 0]}>
          <boxGeometry args={[1.9, 0.5, 1.58]} />
          <meshStandardMaterial color="#2b3a4a" metalness={0.3} roughness={0.12} />
        </mesh>
        <mesh position={[-0.35, 1.33, 0]}>
          <boxGeometry args={[1.7, 0.1, 1.5]} />
          <meshStandardMaterial color="#b8512f" metalness={0.45} roughness={0.35} />
        </mesh>


        {[0.6, -0.6].map((z) => (
          <mesh key={z} position={[-1.92, 0.92, z]}>
            <boxGeometry args={[0.08, 0.24, 0.08]} />
            <meshStandardMaterial color="#1a222b" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[-1.92, 1.06, 0]}>
          <boxGeometry args={[0.34, 0.07, 1.5]} />
          <meshStandardMaterial color="#1a222b" metalness={0.6} roughness={0.4} />
        </mesh>

        {[0.58, -0.58].map((z) => (
          <mesh key={z} position={[2.07, 0.62, z]}>
            <boxGeometry args={[0.06, 0.14, 0.34]} />
            <meshStandardMaterial color="#ffe9c8" emissive="#ffe9c8" emissiveIntensity={1.4} />
          </mesh>
        ))}
        {[0.6, -0.6].map((z) => (
          <mesh key={z} position={[-2.07, 0.62, z]}>
            <boxGeometry args={[0.06, 0.12, 0.3]} />
            <meshStandardMaterial color="#e0503a" emissive="#e0503a" emissiveIntensity={1.1} />
          </mesh>
        ))}

        {[
          [1.3, 0.9],
          [1.3, -0.9],
          [-1.3, 0.9],
          [-1.3, -0.9],
        ].map(([x, z], i) => (
          <Wheel
            key={`${x},${z}`}
            position={[x, WHEEL_R, z]}
            ref={(m) => {
              if (m) wheels.current[i] = m;
            }}
          />
        ))}


        <group position={[2.3, 1.9, 0]}>
          <Arrow length={thrust * PER_N} color="#6fd49a" />
          <Html position={[0.2, 0.5, 0]} center distanceFactor={16} zIndexRange={[20, 0]}>
            <span className="hud whitespace-nowrap px-2 py-1 font-mono text-[11px] tabular-nums text-[#6fd49a]">
              dorong {thrust.toFixed(0)} N
            </span>
          </Html>
        </group>
        <group ref={dragArrow} position={[-2.3, 1.9, 0]} rotation={[0, Math.PI, 0]} scale={[0.001, 1, 1]}>
          <Arrow length={1} color={tint} />
        </group>

        <Html position={[0, 2.9, 0]} center distanceFactor={16} zIndexRange={[20, 0]}>
          <span
            ref={readout}
            className="hud whitespace-nowrap px-2.5 py-1 font-mono text-[11px] tabular-nums"
            style={{ color: tint, borderColor: tint, pointerEvents: "none" }}
          >
            v = 0.0 m/s
          </span>
        </Html>

        <pointLight position={[0, 2.6, -2.2]} color={tint} intensity={3.5} distance={10} />
      </group>

      <LinearScale
        gauge={level.gauge}
        target={level.goal.target}
        position={[X0 + 5.6, 0, -2.6]}
        tint={tint}
      />
    </group>
  );
}


function Wheel({ position, ref }: { position: [number, number, number]; ref: (m: Mesh | null) => void }) {
  return (
    <mesh ref={ref} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.28, 20]} />
      <meshStandardMaterial color="#14191f" roughness={0.9} />
      {[0.145, -0.145].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
            <meshStandardMaterial color="#9aa6b2" metalness={0.7} roughness={0.35} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} rotation={[0, (k * Math.PI) / 3, 0]}>
              <boxGeometry args={[0.055, 0.016, WHEEL_R * 1.6]} />
              <meshStandardMaterial color="#6f7d8b" metalness={0.6} roughness={0.45} />
            </mesh>
          ))}
        </group>
      ))}
    </mesh>
  );
}


function Arrow({ length, color }: { length: number; color: string }) {
  return (
    <group scale={[length, 1, 1]}>
      <mesh position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 1, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.17, 0.4, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}
