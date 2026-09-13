"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Mesh } from "three";
import { COURT, courtX, courtY } from "@/lib/levels";
import { GRAVITY } from "@/lib/physics";
import { Dim } from "../Gauge";
import { type Body, box, nudge, stepBody, touches } from "@/lib/collide";
import type { ChamberProps } from "../hall";

const { origin: X0, scale: S, releaseH: defaultReleaseH, hoopH } = COURT;
const M = S;
const BALL_R = 0.175;
const SKIN = "#c2a98a";
const JERSEY = "#e8a04a";
const SHORTS = "#a3682a";
const SEAMS = [
  [0, 0, 0],
  [0, Math.PI / 2, 0],
  [Math.PI / 2, 0, 0],
] as const;

export default function Court({ level, params, runToken, onFinish, onInteract }: ChamberProps) {
  const releaseH = (params.h0 as number) ?? defaultReleaseH;
  const hoopDist = level.marker ?? 8;
  const hoopX = courtX(hoopDist);
  const releaseX = X0;
  const rad = (params.angle * Math.PI) / 180;
  const vx = params.speed * Math.cos(rad);
  const vy = params.speed * Math.sin(rad);

  const ball = useRef<Mesh>(null);
  const t = useRef(0);
  const live = useRef(false);
  const body = useRef<Body | null>(null);

  const hoopY = hoopH * M + 0.08;
  // papan pantul + dua sisi ring: yang bikin lemparan meleset berbunyi clank
  const rig = useMemo(
    () => [
      box(hoopX + 0.35, hoopY + 0.55, 0, 0.04, 0.55, 0.8),
      box(hoopX - 0.45, hoopY, 0, 0.06, 0.06, 0.5),
      box(hoopX + 0.45, hoopY, 0, 0.06, 0.06, 0.5),
    ],
    [hoopX, hoopY],
  );

  useEffect(() => {
    t.current = 0;
    live.current = runToken > 0;
    body.current = null;
    ball.current?.position.set(releaseX, courtY(releaseH), 0);
    ball.current?.rotation.set(0, 0, 0);
  }, [runToken, releaseX, releaseH]);

  useFrame(({ camera }, dt) => {
    if (body.current && ball.current) {
      nudge(body.current, camera.position);
      stepBody(body.current, dt, { boxes: rig, floorY: courtY(0), scale: M, restitution: 0.6 });
      ball.current.position.set(body.current.p.x, body.current.p.y, body.current.p.z);
      ball.current.rotation.z -= dt * 5;
    }

    if (!live.current || !ball.current) return;
    t.current += dt;
    const x = vx * t.current;
    const y = releaseH + vy * t.current - 0.5 * GRAVITY * t.current ** 2;
    if (y <= 0.12) {
      live.current = false;
      onFinish(level.solve(params));
      return;
    }
    if (body.current) return;

    ball.current.position.set(courtX(x), courtY(y), 0);
    ball.current.rotation.z += dt * 7;

    // kena ring atau papan: fisika ambil alih tampilannya, skor tetap dari solve()
    if (touches(courtX(x), courtY(y), 0, BALL_R, rig)) {
      body.current = {
        p: { x: courtX(x), y: courtY(y), z: 0 },
        v: { x: vx * M, y: (vy - GRAVITY * t.current) * M, z: 0 },
        r: BALL_R,
      };
    }
    const flightEst = (vy + Math.sqrt(vy * vy + 2 * GRAVITY * releaseH)) / GRAVITY;
    if (t.current > flightEst + 0.2) {
      live.current = false;
      onFinish(level.solve(params));
    }
  });

  const lift = Math.max(0, courtY(releaseH) - courtY(2));
  const handY = courtY(releaseH) - lift;
  const footY = courtY(0.06);
  const kneeY = courtY(0.52);
  const hipY = courtY(0.95);
  const shoulderY = courtY(1.5);
  const headY = courtY(1.7);
  const zSide = 0.13 * M;

  const upperArm = 0.31 * M;
  const foreArm = 0.29 * M;
  const reachY = handY - shoulderY;
  const reach = Math.min(Math.max(Math.abs(reachY), 0.02), upperArm + foreArm - 0.01);
  const along = (reach ** 2 + upperArm ** 2 - foreArm ** 2) / (2 * reach);
  const elbow: [number, number] = [
    -Math.sqrt(Math.max(upperArm ** 2 - along ** 2, 0)),
    shoulderY + along * Math.sign(reachY || 1),
  ];

  const thrust = level.controls.find((c) => c.key === "speed");
  const power = thrust ? (params.speed - thrust.min) / (thrust.max - thrust.min) : 0.5;
  const aimLen = (0.4 + power * 0.9) * M;

  return (
    <group>
      <mesh position={[courtX(hoopDist / 2), 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[hoopDist * S + 2, 5.6]} />
        <meshBasicMaterial color="#e8a04a" transparent opacity={0.06} />
      </mesh>
      {Array.from({ length: Math.floor(hoopDist / 2) + 1 }, (_, i) => i * 2).map((d) => (
        <group key={d} position={[courtX(d), 0, -3.1]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.05, 0.7, 0.05]} />
            <meshStandardMaterial
              color={d === hoopDist ? "#e8a04a" : "#6b7681"}
              emissive={d === hoopDist ? "#e8a04a" : "#6b7681"}
              emissiveIntensity={d === hoopDist ? 0.6 : 0.12}
            />
          </mesh>
          <mesh position={[0, 0.024, 1.55]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.05, 3.1]} />
            <meshBasicMaterial color="#6b7681" transparent opacity={0.1} />
          </mesh>
        </group>
      ))}

      <group position={[releaseX, lift, 0]}>
        <mesh
          position={[0, handY, 0]}
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
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {[zSide, -zSide].map((z) => (
          <group key={z}>
            <Limb a={[-0.03 * M, footY]} b={[0.02 * M, kneeY]} z={z} r={0.072 * M} color={SKIN} />
            <Limb a={[0.02 * M, kneeY]} b={[0, hipY]} z={z} r={0.086 * M} color={SHORTS} />
            <mesh position={[0.05 * M, footY - 0.035 * M, z]}>
              <boxGeometry args={[0.27 * M, 0.09 * M, 0.13 * M]} />
              <meshStandardMaterial color="#1a2028" roughness={0.85} />
            </mesh>
          </group>
        ))}

        <Limb a={[0, hipY - 0.04 * M]} b={[0, shoulderY]} z={0} r={0.155 * M} color={JERSEY} />
        <Limb a={[0, shoulderY]} b={[0, headY - 0.08 * M]} z={0} r={0.052 * M} color={SKIN} />
        <mesh position={[0, headY, 0]}>
          <sphereGeometry args={[0.115 * M, 20, 20]} />
          <meshStandardMaterial color={SKIN} roughness={0.72} />
        </mesh>

        {[zSide + 0.02 * M, -zSide - 0.02 * M].map((z) => (
          <group key={z}>
            <Limb a={[0, shoulderY]} b={elbow} z={z} r={0.06 * M} color={SKIN} />
            <Limb a={elbow} b={[0, handY]} z={z} r={0.052 * M} color={SKIN} />
          </group>
        ))}

        <group position={[0, handY, 0]} rotation={[0, 0, rad]}>
          <mesh position={[aimLen / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02 * M, 0.02 * M, aimLen, 10]} />
            <meshStandardMaterial color="#cbb08a" emissive="#cbb08a" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[aimLen, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.055 * M, 0.17 * M, 12]} />
            <meshStandardMaterial color="#cbb08a" emissive="#cbb08a" emissiveIntensity={0.5} />
          </mesh>
        </group>

        <pointLight position={[0.35, shoulderY, 0]} color={JERSEY} intensity={4} distance={6} />
      </group>

      <group position={[hoopX, 0, 0]}>
        <mesh position={[0.6, hoopY - 1.1, 0]}>
          <boxGeometry args={[0.22, hoopH * S + 0.4, 0.22]} />
          <meshStandardMaterial color="#141a21" roughness={0.5} metalness={0.5} />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => i * 0.5).map((h) => (
          <mesh key={h} position={[0.85, courtY(h), 0]}>
            <boxGeometry args={[h === hoopH ? 0.5 : 0.32, 0.035, 0.035]} />
            <meshStandardMaterial
              color={h === hoopH ? "#e8a04a" : "#8b949c"}
              emissive={h === hoopH ? "#e8a04a" : "#8b949c"}
              emissiveIntensity={h === hoopH ? 0.8 : 0.15}
            />
          </mesh>
        ))}
        <mesh position={[0.35, hoopY + 0.55, 0]}>
          <boxGeometry args={[0.08, 1.1, 1.6]} />
          <meshStandardMaterial color="#e4e8ea" transparent opacity={0.92} roughness={0.25} />
        </mesh>
        <mesh position={[0, hoopY, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.45, 0.06, 14, 28]} />
          <meshStandardMaterial color="#e8a04a" emissive="#e8a04a" emissiveIntensity={0.85} />
        </mesh>
        <mesh position={[0, hoopY - 0.35, 0]}>
          <cylinderGeometry args={[0.43, 0.28, 0.7, 16, 1, true]} />
          <meshStandardMaterial color="#e4e8ea" transparent opacity={0.18} side={2} />
        </mesh>
        <pointLight position={[0, hoopY, 0]} color="#e8a04a" intensity={5} distance={7} />
        <group position={[1.2, hoopY / 2, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.02, hoopY, 0.02]} />
            <meshBasicMaterial color="#6b7681" transparent opacity={0.45} />
          </mesh>
        </group>
      </group>

      <mesh ref={ball} position={[releaseX, courtY(releaseH), 0]}>
        <sphereGeometry args={[BALL_R, 32, 32]} />
        <meshStandardMaterial
          color="#c2571f"
          emissive="#c2571f"
          emissiveIntensity={0.12}
          roughness={0.88}
          metalness={0.02}
        />
        {SEAMS.map((r) => (
          <mesh key={r.join()} rotation={r}>
            <torusGeometry args={[BALL_R * 0.99, BALL_R * 0.045, 8, 40]} />
            <meshStandardMaterial color="#331d10" roughness={0.92} />
          </mesh>
        ))}
      </mesh>

      <Dim
        from={[releaseX, 0.08, 2.7]}
        to={[hoopX, 0.08, 2.7]}
        label={`x = ${hoopDist.toFixed(1)} m ke ring`}
        tint="#cbb08a"
      />
      <Dim
        from={[hoopX, 0.08, -2.4]}
        to={[hoopX, hoopY, -2.4]}
        label={`Tinggi ring = ${hoopH.toFixed(1)} m`}
        tint="#e8a04a"
      />
      <Dim
        from={[releaseX, 0.08, -2.4]}
        to={[releaseX, courtY(releaseH), -2.4]}
        label={`h₀ = ${releaseH.toFixed(1)} m`}
        tint="#7fa9c9"
      />
    </group>
  );
}

function Limb({
  a,
  b,
  z,
  r,
  color,
}: {
  a: [number, number];
  b: [number, number];
  z: number;
  r: number;
  color: string;
}) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  return (
    <mesh
      position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z]}
      rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]}
    >
      <capsuleGeometry args={[r, Math.max(len - 2 * r, 0.01), 4, 12]} />
      <meshStandardMaterial color={color} roughness={0.75} />
    </mesh>
  );
}
