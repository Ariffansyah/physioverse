"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Mesh } from "three";
import { BENCH } from "@/lib/levels";
import { optics } from "@/lib/physics";
import { Dim } from "../Gauge";
import type { ChamberProps } from "../hall";

const PULSE_SECONDS = 1.6;
const AXIS_Y = 3.6;

export default function Photonics({ level, params, runToken, onFinish, onInteract }: ChamberProps) {
  const focal = params.focal ?? 3;
  const { imageX, imageH } = optics(params.lensX, BENCH.objectX, focal, BENCH.objectH);

  const photon = useRef<Mesh>(null);
  const t = useRef(0);
  const live = useRef(false);

  useEffect(() => {
    t.current = 0;
    live.current = runToken > 0;
  }, [runToken]);

  useFrame((_, dt) => {
    if (!live.current || !photon.current) return;
    t.current += dt;

    const p = Math.min(t.current / PULSE_SECONDS, 1);
    const leg = p < 0.5 ? p / 0.5 : (p - 0.5) / 0.5;
    const [ax, ay] = p < 0.5 ? [BENCH.objectX, BENCH.objectH] : [params.lensX, BENCH.objectH];
    const [bx, by] = p < 0.5 ? [params.lensX, BENCH.objectH] : [imageX, imageH];

    photon.current.position.set(ax + (bx - ax) * leg, ay + (by - ay) * leg, 0);
    photon.current.visible = true;

    if (p >= 1) {
      live.current = false;
      photon.current.visible = false;
      onFinish(level.solve(params));
    }
  });

  return (
    <group position={[0, AXIS_Y, 0]}>
      <mesh
        position={[params.lensX, BENCH.objectH / 2, 0]}
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
        <boxGeometry args={[1.2, 2.8, 1.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Line points={[[-14, 0, 0], [14, 0, 0]]} color="#232d37" lineWidth={1} />

      {Array.from({ length: 11 }, (_, i) => BENCH.objectX + i * level.gauge.tick)
        .filter((x) => x <= 12)
        .map((x, i) => (
          <group key={x} position={[x, 0, -2]}>
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[0.05, 0.6, 0.05]} />
              <meshStandardMaterial
                color={i === 0 ? "#e4e8ea" : "#8b949c"}
                emissive={i === 0 ? "#e4e8ea" : "#8b949c"}
                emissiveIntensity={i === 0 ? 0.3 : 0.1}
                roughness={0.7}
              />
            </mesh>
          </group>
        ))}

      <Arrow x={BENCH.objectX} height={BENCH.objectH} color="#e4e8ea" />
      <Arrow x={imageX} height={imageH} color="#cbb08a" />

      <mesh position={[params.lensX, BENCH.objectH / 2, 0]} scale={[0.1, 1, 1]}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshStandardMaterial
          color="#7fa9c9"
          transparent
          opacity={0.22}
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[params.lensX, 0.05, 0]}>
        <boxGeometry args={[0.5, 0.1, 1.2]} />
        <meshStandardMaterial color="#7fa9c9" emissive="#7fa9c9" emissiveIntensity={0.5} />
      </mesh>

      <Focus x={params.lensX - focal} />
      <Focus x={params.lensX + focal} />

      {level.marker !== undefined && (
        <group position={[level.marker, 0, 0]}>
          <mesh position={[0, -1, 0]}>
            <boxGeometry args={[0.15, 5, 2.4]} />
            <meshStandardMaterial
              color="#0a0e12"
              emissive="#cbb08a"
              emissiveIntensity={Math.max(0, 1 - Math.abs(imageX - level.marker)) * 2}
            />
          </mesh>
          <pointLight position={[0, -1, 0]} color="#cbb08a" intensity={10} distance={9} />
        </group>
      )}

      <Dim
        from={[BENCH.objectX, -0.9, 2.4]}
        to={[params.lensX, -0.9, 2.4]}
        label={`s = ${(params.lensX - BENCH.objectX).toFixed(2)} m`}
        tint="#7fa9c9"
      />
      <Dim
        from={[params.lensX, 1.9, 2.4]}
        to={[params.lensX + focal, 1.9, 2.4]}
        label={`f = ${focal.toFixed(2)} m`}
        tint="#9fb3a6"
      />
      {level.marker !== undefined && (
        <Dim
          from={[params.lensX, -1.7, 2.4]}
          to={[level.marker, -1.7, 2.4]}
          label={`lensa ke detektor = ${(level.marker - params.lensX).toFixed(2)} m`}
          tint="#cbb08a"
        />
      )}

      <mesh ref={photon} visible={false}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#e4e8ea" emissive="#e4e8ea" emissiveIntensity={1.4} />
      </mesh>

      {level.marker === undefined && (
        <group position={[9, 0, 0]}>
          <mesh position={[0, -3, 0]}>
            <boxGeometry args={[0.06, 6, 0.06]} />
            <meshStandardMaterial color="#6b7681" roughness={0.7} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => -(i + 1) * level.gauge.tick).map((y) => (
            <mesh key={y} position={[0.22, y, 0]}>
              <boxGeometry args={[0.44, 0.045, 0.045]} />
              <meshStandardMaterial color="#8b949c" emissive="#8b949c" emissiveIntensity={0.12} roughness={0.7} />
            </mesh>
          ))}
          <group position={[0, level.goal.target * BENCH.objectH, 0]}>
            <mesh position={[0.5, 0, 0]}>
              <boxGeometry args={[1, 0.07, 0.07]} />
              <meshStandardMaterial color="#cbb08a" emissive="#cbb08a" emissiveIntensity={0.9} />
            </mesh>
            <mesh position={[1, 0, 0]}>
              <boxGeometry args={[0.07, 0.5, 0.07]} />
              <meshStandardMaterial color="#cbb08a" emissive="#cbb08a" emissiveIntensity={0.9} />
            </mesh>
            <pointLight color="#cbb08a" intensity={6} distance={6} />
          </group>
        </group>
      )}
    </group>
  );
}

function Focus({ x }: { x: number }) {
  return (
    <mesh position={[x, 0, 0]}>
      <sphereGeometry args={[0.14, 14, 14]} />
      <meshStandardMaterial color="#cbb08a" emissive="#cbb08a" emissiveIntensity={0.9} />
    </mesh>
  );
}

function Arrow({ x, height, color }: { x: number; height: number; color: string }) {
  const h = Math.max(Math.abs(height), 0.5);
  return (
    <group position={[x, 0, 0]} scale={[1, height < 0 ? -1 : 1, 1]}>
      <mesh position={[0, (h - 0.4) / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, h - 0.4, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, h - 0.2, 0]}>
        <coneGeometry args={[0.22, 0.4, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} />
      </mesh>
    </group>
  );
}
