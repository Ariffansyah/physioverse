"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group, Mesh } from "three";
import { BAY } from "@/lib/levels";
import { GRAVITY, projectile } from "@/lib/physics";
import { Dim } from "../Gauge";
import { type Body, nudge, stepBody } from "@/lib/collide";
import type { ChamberProps } from "../hall";

const { origin: X0, scale: S } = BAY;
const PIVOT_Y = 0.35;
const BARREL = 1.3;
const MAX_RANGE = 64;

export default function Ballistics({ level, params, runToken, onFinish, onInteract }: ChamberProps) {
  const { rad } = projectile(params.speed, params.angle);

  const shell = useRef<Mesh>(null);
  const flash = useRef<Group>(null);
  const t = useRef(0);
  const live = useRef(false);
  const body = useRef<Body | null>(null);

  useEffect(() => {
    t.current = 0;
    live.current = runToken > 0;
    body.current = null;
    shell.current?.position.set(X0, PIVOT_Y, 0);
  }, [runToken]);

  useFrame(({ camera }, dt) => {
    if (flash.current) flash.current.visible = live.current && t.current < 0.12;

    // setelah mendarat peluru jadi benda biasa: memantul, menggelinding, bisa ditendang
    if (body.current && shell.current) {
      nudge(body.current, camera.position);
      stepBody(body.current, dt, { scale: S, restitution: 0.4 });
      shell.current.position.set(body.current.p.x, body.current.p.y, body.current.p.z);
      return;
    }

    if (!live.current || !shell.current) return;
    t.current += dt;

    const x = params.speed * Math.cos(rad) * t.current;
    const y = params.speed * Math.sin(rad) * t.current - 0.5 * GRAVITY * t.current ** 2;

    shell.current.position.set(X0 + x * S, Math.max(y, 0) * S + PIVOT_Y, 0);

    if (y <= 0 && t.current > 0.05) {
      live.current = false;
      body.current = {
        p: { x: X0 + x * S, y: PIVOT_Y, z: 0 },
        v: {
          x: params.speed * Math.cos(rad) * S,
          y: (params.speed * Math.sin(rad) - GRAVITY * t.current) * S,
          z: 0,
        },
        r: 0.3,
      };
      onFinish(level.solve(params));
    }
  });

  const posts = Array.from(
    { length: Math.floor(MAX_RANGE / level.gauge.tick) },
    (_, i) => i + 1,
  );

  return (
    <group>
      <mesh
        position={[X0, PIVOT_Y, 0]}
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
        <boxGeometry args={[2.2, 1.6, 1.6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[X0, 0.05, 0]}>
        <cylinderGeometry args={[0.72, 0.82, 0.1, 20]} />
        <meshStandardMaterial color="#141a21" metalness={0.7} roughness={0.45} />
      </mesh>
      {[0.42, -0.42].map((z) => (
        <mesh key={z} position={[X0, PIVOT_Y / 2, z]}>
          <boxGeometry args={[0.22, PIVOT_Y, 0.14]} />
          <meshStandardMaterial color="#1a222b" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}

      <group position={[X0, PIVOT_Y, 0]} rotation={[0, 0, rad]}>
        <mesh>
          <sphereGeometry args={[0.28, 20, 20]} />
          <meshStandardMaterial color="#4a535c" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh position={[BARREL / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.19, 0.25, BARREL, 20]} />
          <meshStandardMaterial color="#6b7681" metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh position={[BARREL - 0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.2, 0.035, 12, 24]} />
          <meshStandardMaterial color="#cbb08a" emissive="#cbb08a" emissiveIntensity={0.45} />
        </mesh>
        <group ref={flash} position={[BARREL + 0.3, 0, 0]} visible={false}>
          <mesh>
            <sphereGeometry args={[0.34, 12, 12]} />
            <meshBasicMaterial color="#cbb08a" toneMapped={false} transparent opacity={0.45} />
          </mesh>
          <pointLight color="#cbb08a" intensity={28} distance={12} />
        </group>
      </group>


      {level.marker !== undefined && (
        <Dim
          from={[X0, PIVOT_Y, 2.2]}
          to={[X0 + level.marker * S, PIVOT_Y, 2.2]}
          label={`Jarak meriam ke target: ${level.marker.toFixed(1)} m`}
          tint="#cbb08a"
        />
      )}

      {posts.map((n) => {
        const major = n % level.gauge.major === 0;
        const h = major ? 1.9 : 1.05;
        return (
          <group key={n} position={[X0 + n * level.gauge.tick * S, 0, -2.2]}>
            <mesh position={[0, h / 2, 0]}>
              <boxGeometry args={[0.07, h, 0.07]} />
              <meshStandardMaterial
                color={major ? "#cbb08a" : "#8b949c"}
                emissive={major ? "#cbb08a" : "#8b949c"}
                emissiveIntensity={major ? 0.3 : 0.1}
                roughness={0.7}
              />
            </mesh>
            <mesh position={[0, 0.03, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.06, 2.2]} />
              <meshBasicMaterial color={major ? "#cbb08a" : "#6b7681"} transparent opacity={0.18} />
            </mesh>
          </group>
        );
      })}

      {level.marker !== undefined && (
        <group position={[X0 + level.marker * S, 0, 0]}>
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[level.goal.tolerance * S + 0.35, level.goal.tolerance * S + 0.6, 48]} />
            <meshStandardMaterial color="#7fa9c9" emissive="#7fa9c9" emissiveIntensity={1.1} />
          </mesh>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 6, 8]} />
            <meshBasicMaterial color="#7fa9c9" opacity={0.16} transparent />
          </mesh>
          <pointLight position={[0, 1.5, 0]} color="#7fa9c9" intensity={7} distance={11} />
        </group>
      )}

      <mesh ref={shell} position={[X0, PIVOT_Y, 0]}>
        <sphereGeometry args={[0.3, 20, 20]} />
        <meshStandardMaterial color="#cbb08a" emissive="#cbb08a" emissiveIntensity={1.3} />
      </mesh>
    </group>
  );
}
